"use client";
import React from "react";
import Background from "../../public/main.svg";
import Image from "next/image";
import ChatScene from "./ChatScene";
import DrawingCanvas from "./DrawingCanvas";

function MainScene() {
  const [sectionHovered, setSectionHovered] = React.useState<string | null>(
    "chat"
  );
  return (
    <div className="w-screen h-screen relative">
      <Image
        src={Background}
        alt="Main Scene"
        layout="fill"
        // objectFit="cover"
        className="opacity-40 hidden md:inline"
        unoptimized
        priority
      />
      <div
        onClick={() => setSectionHovered("drawing")}
        onMouseEnter={() => setSectionHovered("drawing")}
        onMouseOver={() => setSectionHovered("drawing")}
        onMouseLeave={() => setSectionHovered("chat")}
        // onMouseOut={() => setSectionHovered(null)}
        className={`absolute top-0 left-0 md:w-[65vw] h-screen hidden md:inline`}
        style={{
          pointerEvents: sectionHovered === "drawing" ? "auto" : "none",
        }}
      >
        <DrawingCanvas />
      </div>

      <div className="hidden md:inline">
        <div
          // onMouseOut={() => setSectionHovered(null)}
          // className={` ${sectionHovered === "chat" ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{
            pointerEvents: sectionHovered === "chat" ? "auto" : "none",
          }}
          className="border border-red-500 border-2"
        >
          <ChatScene
            onMouseEnter={() => setSectionHovered("chat")}
            onClick={() => setSectionHovered("chat")}
            // onMouseOver={() => setSectionHovered("chat")}
            onMouseLeave={() => setSectionHovered("drawing")}
          />
        </div>
      </div>
      <div className="md:hidden">
        <div>
          <ChatScene
            onMouseEnter={() => setSectionHovered("chat")}
            onClick={() => setSectionHovered("chat")}
            // onMouseOver={() => setSectionHovered("chat")}
            onMouseLeave={() => setSectionHovered("drawing")}
          />
        </div>
      </div>
    </div>
  );
}

export default MainScene;
