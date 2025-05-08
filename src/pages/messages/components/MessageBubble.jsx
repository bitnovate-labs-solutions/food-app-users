import { formatTime } from "@/utils/formatTime";

export default function MessageBubble({ message, isFromCurrentUser }) {
  return (
    <div
      className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col rounded-2xl p-3 max-w-[70%] min-w-[25%] shadow-md ${
          isFromCurrentUser ? "bg-primary text-white" : "bg-white text-primary"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex justify-end items-center gap-1 text-[11px] font-extralight">
          <span
            className={
              isFromCurrentUser
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            }
          >
            {formatTime(message.timestamp)}
          </span>
          {isFromCurrentUser && (
            <span className="text-primary-foreground/70">Sent</span>
          )}
        </div>
      </div>
    </div>
  );
}

{
  /* <div
  key={message.id}
  className={`flex ${
    message.senderId === user.id ? "justify-end" : "justify-start"
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
    <div className="flex justify-end items-center gap-1">
      <span
        className={`text-[11px] font-extralight ${
          message.senderId === user.id
            ? "text-primary-foreground/70"
            : "text-muted-foreground"
        }`}
      >
        {formatTime(message.timestamp)}
      </span>
      {message.senderId === user.id && (
        <span className="text-[11px] text-primary-foreground/70">Sent</span>
      )}
    </div>
  </div>
</div>; */
}
