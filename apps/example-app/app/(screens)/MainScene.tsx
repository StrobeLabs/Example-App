import React from 'react'
import Background from "../../public/main.svg";
import Image from 'next/image';
import ChatScene from './ChatScene';
import DrawingCanvas from './DrawingCanvas';

function MainScene() {
  return (
    <div className='w-screen h-screen relative'>
        <Image
            src={Background}
            alt="Main Scene"
            layout="fill"
            // objectFit="cover"
            className='opacity-40'
            unoptimized
            priority
        />
         <DrawingCanvas />
        <ChatScene/>

    </div>
  )
}

export default MainScene