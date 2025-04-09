import { useState, useRef, useEffect } from "react";

// COMPONENTS
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Menu, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mockConversations } from "@/mock_data/messages";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setIsDrawerOpen(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // In a real app, this would send to an API
    const newMessageObj = {
      id: selectedConversation.messages.length + 1,
      senderId: 1, // Assuming current user is senderId 1
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessageObj],
    });
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      {/* Main Message Area */}
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-white shadow-md">
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
              className="w-[300px] h-[calc(100vh-3rem)] top-[3rem] p-0 bg-white border-r border-gray-200 shadow-lg transition-transform duration-500 ease-in-out"
            >
              {/* DRAWER TITLE */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-800">
                  Messages
                </h2>
              </div>

              {/* CONVERSATION LIST */}
              <ScrollArea className="h-[calc(100%-4rem)]">
                {mockConversations.length === 0 ? (
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
                    {mockConversations.map((conversation) => (
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
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            {conversation.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {conversation.name}
                          </span>
                          <span className="text-sm text-muted-foreground truncate max-w-[180px]">
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
                {/* <p className="text-sm text-muted-foreground">Online</p> */}
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
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-2xl mx-auto">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === 1 ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[70%] ${
                        message.senderId === 1
                          ? "bg-primary text-white"
                          : "bg-white text-primary"
                      }`}
                    >
                      <p>{message.content}</p>
                      <span
                        className={`text-xs ${
                          message.senderId === 1
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* MESSAGE INPUT */}
            <div className="p-4 bg-white border-t border-gray-200 mb-[4.3rem] z-100">
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
