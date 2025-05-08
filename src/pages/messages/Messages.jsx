import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { groupMessagesByDate } from "@/utils/messageUtils";

// UI COMPONENTS
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Send, Menu } from "lucide-react";

// SHARED COMPONENTS
import ErrorComponent from "@/components/ErrorComponent";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "./components/LoadingState";
import DrawerConversationList from "./components/DrawerConversationList";
import MessageBubble from "./components/MessageBubble";

export default function Messages() {
  const { user } = useAuth();
  const { conversationId } = useParams();
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

  // SYNC SELECTED CONVERSATION WITH URL or SESSION ---------------------------------------------------------------
  useEffect(() => {
    if (!conversations.length) return;

    const conversation = conversationId
      ? conversations.find((c) => String(c.id) === String(conversationId))
      : conversations.find(
          (c) =>
            String(c.id) ===
            String(sessionStorage.getItem("selectedConversationId"))
        );

    if (conversation) {
      setSelectedConversation(conversation);
      sessionStorage.setItem("selectedConversationId", conversation.id);
      if (!conversationId)
        navigate(`/messages/${conversation.id}`, { replace: true });
    }
  }, [conversations, conversationId, navigate]);

  // Scroll to bottom on initial load and message change ---------------------------------------------------------------
  useEffect(() => {
    if (selectedConversation?.messages?.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" }); // Use instant scroll for initial load
    }
  }, [selectedConversation?.messages]);

  // Lock body scroll when drawer is open ---------------------------------------------------------------
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

  // HANDLE CONVERSATION SELECT ---------------------------------------------------------------
  const handleConversationSelect = async (conversation) => {
    if (!conversation) return;

    navigate(`/messages/${conversation.id}`, { replace: false }); // Update the URL first

    setSelectedConversation(conversation); // Then update the selected conversation
    setIsDrawerOpen(false);

    sessionStorage.setItem("selectedConversationId", conversation.id); // Store the selected conversation ID in sessionStorage

    try {
      await markMessagesAsRead.mutateAsync(conversation.id); // Mark messages as read in the database

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" }); // Scroll to bottom instantly after selecting conversation
      }, 0);
    } catch (error) {
      console.error("Error in handleConversationSelect:", error);
    }
  };

  // HANDLE SEND MESSAGE ---------------------------------------------------------------
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

  // LOADING AND ERROR HANDLERS ---------------------------------------------------------------
  if (isLoading) {
    return <LoadingState />;
  }
  if (error) return <ErrorComponent message={error.message} />;

  return (
    <div className="h-[calc(100vh-4rem)] max-w-sm mx-auto flex flex-col overflow-hidden fixed inset-x-0 top-14 bottom-0">
      <div className="h-full flex flex-col relative">
        {/* HEADER SECTION =============================================================== */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-white shadow-md sticky top-0 z-20">
          {/* DRAWER -------------------------------------------------------------- */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            {/* HAMBURGER BUTTON */}
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-colors duration-500 ease-in-out"
              >
                <Menu className="h-5 w-5 text-primary" />
              </Button>
            </SheetTrigger>

            {/* SHEET CONTENT ------------------------------------ */}
            <SheetContent
              side="left"
              className="w-[300px] h-[calc(100vh-3rem)] top-[3rem] p-0 bg-white border-r border-gray-200 shadow-lg transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-60 fixed"
            >
              {/* DRAWER CONVERSATION LIST COMPONENT ------------------------------------ */}
              <DrawerConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={handleConversationSelect}
              />
            </SheetContent>
          </Sheet>

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
              <div className="flex-1">
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

        {/* BODY =============================================================== */}
        {selectedConversation ? (
          // CONVERSATION SELECTED
          <>
            <ScrollArea className="flex-1 px-4 pb-36 overflow-y-auto">
              <div className="space-y-4 max-w-2xl mx-auto pt-4">
                {Object.entries(
                  groupMessagesByDate(selectedConversation.messages)
                ).map(([date, messages]) => (
                  <div key={date} className="space-y-4">
                    {/* Date Label */}
                    <div className="text-center">
                      <span className="text-xs text-gray-500">{date}</span>
                    </div>

                    {messages.map((msg) => (
                      // MESSAGE BUBBLE COMPONENT --------------------------------------------------------------
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isFromCurrentUser={msg.senderId === user.id}
                      />
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* MESSAGE INPUT SECTION =============================================================== */}
            <div className="max-w-sm mx-auto p-4 bg-white border-t border-gray-200 fixed bottom-[5.2rem] left-0 right-0 z-20">
              <div className="flex gap-2 max-w-2xl mx-auto">
                {/* INPUT */}
                <Input
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 focus:ring-darkgray rounded-full cursor-pointer text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* SEND MESSAGE BUTTON */}
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // NO CONVERSATION EMPTY STATE ----------------------------------------------
          <div className="flex-1 flex justify-center items-center mb-50">
            <EmptyState
              title="No conversation selected"
              description="Select a conversation from the menu or start a new one to begin messaging"
              className="text-center space-y-4 p-8"
            />
          </div>
        )}
      </div>
    </div>
  );
}
