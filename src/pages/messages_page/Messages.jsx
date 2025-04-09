import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Messages() {
  const { user } = useAuth();
  console.log("Current user:", user);

  // Add the message notifications hook
  useMessageNotifications(user?.id);

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useConversations(user?.id);
  console.log("Conversations data:", conversations);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Restore selected conversation from sessionStorage when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      const savedConversationId = sessionStorage.getItem(
        "selectedConversationId"
      );
      if (savedConversationId) {
        const conversation = conversations.find(
          (c) => c.id === savedConversationId
        );
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    }
  }, [conversations, selectedConversation]);

  // Save selected conversation ID to sessionStorage
  useEffect(() => {
    if (selectedConversation) {
      sessionStorage.setItem("selectedConversationId", selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Update selected conversation when conversations data changes
  useEffect(() => {
    if (selectedConversation && conversations) {
      const updatedConversation = conversations.find(
        (c) => c.id === selectedConversation.id
      );
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (selectedConversation?.messages?.length > 0) {
      // Use instant scroll for initial load
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [selectedConversation?.messages]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const queryClient = useQueryClient();

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    setIsDrawerOpen(false);

    // Mark messages as read and scroll to bottom instantly
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        // Update the local state to reflect read status
        const updatedConversation = {
          ...conversation,
          messages: conversation.messages.map((msg) => ({
            ...msg,
            read: msg.sender_id === user.id ? msg.read : true,
          })),
          unread: 0,
        };
        setSelectedConversation(updatedConversation);
        // Scroll to bottom instantly after selecting conversation
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }, 0);

        // Update the conversations list in the cache
        queryClient.setQueryData(["conversations", user.id], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((conv) => {
            if (conv.id === conversation.id) {
              return {
                ...conv,
                unread: 0,
                messages: conv.messages.map((msg) => ({
                  ...msg,
                  read: msg.sender_id === user.id ? msg.read : true,
                })),
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error("Error in handleConversationSelect:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Save message to database
      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          message_content: newMessage,
          created_at: new Date().toISOString(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving message:", error);
        throw error;
      }

      console.log("Saved message:", message);

      // Update local state
      const newMessageObj = {
        id: message.id,
        senderId: user.id,
        content: message.message_content,
        timestamp: message.created_at,
        read: message.is_read,
      };

      console.log("New message object:", newMessageObj);

      const updatedConversation = {
        ...selectedConversation,
        messages: [...(selectedConversation.messages || []), newMessageObj],
      };

      console.log("Updated conversation:", updatedConversation);

      setSelectedConversation(updatedConversation);
      setNewMessage("");

      // Update conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation.id);

      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Failed to send message");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden fixed inset-x-0 top-14 bottom-0">
      {/* Main Message Area */}
      <div className="h-full flex flex-col relative">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-white shadow-md sticky top-0 z-20">
          {/* MESSAGE LEFT DRAWER -------------------------------------------------------------- */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            {/* DRAWER HAMBURGER BUTTON */}
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-colors duration-500 ease-in-out"
              >
                <Menu className="h-5 w-5 text-primary" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[300px] h-[calc(100vh-3rem)] top-[3rem] p-0 bg-white border-r border-gray-200 shadow-lg transition-transform duration-500 ease-in-out z-60 fixed"
            >
              {/* DRAWER TITLE */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-800">
                  Messages
                </h2>
              </div>

              {/* CONVERSATION LIST */}
              <ScrollArea className="h-[calc(100%-4rem)]">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-medium text-primary mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-sm text-lightgray mb-4 px-4">
                      Start connecting with people to see your conversations
                      here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <Button
                        key={conversation.id}
                        variant={
                          selectedConversation?.id === conversation.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full h-16 justify-start gap-4 p-4 transition-all duration-500 ease-in-out rounded-lg"
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <Avatar className="h-10 w-10 transition-transform duration-500 ease-in-out hover:scale-105">
                          <AvatarImage
                            src={conversation.avatar}
                            className="object-contain"
                          />
                          <AvatarFallback>
                            {conversation.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-primary">
                            {conversation.name}
                          </span>
                          <span className="text-sm text-muted-foreground truncate max-w-[180px] font-light">
                            {conversation.lastMessage}
                          </span>
                        </div>
                        {conversation.unread > 0 && (
                          <div className="ml-auto bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-transform duration-500 ease-in-out hover:scale-110">
                            {conversation.unread}
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* MESSAGE MAIN VIEW ( HEADER ) -------------------------------------------------------------- */}
          {selectedConversation ? (
            // CONVERSATION SELECTED
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedConversation.name}</h3>
              </div>
            </>
          ) : (
            // NO CONVERSATION SELECTED
            <div className="flex-1">
              <h3 className="font-medium text-darkgray">
                Select a conversation
              </h3>
            </div>
          )}
        </div>

        {/* MESSAGE MAIN VIEW ( BODY ) -------------------------------------------------------------- */}
        {selectedConversation ? (
          // CONVERSATION SELECTED
          <>
            <ScrollArea className="flex-1 p-4 pb-36 overflow-y-auto">
              <div className="space-y-4 max-w-2xl mx-auto">
                {selectedConversation.messages?.map((message) => {
                  console.log("Rendering message:", message);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 max-w-[70%] ${
                          message.senderId === user.id
                            ? "bg-primary text-white"
                            : "bg-white text-primary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span
                          className={`text-xs ${
                            message.senderId === user.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* MESSAGE INPUT */}
            <div className="p-4 bg-white border-t border-gray-200 fixed bottom-[5.2rem] left-0 right-0 z-20">
              <div className="flex gap-2 max-w-2xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 focus:ring-darkgray"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // NO CONVERSATION SELECTED
          <div className="flex-1 flex justify-center items-center mb-50">
            <div className="text-center space-y-4 p-8">
              <MessageSquare className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">
                No conversation selected
              </h3>
              <p className="text-sm text-lightgray max-w-sm px-6">
                Select a conversation from the menu or start a new one to begin
                messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
