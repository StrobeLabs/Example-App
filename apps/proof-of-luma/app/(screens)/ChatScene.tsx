// @ts-nocheck
"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "../util/firebase"; // Import storage from Firebase
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { useAccount } from "wagmi"; // Assuming you're using wagmi for wallet connection
import { useReadContract } from "wagmi"; // For checking whitelist status
import { ProofOfLumaRegistryABI } from "../../abis/ProofOfLumaRegistry"; // Import your ABI
import Image from "next/image";
import ToggleableForm from "../components/ToggleableForm";

const PROOF_OF_LUMA_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS;

function ChatScene({
  onMouseLeave,
  onMouseEnter,
  onClick,
}: {
  onMouseLeave: () => void;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState({
    pseudoName: "",
    message: "",
  });
  const [pseudoName, setPseudoName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState("");
  const [messageMedia, setMessageMedia] = useState(null);
  const [messageMediaURL, setMessageMediaURL] = useState("");
  const canvasRef = useRef(null);
  const account = useAccount();

  // Check if user is whitelisted
  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [account.address],
  });

  useEffect(() => {
    const storedPseudoName = localStorage.getItem("pseudoName");
    const storedProfilePhotoURL = localStorage.getItem("profilePhotoURL");
    const storedMessageMediaURL = localStorage.getItem("messageMediaURL");

    if (storedPseudoName) {
      setPseudoName(storedPseudoName);
    }
    if (storedProfilePhotoURL) {
      setProfilePhotoURL(storedProfilePhotoURL);
    }
    if (storedMessageMediaURL) {
      setMessageMediaURL(storedMessageMediaURL);
    }

    const q = query(collection(db, "chats"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      setChats(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isWhitelisted || !newMessage.message) return;

    // Check if a message media is stored in local storage
    const storedMessageMediaURL = localStorage.getItem("messageMediaURL");

    // Upload profile photo if a new one is selected
    if (profilePhoto) {
      const storageRef = ref(storage, `profilePhotos/${account.address}`);
      await uploadBytes(storageRef, profilePhoto);
      const url = await getDownloadURL(storageRef);
      setProfilePhotoURL(url);
      localStorage.setItem("profilePhotoURL", url);
    }

    await addDoc(collection(db, "chats"), {
      pseudoName:
        !pseudoName || pseudoName.trim() === "" ? "anonymous" : pseudoName,
      message: newMessage.message,
      date: new Date(),
      profilePhotoURL: profilePhotoURL || "",
      messageImageURL: storedMessageMediaURL || "", // Set to empty string if no media
    });

    setNewMessage({ ...newMessage, message: "" });
    setMessageMedia(null);
    setMessageMediaURL("");
  };

  const handlePseudoNameSubmit = (e) => {
    e.preventDefault();
    if (newMessage.pseudoName) {
      setPseudoName(newMessage.pseudoName);
      localStorage.setItem("pseudoName", newMessage.pseudoName);
      setNewMessage({ ...newMessage, pseudoName: "" });
    }
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleMessageMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessageMedia(file);

      const storageRef = ref(storage, `messageMedia/${account.address}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      localStorage.setItem("messageMediaURL", url);
      setMessageMediaURL(url);
    }
  };

  const obfuscateMessage = (message) => {
    const revealCount = Math.floor(message.length * 0.3); // Reveal 30% of the characters
    const revealIndices = new Set();
    while (revealIndices.size < revealCount) {
      const randomIndex = Math.floor(Math.random() * message.length);
      revealIndices.add(randomIndex);
    }
    return message
      .split("")
      .map((char, index) => (revealIndices.has(index) ? char : "*"))
      .join("");
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        className="w-screen md:w-[35vw] h-screen overflow-scroll absolute top-0 right-0 bg-black border-[#2C2C2C] border p-4 md:p-12"
      >
        <ToggleableForm
          pseudoName={pseudoName}
          handlePseudoNameSubmit={handlePseudoNameSubmit}
          handleProfilePhotoUpload={handleProfilePhotoUpload}
          handleSubmit={handleSubmit}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleMessageMediaUpload={handleMessageMediaUpload}
          profilePhotoURL={profilePhotoURL}
          isWhitelisted={isWhitelisted}
        />
        <div className="flex flex-col mt-4 gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex gap-4 items-center rounded-xl border border-[#2C2C2C] bg-gray-900 p-4 hover:bg-gray-800 transition duration-300"
              style={{
                backgroundImage: chat.messageImageURL
                  ? `url(${chat.messageImageURL})`
                  : "none",
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
                    background: chat.messageImageURL
                      ? "rgba(0, 0, 0, 0.1)"
                      : "transparent",
                    padding: chat.messageImageURL ? "10px" : "0",
                    // filter: chat.messageImageURL ? "invert(1)" : "none",
                  }}
                >
                  {isWhitelisted
                    ? chat.message
                    : obfuscateMessage(chat.message)}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {chat.date.toDate().toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isWhitelisted && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-0 md:w-[65vw] h-screen"
        />
      )}
    </>
  );
}

export default ChatScene;
