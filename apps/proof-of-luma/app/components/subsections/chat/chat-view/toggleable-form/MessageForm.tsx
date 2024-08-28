import React from "react";

/**
 * MessageForm Component
 * 
 * This component renders a form for users to submit messages and upload media.
 * It provides an interface for entering text messages and optionally uploading
 * image or GIF files as message backgrounds.
 * 
 * Features:
 * - Text input for message content
 * - File upload for image/GIF as message background
 * - Submit button to post the message
 * - Styled with Tailwind CSS for a modern, responsive design
 * 
 * @param {Object} props - Component props
 * @param {function} props.handleSubmit - Handler for form submission
 * @param {Object} props.newMessage - Object containing the current message state
 * @param {function} props.setNewMessage - Function to update the message state
 * @param {function} props.handleMessageMediaUpload - Handler for media file upload
 * 
 * @returns {JSX.Element} Rendered MessageForm component
 */
const MessageForm = ({
  handleSubmit,
  newMessage,
  setNewMessage,
  handleMessageMediaUpload,
}: {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    newMessage: { pseudoName: string; message: string };
    setNewMessage: React.Dispatch<React.SetStateAction<{ pseudoName: string; message: string }>>;
    handleMessageMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="messageMedia" className="text-white opacity-50 text-sm">
        Upload Image/GIF as message background (optional). .GIFs FILES ONLY!
      </label>
      <input
        id="messageMedia"
        type="file"
        accept="image/*,image/gif"
        onChange={handleMessageMediaUpload}
        className="text-white"
      />
      <label htmlFor="message" className="text-white">
        Message
      </label>
      <input
        id="message"
        type="text"
        className="border border-[#2C2C2C] bg-gray-800 text-white rounded-md p-2 flex-grow focus:outline-none focus:border-blue-500 transition duration-300"
        value={newMessage.message}
        placeholder="Type your message"
        onChange={(e) =>
          setNewMessage({ ...newMessage, message: e.target.value })
        }
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Post
      </button>
    </form>
  );
};

export default MessageForm;
