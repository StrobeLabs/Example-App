import React from 'react';
import Link from "next/link";

/**
 * WhitelistMessage Component
 * 
 * This component displays a message for users who are not whitelisted,
 * informing them that only whitelisted addresses can post messages.
 * It also provides a link for invited guests to prove their status.
 * 
 * @returns {JSX.Element} A div containing the whitelist message and a link to prove guest status
 */
const WhitelistMessage = () => {
  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-md flex flex-col gap-3">
      <div>
        Only whitelisted addresses can post messages. If you are an
        invited guest, please prove it.
      </div>
      <Link
        href={`/`}
        className="bg-gray-700 flex items-center justify-center text-center text-white px-4 py-2 rounded-md hover:bg-gray-800 transition duration-300 "
      >
        <div>Prove!</div>
      </Link>
    </div>
  );
};

export default WhitelistMessage;