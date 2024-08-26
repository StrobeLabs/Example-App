import React from "react";

/**
 * ProfileInfo Component
 * 
 * This component displays the user's profile information and provides options to edit the pseudoname
 * and upload a profile photo.
 * 
 * Features:
 * - Displays the user's current pseudoname
 * - Provides a button to edit the pseudoname
 * - Shows an upload input for profile photo if one hasn't been set
 * - Uses a gradient background for visual appeal
 * 
 * @param {Object} props - Component props
 * @param {string} props.pseudoName - The user's current pseudoname
 * @param {function} props.toggleEditPseudoName - Function to toggle pseudoname editing mode
 * @param {string} props.profilePhotoURL - URL of the user's profile photo
 * @param {function} props.handleProfilePhotoUpload - Handler for profile photo upload
 * 
 * @returns {JSX.Element} Rendered ProfileInfo component
 */
const ProfileInfo = ({
  pseudoName,
  toggleEditPseudoName,
  profilePhotoURL,
  handleProfilePhotoUpload,
}: {
    pseudoName: string;
    toggleEditPseudoName: () => void;
    profilePhotoURL: string;
    handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg shadow-md mb-6">
      <p className="text-white font-semibold">
        Posting as:{" "}
        <span className="font-bold text-yellow-300">{pseudoName}</span>
        <button
          onClick={toggleEditPseudoName}
          className="ml-4 text-sm text-blue-300 underline hover:text-blue-500"
        >
          Edit
        </button>
      </p>
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
  );
};

export default ProfileInfo;
