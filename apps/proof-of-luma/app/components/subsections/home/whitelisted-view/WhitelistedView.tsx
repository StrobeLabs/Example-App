import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
/**
 * WhitelistedView Component
 *
 * This component is displayed when a user has been successfully whitelisted.
 * It provides a visual indication and a clickable prompt to enter the chat room.
 *
 * Features:
 * - Displays a pulsating text prompt for users to enter the chat room
 * - Automatically redirects to the chat room after a short delay
 *
 * @param router - Next.js AppRouterInstance for navigation
 */
export function WhitelistedView({ router }: { router: AppRouterInstance }) {
  return (
    <div className="absolute bottom-44 left-0 right-0 flex items-center text-white justify-center">
      <div
        className="cursor-pointer text-xs opacity-60 animate-pulse"
        onClick={() => router.push("/chat")}
      >
        letting you in.
      </div>
    </div>
  );
}
