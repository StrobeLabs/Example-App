import React from 'react';

/**
 * PseudoNameForm Component
 * 
 * This component renders a form for users to set or update their pseudoname.
 * It provides a visually appealing interface with a gradient background and
 * responsive design.
 * 
 * Features:
 * - Displays different messages for new users and users updating their pseudoname
 * - Provides an input field for entering/editing the pseudoname
 * - Handles form submission for updating the pseudoname
 * - Applies custom styling for a modern and engaging user interface
 * 
 * @param {Object} props - Component props
 * @param {string} props.pseudoName - Current pseudoname of the user
 * @param {Object} props.newMessage - Object containing the current message state
 * @param {function} props.setNewMessage - Function to update the message state
 * @param {function} props.handlePseudoNameUpdate - Handler for pseudoname form submission
 * 
 * @returns {JSX.Element} Rendered PseudoNameForm component
 */
const PseudoNameForm = ({ pseudoName, newMessage, setNewMessage, handlePseudoNameUpdate }:{
    pseudoName: string;
    newMessage: { pseudoName: string; message: string };
    setNewMessage: React.Dispatch<React.SetStateAction<{ pseudoName: string; message: string }>>;
    handlePseudoNameUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg mb-6 bg-opacity-25">
      <h2 className="text-2xl font-bold text-white mb-4">
        {pseudoName ? "Edit your pseudoname" : "Welcome to ChatScene!"}
      </h2>
      <p className="text-white mb-4">
        {pseudoName
          ? "Update your pseudoname."
          : "Please choose a pseudoname to start chatting."}
      </p>
      <form
        onSubmit={handlePseudoNameUpdate}
        className="flex flex-col gap-3"
      >
        <label htmlFor="pseudoName" className="text-white">
          Pseudoname
        </label>
        <input
          id="pseudoName"
          type="text"
          className="border-2 border-white bg-transparent text-white rounded-md p-2 focus:outline-none focus:border-yellow-300 transition duration-300"
          value={newMessage.pseudoName}
          placeholder="Enter your pseudoname"
          onChange={(e) =>
            setNewMessage({
              ...newMessage,
              pseudoName: e.target.value,
            })
          }
        />
        <button
          type="submit"
          className="bg-yellow-300 text-purple-700 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
        >
          {pseudoName ? "Update Pseudoname" : "Set Pseudoname"}
        </button>
      </form>
    </div>
  );
};

export default PseudoNameForm;