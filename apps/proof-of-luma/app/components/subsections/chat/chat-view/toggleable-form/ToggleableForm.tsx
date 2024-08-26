"use client";
import React, { useState } from "react";
import PseudoNameForm from "./PseudoNameForm";
import ProfileInfo from "./ProfileForm";
import MessageForm from "./MessageForm";
import WhitelistMessage from "./WhitelistMessage";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

/**
 * ToggleableForm Component
 * 
 * This component manages the visibility and state of the chat form.
 * It conditionally renders different form components based on user state and whitelist status.
 * 
 * Features:
 * - Toggles form visibility
 * - Manages pseudo name editing state
 * - Conditionally renders PseudoNameForm, ProfileInfo, and MessageForm components
 * - Handles whitelist checks and displays appropriate messages
 * 
 * @param {Object} props - Component props
 * @param {string} props.pseudoName - User's current pseudo name
 * @param {function} props.handlePseudoNameSubmit - Handler for pseudo name submission
 * @param {function} props.handleProfilePhotoUpload - Handler for profile photo upload
 * @param {function} props.handleSubmit - Handler for message submission
 * @param {Object} props.newMessage - Current message state
 * @param {function} props.setNewMessage - Function to update message state
 * @param {function} props.handleMessageMediaUpload - Handler for message media upload
 * @param {string} props.profilePhotoURL - URL of user's profile photo
 * @param {boolean} props.isWhitelisted - Indicates if user is whitelisted
 * 
 * @returns {JSX.Element} Rendered ToggleableForm component
 */
const ToggleableForm = ({
  pseudoName,
  handlePseudoNameSubmit,
  handleProfilePhotoUpload,
  handleSubmit,
  newMessage,
  setNewMessage,
  handleMessageMediaUpload,
  profilePhotoURL,
  isWhitelisted,
}: {
  pseudoName: string;
  handlePseudoNameSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  newMessage: { pseudoName: string; message: string };
  setNewMessage: React.Dispatch<React.SetStateAction<{ pseudoName: string; message: string }>>;
  handleMessageMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profilePhotoURL: string;
  isWhitelisted: boolean;
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditingPseudoName, setIsEditingPseudoName] = useState(false);

  const toggleFormVisibility = () => {
    console.log("Toggling form visibility");
    setIsFormVisible(!isFormVisible);
  };

  const toggleEditPseudoName = () => {
    setIsEditingPseudoName(!isEditingPseudoName);
  };

  const handlePseudoNameUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handlePseudoNameSubmit(e);
    setIsEditingPseudoName(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleFormVisibility}
        className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300"
      >
        {isFormVisible ? "View Mode" : "Create Post"}
      </button>
      {isFormVisible && (
        isWhitelisted ? (
          <div className="mt-4 bg-gray-900 p-4 rounded-md">
            {!pseudoName || isEditingPseudoName ? (
              <PseudoNameForm
                pseudoName={pseudoName}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handlePseudoNameUpdate={handlePseudoNameUpdate}
              />
            ) : (
              <ProfileInfo
                pseudoName={pseudoName}
                toggleEditPseudoName={toggleEditPseudoName}
                profilePhotoURL={profilePhotoURL}
                handleProfilePhotoUpload={handleProfilePhotoUpload}
              />
            )}
            {isWhitelisted && (
              <MessageForm
                handleSubmit={handleSubmit}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleMessageMediaUpload={handleMessageMediaUpload}
              />
            )}
          </div>
        ) : (
          <WhitelistMessage />
        )
      )}
    </div>
  );
};

export default ToggleableForm;