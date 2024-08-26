import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * JoiningView Component
 *
 * This component is displayed when a user is in the process of joining the community.
 * It provides a visual indication and a clickable prompt to enter the chat room.
 *
 * Features:
 * - Displays a pulsating text prompt for users to enter the chat room
 * - Allows users to manually navigate to the chat room or wait for automatic redirection
 *
 * @param router - Next.js AppRouterInstance for navigation
 */
export default function JoiningView({ router }: { router: AppRouterInstance }) {
  return (
    <div className="absolute bottom-44 left-0 right-0 flex items-center text-white justify-center">
      <div
        className="cursor-pointer text-xs opacity-60 animate-pulse"
        onClick={() => router.push("/chat")}
      >
        press here to go to chat room or wait in a few seconds
      </div>
    </div>
  );
}
