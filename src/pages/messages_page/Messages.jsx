import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { formatTime } from "@/utils/formatTime";
import { useParams, useNavigate } from "react-router-dom";

// COMPONENTS
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ErrorComponent from "@/components/ErrorComponent";

export default function Messages() {
  const { user } = useAuth();
  const { conversationId: urlConversationId } = useParams();
  const navigate = useNavigate();

  // Add the message notifications hook
  useMessageNotifications(user?.id);

  const {
    data: conversations = [],
    isLoading,
    error,
    sendMessage,
    markMessagesAsRead,
  } = useConversations(user?.id);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Update selected conversation based on URL parameter
  useEffect(() => {
    if (conversations.length > 0) {
      if (urlConversationId) {
        const conversation = conversations.find(
          (c) => String(c.id) === String(urlConversationId)
        );
        if (conversation) {
          setSelectedConversation(conversation);
        }
      } else if (!selectedConversation) {
        const savedConversationId = sessionStorage.getItem(
          "selectedConversationId"
        );
        if (savedConversationId) {
          const conversation = conversations.find(
            (c) => String(c.id) === String(savedConversationId)
          );
          if (conversation) {
            navigate(`/messages/${conversation.id}`, { replace: true });
          }
        }
      }
    }
  }, [conversations, urlConversationId, navigate]);

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

  // HANDLE CONVERSATION SELECT
  const handleConversationSelect = async (conversation) => {
    if (!conversation) return;

    // Update the URL first
    navigate(`/messages/${conversation.id}`, { replace: false });

    // Then update the selected conversation
    setSelectedConversation(conversation);
    setIsDrawerOpen(false);

    try {
      // Mark messages as read in the database
      await markMessagesAsRead.mutateAsync(conversation.id);

      // Scroll to bottom instantly after selecting conversation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }, 0);
    } catch (error) {
      console.error("Error in handleConversationSelect:", error);
    }
  };

  // HANDLE SEND MESSAGE
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
      });

      // Clear input immediately
      setNewMessage("");
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    }
  };

  // LOADING AND ERROR HANDLERS
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

  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="h-[calc(100vh-4rem)] max-w-sm mx-auto flex flex-col overflow-hidden fixed inset-x-0 top-14 bottom-0">
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
                        <Avatar className="h-12 w-12 transition-transform duration-500 ease-in-out hover:scale-105">
                          <AvatarImage
                            src={conversation.avatar}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {conversation.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-primary">
                            {conversation.name}
                          </span>
                          <span className="text-sm text-muted-foreground truncate max-w-[180px] font-light">
                            {conversation.lastMessage}
                          </span>
                        </div>
                        {/* TO FIX THIS LATER (CONVERSATION LIST UNREAD COUNT NOTIFICATION) */}
                        {/* {conversation.unread > 0 && (
                          <div className="ml-auto bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-transform duration-500 ease-in-out hover:scale-110">
                            {conversation.unread}
                          </div>
                        )} */}
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
              <Avatar className="h-11 w-11">
                <AvatarImage
                  src={selectedConversation.avatar}
                  className="object-cover"
                />
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
            <ScrollArea className="flex-1 px-4 pb-36 overflow-y-auto">
              <div className="space-y-4 max-w-2xl mx-auto">
                {selectedConversation.messages?.map((message) => {
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
                        className={`flex flex-col rounded-2xl p-3 max-w-[70%] min-w-[25%] shadow-md break-words ${
                          message.senderId === user.id
                            ? "bg-primary text-white"
                            : "bg-white text-primary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words overflow-hidden">
                          {message.content}
                        </p>
                        <span
                          className={`text-[11px] flex justify-end font-extralight mt-1 ${
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
            <div className="max-w-sm mx-auto p-4 bg-white border-t border-gray-200 fixed bottom-[5.2rem] left-0 right-0 z-20">
              <div className="flex gap-2 max-w-2xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 focus:ring-darkgray rounded-full"
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
