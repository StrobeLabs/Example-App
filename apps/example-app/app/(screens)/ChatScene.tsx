// @ts-nocheck
"use client";
import React, { useRef, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../util/firebase";




function ChatScene() {
  const [chats, setChats] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    image: null,
    pseudoName: "",
    message: "",
  });
  const [hoveredMessage, setHoveredMessage] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    // alert("ChatScene");
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

  const onAddPress = () => {
    setIsNewMessage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.pseudoName || !newMessage.message) return;

    let imageUrl = null;
    if (newMessage.image) {
      const storageRef = ref(storage, `images/${newMessage.image.name}`);
      await uploadBytes(storageRef, newMessage.image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "chats"), {
      pseudoName: newMessage.pseudoName,
      message: newMessage.message,
      image: imageUrl,
      date: new Date(),
    });

    setNewMessage({ image: null, pseudoName: "", message: "" });
    setIsNewMessage(false);
  };

  const getRandomPosition = (canvas) => {
    const x = Math.floor(Math.random() * (canvas.width - 40));
    const y = Math.floor(Math.random() * (canvas.height - 40));
    return { x, y };
  };

  const positions = React.useMemo(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      return chats.map(() => getRandomPosition(canvas));
    }
    return [];
  }, [chats.length, canvasRef.current]);

  return (
    <>
      <div className="w-[35vw] h-screen overflow-scroll absolute top-0 right-0 bg-black border-[#2C2C2C] border p-12">
        <div className="flex justify-between">
          <div>Chatscene</div>
          <button
            onClick={onAddPress}
            className="bg-[#2C2C2C] text-white px-4 py-2 rounded-md"
          >
            Add Message
          </button>
        </div>
        <div className="mt-14 flex flex-col gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex gap-4 items-center rounded-xl border border-[#2C2C2C]"
            >
              {/* {chat.image && (
                <img
                  src={chat.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )} */}
              <div className="p-4  w-full rounded-xl">
                <div className="text-2xl mb-4">{chat.pseudoName}</div>
                <div >{chat.message}</div>
                <div className="opacity-70 mt-4 text-xs">{chat.date.toDate().toDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-[65vw] h-screen"
      />
      {isNewMessage && (
        <div className="w-screen  h-screen absolute top-0 right-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="h-[35vh] w-[40vw] flex flex-col gap-4 bg-black">
            <button
              type="button"
              className="text-red-500"
              onClick={() => setIsNewMessage(false)}
            >
              close
            </button>
            <div>Create a post</div>
            <div>
              Anonymously post while attesting that you are a registered Luma
              user
            </div>
            {/* <div className="flex gap-2">
              <div>Profile Image</div>
              <input
                type="file"
                accept="image/*"
                className="border border-[#2C2C2C] rounded-md"
                onChange={(e) => {
                  if (!e.target.files || e.target.files?.length === 0) return;
                  setNewMessage({
                    ...newMessage,
                    image: e.target.files[0],
                  });
                }}
              />
            </div> */}
            <div className="flex gap-2">
              <div>Pseudoname</div>
              <input
                type="text"
                className="border border-[#2C2C2C] text-black rounded-md"
                value={newMessage.pseudoName}
                onChange={(e) => {
                  setNewMessage({
                    ...newMessage,
                    pseudoName: e.target.value,
                  });
                }}
              />
            </div>
            <div className="flex gap-2">
              <div>Message</div>
              <input
                type="text"
                className="border border-[#2C2C2C] text-black rounded-md"
                value={newMessage.message}
                onChange={(e) => {
                  setNewMessage({
                    ...newMessage,
                    message: e.target.value,
                  });
                }}
              />
            </div>
            <button type="submit" className="bg-[#2C2C2C] text-white px-4 py-2 rounded-md">
              Post
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatScene;