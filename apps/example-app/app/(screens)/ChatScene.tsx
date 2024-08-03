"use client";
import React, { useRef, useEffect } from "react";

function ChatScene() {
  const [chats, setChats] = React.useState([]);
  const [isNewMessage, setIsNewMessage] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState({
    image: null as File | null,
    pseudoName: "",
    message: "",
  });
  const [hoveredMessage, setHoveredMessage] = React.useState<{
    x: number;
    y: number;
    message: string;
  } | null>(null);

  const canvasRef = useRef(null);

  const onAddPress = () => {
    setIsNewMessage(true);
  };

  const sampleChats = [
    {
      pseudoName: "John Doe",
      image:
        "https://play-lh.googleusercontent.com/3_L-KeSNkQhcGCI6C5tGybeqSungirp8aLg0pXKT6eOU7sKubC22HAn5iuxhD-wDpzo",
      message: "Hello 1",
      date: new Date(),
    },
    {
      pseudoName: "John Doe",
      image:
        "https://play-lh.googleusercontent.com/3_L-KeSNkQhcGCI6C5tGybeqSungirp8aLg0pXKT6eOU7sKubC22HAn5iuxhD-wDpzo",
      message: "Hello 2",
      date: new Date(),
    },
    {
      pseudoName: "John Doe",
      image:
        "https://play-lh.googleusercontent.com/3_L-KeSNkQhcGCI6C5tGybeqSungirp8aLg0pXKT6eOU7sKubC22HAn5iuxhD-wDpzo",
      message: "Hello 3",
      date: new Date(),
    },
    {
      pseudoName: "John Doe",
      image:
        "https://play-lh.googleusercontent.com/3_L-KeSNkQhcGCI6C5tGybeqSungirp8aLg0pXKT6eOU7sKubC22HAn5iuxhD-wDpzo",
      message: "Hello 4",
      date: new Date(),
    },
  ];

  const getRandomPosition = (canvas: any) => {
    const x = Math.floor(Math.random() * (canvas.width - 40)); // 40 to account for the size of the circle
    const y = Math.floor(Math.random() * (canvas.height - 40));
    return { x, y };
  };

  const positions = React.useMemo(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      return sampleChats.map(() => getRandomPosition(canvas));
    }
    return [];
  }, [sampleChats.length, canvasRef.current]);

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
          {sampleChats.map((chat, index) => {
            return (
              <div
                key={index}
                className="flex gap-4 items-center border border-[#2C2C2C]"
              >
                <img
                  src={chat.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div>{chat.pseudoName}</div>
                  <div>{chat.message}</div>
                  <div>{chat.date.toDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-[65vw] h-screen"
      />
      {/* {positions.length > 0 && sampleChats.map((chat, index) => (
        <Draggable
          key={index}
          bounds="parent"
          onStart={() => setHoveredMessage(null)}
          onStop={(e, data) => {
            setHoveredMessage({ x: data.x, y: data.y, message: chat.message });
          }}
          defaultPosition={positions[index]}
        >
          <div
            className="w-10 h-10 rounded-full absolute"
            style={{ top: `${positions[index].y}px`, left: `${positions[index].x}px` }}
            onMouseOver={(e) => setHoveredMessage({ x: e.pageX, y: e.pageY, message: chat.message })}
            onMouseOut={() => setHoveredMessage(null)}
          >
            <img
              src={chat.image}
              alt="Profile"
              className="w-full h-full rounded-full"
            />
          </div>
        </Draggable>
      ))} */}
      {hoveredMessage && (
        <div
          className="absolute bg-white text-black p-2 rounded"
          style={{ top: hoveredMessage.y, left: hoveredMessage.x }}
        >
          {hoveredMessage.message}
        </div>
      )}
      {isNewMessage && (
        <div className="w-screen h-screen absolute top-0 right-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="h-[35vh] w-[40vw] flex flex-col gap-4 bg-black">
            <button
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
            <div className="flex gap-2">
              <div>Profile Image</div>
              <input
                type="file"
                accept="image/*"
                className="border border-[#2C2C2C] rounded-md"
                onChange={(e) => {
                  if (!e.target.files || e.target.files?.length === 0) return;
                  setNewMessage({
                    ...newMessage,
                    // @ts-ignore
                    image: e.target.files[0],
                  });
                }}
              />
            </div>
            <div className="flex gap-2">
              <div>Pseudoname</div>
              <input
                type="text"
                className="border border-[#2C2C2C] rounded-md"
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
                className="border border-[#2C2C2C] rounded-md"
                onChange={(e) => {
                  setNewMessage({
                    ...newMessage,
                    message: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatScene;
