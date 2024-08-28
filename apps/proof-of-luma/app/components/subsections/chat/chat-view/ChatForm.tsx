/**
 * ChatForm Component
 * 
 * This component handles the chat form functionality, including message submission,
 * pseudo name setting, profile photo upload, and message media upload.
 * 
 * Key features:
 * - Manages state for new messages, pseudo name, and file uploads
 * - Handles form submissions for pseudo name and messages
 * - Processes profile photo and message media uploads
 * - Integrates with Firebase storage for file uploads
 * - Uses local storage to persist pseudo name and message media URL
 * - Renders a ToggleableForm component for the actual form display
 * 
 * Props:
 * @param {string} pseudoName - Current pseudo name of the user
 * @param {function} setPseudoName - Function to update the pseudo name
 * @param {string} profilePhotoURL - URL of the user's profile photo
 * @param {function} setProfilePhotoURL - Function to update the profile photo URL
 * @param {string} messageMediaURL - URL of the uploaded message media
 * @param {function} setMessageMediaURL - Function to update the message media URL
 * @param {function} handleSubmit - Function to handle message submission
 * @param {boolean} isWhitelisted - Indicates if the user is whitelisted
 * @param {object} account - User's account information
 */

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../../../util/constants/firebase';
import ToggleableForm from './toggleable-form/ToggleableForm';


function ChatForm({
  pseudoName,
  setPseudoName,
  profilePhotoURL,
  setProfilePhotoURL,
  messageMediaURL,
  setMessageMediaURL,
  handleSubmit,
  isWhitelisted,
  account
}: {
  pseudoName: string;
  setPseudoName: (pseudoName: string) => void;
  profilePhotoURL: string;
  setProfilePhotoURL: (profilePhotoURL: string) => void;
  messageMediaURL: string;
  setMessageMediaURL: (messageMediaURL: string) => void;
  handleSubmit: (newMessage: { message: string }, profilePhoto: File | null) => Promise<void>;
  isWhitelisted: boolean;
  account: any;
}) {
  const [newMessage, setNewMessage] = useState({ pseudoName: "", message: "" });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handlePseudoNameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.pseudoName) {
      setPseudoName(newMessage.pseudoName);
      localStorage.setItem("pseudoName", newMessage.pseudoName);
      setNewMessage({ ...newMessage, pseudoName: "" });
    }
  };

  const handleProfilePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleMessageMediaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const storageRef = ref(storage, `messageMedia/${account.address}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      localStorage.setItem("messageMediaURL", url);
      setMessageMediaURL(url);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(newMessage, profilePhoto);
    setNewMessage({ ...newMessage, message: "" });
  };

  return (
    <ToggleableForm
      pseudoName={pseudoName}
      handlePseudoNameSubmit={handlePseudoNameSubmit}
      handleProfilePhotoUpload={handleProfilePhotoUpload}
      handleSubmit={onSubmit}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleMessageMediaUpload={handleMessageMediaUpload}
      profilePhotoURL={profilePhotoURL}
      isWhitelisted={isWhitelisted}
    />
  );
}

export default ChatForm;