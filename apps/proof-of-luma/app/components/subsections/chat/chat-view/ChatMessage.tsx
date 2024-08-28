import React from 'react';
import Image from "next/image";

/**
 * ChatMessage Component
 * 
 * This component renders an individual chat message.
 * It displays the user's profile photo, pseudonym, message content, and timestamp.
 * 
 * Features:
 * - Conditionally renders profile photo if available
 * - Displays pseudonym in blue
 * - Obfuscates message content for non-whitelisted users
 * - Supports background images for messages
 * - Applies hover effects and styling for better user experience
 * 
 * @param chat - An object containing chat message data
 * @param isWhitelisted - A boolean indicating whether the current user is whitelisted
 */
function ChatMessage({ chat, isWhitelisted }: {
    chat: any;
    isWhitelisted: boolean;
}) {
  const obfuscateMessage = (message: string) => {
    const words = message.split(' ');
    return words.map(word => {
      if (word.length <= 3) return word;
      const obfuscatedPart = '*'.repeat(word.length - 2);
      return word[0] + obfuscatedPart + word[word.length - 1];
    }).join(' ');
  };

  return (
    <div
      className="flex gap-4 items-center rounded-xl border border-[#2C2C2C] bg-gray-900 p-4 hover:bg-gray-800 transition duration-300"
      style={{
        backgroundImage: chat.messageImageURL ? `url(${chat.messageImageURL})` : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {chat.profilePhotoURL && (
        <Image
          width={40}
          height={40}
          src={chat.profilePhotoURL}
          alt={`${chat.pseudoName}'s profile`}
          className="w-12 h-12 rounded-full object-cover"
        />
      )}
      <div className="w-full">
        <div className="text-xl font-semibold mb-2 text-blue-400">
          {chat.pseudoName}
        </div>
        <div
          className="text-white whitespace-pre-wrap"
          style={{
            background: chat.messageImageURL ? "rgba(0, 0, 0, 0.1)" : "transparent",
            padding: chat.messageImageURL ? "10px" : "0",
          }}
        >
          {isWhitelisted ? chat.message : obfuscateMessage(chat.message)}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {chat.date.toDate().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;