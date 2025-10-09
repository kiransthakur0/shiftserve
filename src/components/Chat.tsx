"use client";

import { useState, useRef, useEffect } from "react";
import { useShifts, Shift } from "../contexts/ShiftContext";
import { useProfiles } from "../contexts/ProfileContext";

interface ChatProps {
  shift: Shift;
  currentUserId: string;
  currentUserType: "restaurant" | "worker";
  onClose: () => void;
}

export default function Chat({ shift, currentUserId, currentUserType, onClose }: ChatProps) {
  const { addChatMessage, markShiftCompleted, rateShift } = useShifts();
  const { getProfile } = useProfiles();
  const [message, setMessage] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [shift.chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      addChatMessage(shift.id, currentUserId, currentUserType, message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkCompleted = () => {
    markShiftCompleted(shift.id);
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (rating > 0) {
      rateShift(shift.id, currentUserType, rating, ratingComment || undefined);
      setShowRatingModal(false);
    }
  };

  const canMarkCompleted = currentUserType === "restaurant" && shift.status === "filled" && !shift.assignment?.completed;
  const isCompleted = shift.assignment?.completed;
  const hasRated = currentUserType === "restaurant"
    ? shift.assignment?.restaurantRating !== undefined
    : shift.assignment?.workerRating !== undefined;

  // Get the other party's profile for displaying rating
  const otherPartyId = currentUserType === "restaurant"
    ? shift.assignment?.workerId
    : shift.restaurantId;
  const otherPartyProfile = otherPartyId ? getProfile(otherPartyId) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Chat: {shift.role} - {shift.date}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUserType === "restaurant" ? shift.assignment?.workerName : shift.restaurantName}
                </p>
                {otherPartyProfile && otherPartyProfile.totalRatings > 0 && (
                  <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <span>★</span>
                    <span className="ml-1">
                      {otherPartyProfile.averageRating} ({otherPartyProfile.totalRatings})
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canMarkCompleted && (
                <button
                  onClick={handleMarkCompleted}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Mark Complete
                </button>
              )}
              {isCompleted && !hasRated && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Rate {currentUserType === "restaurant" ? "Worker" : "Restaurant"}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {shift.chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Start your conversation!</p>
                <p className="text-sm">This is a private chat between you and the {currentUserType === "restaurant" ? "worker" : "restaurant"}.</p>
              </div>
            ) : (
              shift.chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === currentUserId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === currentUserId ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Status Bar */}
          {isCompleted && (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 text-sm text-center">
                ✓ Shift completed on {new Date(shift.assignment!.completedAt!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Rate {currentUserType === "restaurant" ? "Worker" : "Restaurant"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Leave a comment about your experience..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}