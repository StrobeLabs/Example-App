import React from 'react'
import Background from "../../public/main.svg";
import Image from 'next/image';
import ChatScene from './ChatScene';

function MainScene() {
  return (
    <div className='w-screen h-screen relative'>
        <Image
            src={Background}
            alt="Main Scene"
            layout="fill"
            // objectFit="cover"
            unoptimized
            priority
        />
        <ChatScene/>

    </div>
  )
}

export default MainScene