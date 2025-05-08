import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function DrawerConversationList({
  conversations,
  selectedId,
  onSelect,
}) {
  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <Button
          key={conversation.id}
          variant={selectedId?.id === conversation.id ? "secondary" : "ghost"}
          className="w-full h-16 justify-start gap-4 p-4 transition-all duration-500 ease-in-out rounded-lg"
          onClick={() => onSelect(conversation)}
        >
          <Avatar className="h-12 w-12 transition-transform duration-500 ease-in-out hover:scale-105">
            <AvatarImage src={conversation.avatar} className="object-cover" />
            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-bold text-primary">{conversation.name}</span>
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
  );
}
