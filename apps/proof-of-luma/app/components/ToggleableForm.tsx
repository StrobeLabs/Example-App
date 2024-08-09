// @ts-nocheck
"use client";
import Link from "next/link";
import React, { useState } from "react";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`;

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

  const handlePseudoNameUpdate = (e) => {
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
      {isFormVisible &&
        (isWhitelisted ? (
          <div className="mt-4 bg-gray-900 p-4 rounded-md">
            {!pseudoName || isEditingPseudoName ? (
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
            ) : (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg shadow-md mb-6">
                <p className="text-white font-semibold">
                  Posting as:{" "}
                  <span className="font-bold text-yellow-300">
                    {pseudoName}
                  </span>
                  <button
                    onClick={toggleEditPseudoName}
                    className="ml-4 text-sm text-blue-300 underline hover:text-blue-500"
                  >
                    Edit
                  </button>
                </p>
                {!profilePhotoURL && (
                  <div className="mt-4">
                    <label className="text-white">
                      Upload your profile photo:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="block mt-2 text-white"
                    />
                  </div>
                )}
              </div>
            )}
            {isWhitelisted && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label htmlFor="messageMedia" className="text-white opacity-50 text-sm">
                  Upload Image/GIF as message background (optional)
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
            )}
          </div>
        ) : (
          <div className="mt-4 bg-gray-900 p-4 rounded-md flex flex-col gap-3">
            <div>
              Only whitelisted addresses can post messages. If you are an
              invited guest, please prove it.
            </div>
            <Link
              href={`/`}
              className="bg-gray-700 flex items-center justify-center text-center text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300 "
            >
              <div>Prove!</div>
            </Link>
          </div>
        ))}
    </div>
  );
};

export default ToggleableForm;
