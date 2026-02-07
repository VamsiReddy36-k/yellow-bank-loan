import { Bot, User } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: Date;
  component?: React.ReactNode;
  typing?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAgent = message.role === "agent";

  return (
    <div className={`flex gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}>
      {isAgent && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? "bg-agent-bubble text-agent-bubble-foreground rounded-tl-md"
              : "bg-user-bubble text-user-bubble-foreground rounded-tr-md"
          }`}
        >
          {message.typing ? (
            <div className="flex gap-1 py-1">
              <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {message.component && (
          <div className="pl-1">{message.component}</div>
        )}
        <p className={`text-[10px] text-muted-foreground ${isAgent ? "text-left" : "text-right"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {!isAgent && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-accent-foreground" />
        </div>
      )}
    </div>
  );
}
