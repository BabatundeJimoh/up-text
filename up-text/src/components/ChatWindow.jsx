"use client";

import API_BASE_URL from "../config/api";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

import socket from "../socket";

export default function ChatWindow({
  className = "",
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  user,
  setShowSidebar,
  setMobileView,
  onAddContact,
  loading = false,
}) {
  const [imageError, setImageError] =
    useState(false);

  // ============================================================
  // MARK AS SEEN
  // ============================================================

  useEffect(() => {
    if (
      !selectedChat ||
      !user?._id
    ) {
      return;
    }

    socket.emit(
      "mark_seen",
      {
        chatId:
          selectedChat.id ||
          selectedChat._id,
        userId: user._id,
      }
    );
  }, [
    selectedChat,
    user,
  ]);

  // ============================================================
  // OTHER USER
  // ============================================================

  const otherUser = useMemo(() => {
    if (
      !selectedChat?.members ||
      !user?._id
    ) {
      return null;
    }

    return selectedChat.members.find(
      (m) =>
        m._id !==
        user._id
    );
  }, [
    selectedChat,
    user,
  ]);

  // ============================================================
  // NORMALIZE API URL
  // ============================================================

  const normalizeBase =
    API_BASE_URL?.replace(
      /\/$/,
      ""
    );

  // ============================================================
  // GET PROFILE PICTURE
  // ============================================================

  const getProfilePic = () => {
    if (!otherUser) {
      return "https://i.pravatar.cc/150?img=3";
    }

    const pic =
      otherUser.profilePic;

    // Image failed
    if (imageError) {
      const seed =
        otherUser._id ||
        otherUser.name ||
        "default";

      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
        seed
      )}`;
    }

    // Real image
    if (pic) {
      if (
        pic.startsWith(
          "http"
        )
      ) {
        return pic;
      }

      return `${normalizeBase}${pic}`;
    }

    // Default avatar
    const seed =
      otherUser._id ||
      otherUser.name ||
      "default";

    return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
      seed
    )}`;
  };

  // ============================================================
  // IMAGE ERROR
  // ============================================================

  const handleImageError = (
    e
  ) => {
    e.target.onerror =
      null;

    setImageError(true);
  };

  // ============================================================
  // EMPTY / WELCOME STATE
  // ============================================================

  if (!selectedChat) {
    return (
      <section
        className={`
          flex-1
          min-w-0
          w-full
          h-full
          flex
          items-center
          justify-center
          bg-[#F5F7FB]
          text-black
          relative
          overflow-hidden
          ${className}
        `}
      >
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#7B61FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#9F6BFF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 max-w-lg w-full">
          {/* Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#9F6BFF]/15 to-[#7B61FF]/10 flex items-center justify-center mb-6 shadow-sm">
            <ChatBubbleLeftRightIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#7B61FF]" />
          </div>

          {/* Welcome */}
          <p className="text-sm font-medium text-[#7B61FF] mb-2">
            Welcome to Up-Text
          </p>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Start your first conversation
          </h1>

          {/* Description */}
          <p className="mt-3 text-sm sm:text-base text-gray-400 leading-6 max-w-md">
            Your conversations will appear
            here. Add a contact to start
            chatting with someone.
          </p>

          {/* Button */}
          <button
            onClick={
              onAddContact
            }
            className="
              mt-7
              inline-flex
              items-center
              justify-center
              gap-2
              bg-[#7B61FF]
              hover:bg-[#6B51E5]
              active:scale-[0.98]
              text-white
              px-6
              py-3
              rounded-xl
              text-sm
              font-semibold
              shadow-lg
              shadow-[#7B61FF]/20
              transition-all
              duration-200
            "
          >
            <UserPlusIcon className="w-5 h-5" />

            <span>
              Add Contact
            </span>
          </button>

          {/* Small hint */}
          <p className="mt-4 text-xs text-gray-400">
            Connect with someone you might know.
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // NORMAL CHAT WINDOW
  // ============================================================

  return (
    <section
      className={`
        flex-1
        min-w-0
        w-full
        h-full
        flex
        flex-col
        justify-between
        bg-[#F5F7FB]
        text-black
        p-3
        sm:p-4
        relative
        ${className}
      `}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between mb-3 sm:mb-4 p-3 rounded-xl w-full bg-white shadow-sm">
        {/* LEFT */}

        <div className="flex items-center gap-3 min-w-0">
          {/* MOBILE BACK */}

          <button
            className="md:hidden text-2xl mr-1 text-gray-700"
            onClick={() =>
              setMobileView(
                "list"
              )
            }
          >
            ←
          </button>

          {/* PROFILE */}

          <div className="relative shrink-0">
            <img
              src={
                getProfilePic()
              }
              alt="User"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-gray-200"
              onError={
                handleImageError
              }
            />

            <span
              className={`
                absolute
                bottom-0
                right-0
                w-3
                h-3
                border-2
                border-white
                rounded-full
                ${
                  otherUser?.lastSeen ===
                  null
                    ? "bg-green-500"
                    : "bg-gray-400"
                }
              `}
            />
          </div>

          {/* USER INFO */}

          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-[#7B61FF] truncate">
              {selectedChat?.isGroup
                ? selectedChat.name
                : otherUser?.name ||
                  selectedChat?.name ||
                  "User"}
            </p>

            <span className="text-xs text-gray-400 truncate">
              {selectedChat?.isGroup
                ? `${
                    selectedChat.members
                      ?.length ||
                    0
                  } members`
                : otherUser?.lastSeen ===
                  null
                ? "Online"
                : otherUser?.lastSeen
                ? `Last seen ${new Date(
                    otherUser.lastSeen
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute:
                        "2-digit",
                    }
                  )}`
                : "Offline"}
            </span>
          </div>
        </div>

        {/* MOBILE MENU */}

        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() =>
            setShowSidebar(
              true
            )
          }
        >
          ☰
        </button>
      </div>

      {/* ========================================================
          MESSAGES
      ======================================================== */}

      <div className="overflow-y-auto mb-3 sm:mb-4 flex-1 min-h-0 bg-white p-3 sm:p-4 rounded-xl custom-scrollbar">
        {messages.length ===
          0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">
              No messages yet
            </p>
          </div>
        )}

        {messages.map(
          (
            msg,
            idx
          ) => {
            const senderId =
              typeof msg.sender ===
              "object"
                ? msg.sender
                    ._id
                : msg.sender;

            const isSender =
              senderId ===
              user?._id;

            return (
              <div
                key={
                  msg._id ||
                  msg.tempId ||
                  idx
                }
                className={`
                  flex
                  flex-col
                  mb-3
                  ${
                    isSender
                      ? "items-end"
                      : "items-start"
                  }
                `}
              >
                {/* MESSAGE */}

                <div
                  className={`
                    px-4
                    py-2
                    rounded-2xl
                    max-w-[80%]
                    sm:max-w-[70%]
                    break-words
                    ${
                      isSender
                        ? "bg-[#7B61FF] text-white rounded-br-md"
                        : "bg-gray-200 text-black rounded-bl-md"
                    }
                  `}
                >
                  {msg.text}
                </div>

                {/* TIME */}

                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-xs text-gray-400">
                    {msg.createdAt
                      ? new Date(
                          msg.createdAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute:
                              "2-digit",
                          }
                        )
                      : "Just now"}
                  </span>

                  {/* SEEN */}

                  {isSender && (
                    <div className="flex gap-1">
                      <span
                        className={`
                          w-1.5
                          h-1.5
                          rounded-full
                          ${
                            msg.seen
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }
                        `}
                      />

                      <span
                        className={`
                          w-1.5
                          h-1.5
                          rounded-full
                          ${
                            msg.seen
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }
                        `}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ========================================================
          MESSAGE INPUT
      ======================================================== */}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="
            flex-1
            min-w-0
            px-3
            py-2.5
            border
            rounded-xl
            bg-gray-200
            outline-none
            text-black
            placeholder-gray-400
            focus:border-[#7B61FF]
            focus:ring-1
            focus:ring-[#7B61FF]
            text-sm
          "
          value={
            newMessage
          }
          onChange={(e) =>
            setNewMessage(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key ===
              "Enter"
            ) {
              handleSendMessage();
            }
          }}
        />

        <button
          onClick={
            handleSendMessage
          }
          className="
            bg-[#7B61FF]
            px-4
            sm:px-5
            py-2.5
            rounded-xl
            text-white
            text-sm
            font-medium
            hover:bg-[#6B51E5]
            active:scale-[0.98]
            transition
            shrink-0
          "
        >
          Send
        </button>
      </div>

      {/* ========================================================
          CUSTOM SCROLLBAR
      ======================================================== */}

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </section>
  );
}