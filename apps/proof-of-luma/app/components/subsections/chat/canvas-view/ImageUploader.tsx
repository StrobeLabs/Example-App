import React from 'react';

/**
 * ImageUploader Component
 * 
 * This component provides a user interface for uploading images to the canvas.
 * It appears as a styled button in the top-left corner of the canvas view.
 * 
 * Features:
 * - Accepts image files (including GIFs)
 * - Triggers the onUpload callback when a file is selected
 * - Styled with Tailwind CSS for a consistent look and feel
 * - Provides visual feedback on hover
 * 
 * @param onUpload - A callback function that handles the file upload process
 */

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <label className="absolute top-4 left-4 z-20 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300 ease-in-out">
      Upload Image
      <input
        type="file"
        accept="image/*,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};