"use client";
import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAccount, useReadContract } from "wagmi";
import ChatForm from "./ChatForm";
import ChatList from "./ChatList";
import WhitelistCanvas from "./WhitelistCanvas";
import { db, storage } from "../../../../util/constants/firebase";
import { ProofOfLumaRegistryABI } from "../../../../../abis/ProofOfLumaRegistry";

const PROOF_OF_LUMA_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROOF_OF_LUMA_REGISTRY_ADDRESS;

interface ChatSceneProps {
  onMouseLeave: () => void;
  onMouseEnter: () => void;
  onClick: () => void;
}

function ChatScene({ onMouseLeave, onMouseEnter, onClick }: ChatSceneProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [pseudoName, setPseudoName] = useState<string>("");
  const [profilePhotoURL, setProfilePhotoURL] = useState<string>("");
  const [messageMediaURL, setMessageMediaURL] = useState<string>("");
  const account = useAccount();

  const { data: isWhitelisted } = useReadContract({
    address: PROOF_OF_LUMA_REGISTRY_ADDRESS as `0x${string}`,
    abi: ProofOfLumaRegistryABI,
    functionName: "isUserJoined",
    args: [account.address as `0x${string}`],
  });

  useEffect(() => {
    const storedPseudoName = localStorage.getItem("pseudoName");
    const storedProfilePhotoURL = localStorage.getItem("profilePhotoURL");
    const storedMessageMediaURL = localStorage.getItem("messageMediaURL");

    if (storedPseudoName) setPseudoName(storedPseudoName);
    if (storedProfilePhotoURL) setProfilePhotoURL(storedProfilePhotoURL);
    if (storedMessageMediaURL) setMessageMediaURL(storedMessageMediaURL);

    const q = query(collection(db, "chats"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (newMessage: { message: string }, profilePhoto: File | null) => {
    if (!isWhitelisted || !newMessage.message) return;

    let updatedProfilePhotoURL = profilePhotoURL;

    if (profilePhoto) {
      const storageRef = ref(storage, `profilePhotos/${account.address}`);
      await uploadBytes(storageRef, profilePhoto);
      updatedProfilePhotoURL = await getDownloadURL(storageRef);
      setProfilePhotoURL(updatedProfilePhotoURL);
      localStorage.setItem("profilePhotoURL", updatedProfilePhotoURL);
    }

    await addDoc(collection(db, "chats"), {
      pseudoName: pseudoName.trim() === "" ? "anonymous" : pseudoName,
      message: newMessage.message,
      date: new Date(),
      profilePhotoURL: updatedProfilePhotoURL,
      messageImageURL: messageMediaURL || "",
    });

    setMessageMediaURL("");
    localStorage.removeItem("messageMediaURL");
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        className="w-screen md:w-[35vw] h-screen overflow-scroll absolute top-0 right-0 bg-black border-[#2C2C2C] border p-4 md:p-12"
      >
        <ChatForm
          pseudoName={pseudoName}
          setPseudoName={setPseudoName}
          profilePhotoURL={profilePhotoURL}
          setProfilePhotoURL={setProfilePhotoURL}
          messageMediaURL={messageMediaURL}
          setMessageMediaURL={setMessageMediaURL}
          handleSubmit={handleSubmit}
          isWhitelisted={isWhitelisted as boolean}
          account={account}
        />
        <ChatList chats={chats} isWhitelisted={isWhitelisted as boolean} />
      </div>
      <WhitelistCanvas isWhitelisted={isWhitelisted as boolean} />
    </>
  );
}

export default ChatScene;