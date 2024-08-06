// @ts-nocheck
"use client";
import React, { useRef, useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, storage } from "../util/firebase"; // Import storage from Firebase
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { useAccount } from "wagmi"; // Assuming you're using wagmi for wallet connection
import { useReadContract } from "wagmi"; // For checking whitelist status
import { ZKCommunityABI } from "../../abis/ZKCommunity"; // Import your ABI
import Image from "next/image";

const ZK_COMMUNITY_ADDRESS = process.env.NEXT_PUBLIC_ZK_COMMUNITY_ADDRESS;

function ChatScene({
  onMouseLeave,
  onMouseEnter
}: {
  onMouseLeave: () => void;
  onMouseEnter: () => void;
}) {
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState({
    pseudoName: "",
    message: "",
  });
  const [pseudoName, setPseudoName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoURL, setProfilePhotoURL] = useState("");
  const canvasRef = useRef(null);
  const account = useAccount();

  // Check if user is whitelisted
  const { data: isWhitelisted } = useReadContract({
    address: ZK_COMMUNITY_ADDRESS,
    abi: ZKCommunityABI,
    functionName: "isUserJoined",
    args: [account.address],
  });

  useEffect(() => {
    const storedPseudoName = localStorage.getItem("pseudoName");
    const storedProfilePhotoURL = localStorage.getItem("profilePhotoURL");
    if (storedPseudoName) {
      setPseudoName(storedPseudoName);
    }
    if (storedProfilePhotoURL) {
      setProfilePhotoURL(storedProfilePhotoURL);
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

    // Upload profile photo if a new one is selected
    if (profilePhoto) {
      const storageRef = ref(storage, `profilePhotos/${account.address}`);
      await uploadBytes(storageRef, profilePhoto);
      const url = await getDownloadURL(storageRef);
      setProfilePhotoURL(url);
      localStorage.setItem("profilePhotoURL", url);
    }

    await addDoc(collection(db, "chats"), {
      pseudoName: !pseudoName || pseudoName.trim() == "" ? "anonymous" : pseudoName,
      message: newMessage.message,
      date: new Date(),
      profilePhotoURL: profilePhotoURL || "",
    });

    setNewMessage({ ...newMessage, message: "" });
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
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className="w-[35vw] h-screen overflow-scroll absolute top-0 right-0 bg-black border-[#2C2C2C] border p-12">
        <div className="mb-8">
          {!pseudoName ? (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg mb-6 bg-opacity-25">
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to ChatScene!</h2>
              <p className="text-white mb-4">Please choose a pseudoname to start chatting.</p>
              <form onSubmit={handlePseudoNameSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  className="border-2 border-white bg-transparent text-white rounded-md p-2 focus:outline-none focus:border-yellow-300 transition duration-300"
                  value={newMessage.pseudoName}
                  placeholder="Enter your pseudoname"
                  onChange={(e) => setNewMessage({ ...newMessage, pseudoName: e.target.value })}
                />
                <button 
                  type="submit" 
                  className="bg-yellow-300 text-purple-700 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
                >
                  Set Pseudoname
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg shadow-md mb-6">
              <p className="text-white font-semibold">Posting as: <span className="font-bold text-yellow-300">{pseudoName}</span></p>
              {!profilePhotoURL && (
                <div className="mt-4">
                  <label className="text-white">Upload your profile photo:</label>
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
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                className="border border-[#2C2C2C] bg-gray-800 text-white rounded-md flex-grow p-2 focus:outline-none focus:border-blue-500 transition duration-300"
                value={newMessage.message}
                placeholder="Type your message"
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                Post
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex gap-4 items-center rounded-xl border border-[#2C2C2C] bg-gray-900 p-4 hover:bg-gray-800 transition duration-300"
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
                <div className="text-xl font-semibold mb-2 text-blue-400">{chat.pseudoName}</div>
                <div className="text-white whitespace-pre-wrap">{isWhitelisted ? chat.message : obfuscateMessage(chat.message)}</div>
                <div className="text-xs text-gray-400 mt-2">{chat.date.toDate().toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isWhitelisted && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-[65vw] h-screen"
        />
      )}
    </>
  );
}

export default ChatScene;
