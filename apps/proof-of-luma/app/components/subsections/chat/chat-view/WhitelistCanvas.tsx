import React, { useRef } from 'react';

function WhitelistCanvas({ isWhitelisted }: {
    isWhitelisted: boolean;
}) {
  const canvasRef = useRef(null);

  return isWhitelisted ? (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-0 md:w-[65vw] h-screen"
    />
  ) : null;
}

export default WhitelistCanvas;