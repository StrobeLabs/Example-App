import React from "react";
import ChatMessage from "./ChatMessage";

/**
 * ChatList Component
 * 
 * This component renders a list of chat messages.
 * It receives an array of chat objects and the user's whitelist status as props.
 * 
 * Features:
 * - Renders a vertical list of ChatMessage components
 * - Passes individual chat data and whitelist status to each ChatMessage
 * - Uses unique chat IDs as keys for efficient rendering
 * 
 * @param chats - An array of chat objects to be displayed
 * @param isWhitelisted - A boolean indicating whether the current user is whitelisted
 */
function ChatList({
  chats,
  isWhitelisted,
}: {
  chats: any[];
  isWhitelisted: boolean;
}) {
  return (
    <div className="flex flex-col mt-4 gap-4">
      {chats.map((chat) => (
        <ChatMessage key={chat.id} chat={chat} isWhitelisted={isWhitelisted} />
      ))}
    </div>
  );
}

export default ChatList;
