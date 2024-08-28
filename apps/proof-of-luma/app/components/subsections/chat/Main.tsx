/**
 * Main Component
 *
 * This component serves as the main layout for the Proof of Luma application's interactive scene.
 * It combines a drawing canvas and a chat interface, with a responsive design for different screen sizes.
 *
 * Key features:
 * - Displays a background image on larger screens
 * - Implements a split-screen layout on desktop:
 *   - Left side (65% width): Drawing canvas
 *   - Right side (35% width): Chat interface
 * - Uses mouse enter/leave events to control which section is active
 * - Renders only the chat interface on mobile devices
 * - Manages the active section state (chat or drawing) for desktop view
 *
 * The component uses:
 * - useState: To manage the active section state
 * - Image from next/image: For optimized background image loading
 * - Custom components: CanvasView and ChatScene
 *
 * NOTE: "drawing" mode is currently deprecated.
 */

"use client";
import React, { useState } from "react";
import Image from "next/image";
import Background from "../../../../public/main.svg";
import CanvasView from "./canvas-view/CanvasView";
import ChatScene from "./chat-view/ChatView";

function Main() {
  const [activeSection, setActiveSection] = useState<"chat" | "drawing">(
    "chat"
  );

  const handleSectionChange = (section: "chat" | "drawing") => {
    setActiveSection(section);
  };

  return (
    <div className="w-screen h-screen relative">
      <Image
        src={Background}
        alt="Main Scene"
        layout="fill"
        className="opacity-40 hidden md:inline"
        unoptimized
        priority
      />
      <div className="hidden md:flex w-full h-full">
        <div
          className="w-[65vw] h-full"
          onMouseEnter={() => handleSectionChange("drawing")}
          onMouseLeave={() => handleSectionChange("chat")}
          style={{
            pointerEvents: activeSection === "drawing" ? "auto" : "none",
          }}
        >
          <CanvasView />
        </div>
        <div
          className="flex-1 h-full"
          onMouseEnter={() => handleSectionChange("chat")}
          onMouseLeave={() => handleSectionChange("drawing")}
          style={{
            pointerEvents: activeSection === "chat" ? "auto" : "none",
          }}
        >
          <ChatScene
            onMouseEnter={() => handleSectionChange("chat")}
            onMouseLeave={() => handleSectionChange("drawing")}
            onClick={() => handleSectionChange("chat")}
          />
        </div>
      </div>
      <div className="md:hidden">
        <ChatScene
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

export default Main;
