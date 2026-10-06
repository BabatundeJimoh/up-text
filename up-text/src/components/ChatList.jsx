"use client";

import API_BASE_URL from "../config/api";

import React, {
  useState,
  useRef,
} from "react";

import {
  MagnifyingGlassIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

export default function ChatList({
  chats,
  setChats,
  setSelectedChat,
  selectedChat,
  user,
  users = [],
  className = "",
  setShowSidebar,
  onChatMenuOpen,
  onAddContact,
  loading = false,
}) {
  const [search, setSearch] =
    useState("");

  const [imageErrors, setImageErrors] =
    useState({});

  const pressTimer =
    useRef(null);

  // ============================================================
  // NORMALIZE URL
  // ============================================================

  const normalizeUrl = (url) => {
    if (!url) return null;

    if (
      url.includes(
        "localhost:5001"
      )
    ) {
      return url.replace(
        "http://localhost:5001",
        `${API_BASE_URL}`
      );
    }

    return url;
  };

  // ============================================================
  // FILTER CHATS
  // ============================================================

  const filteredChats = (
    chats || []
  )
    .filter(
      (chat) =>
        chat?.name &&
        chat.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt
        ) -
        new Date(
          a.updatedAt
        )
    );

  // ============================================================
  // GET AVATAR
  // ============================================================

  const getAvatar = (chat) => {
    if (chat.isGroup) {
      return "/group.png";
    }

    const member =
      chat.members?.find(
        (m) =>
          m._id !==
          user?._id
      );

    if (
      imageErrors[
        chat._id
      ]
    ) {
      const seed =
        member?._id ||
        member?.name ||
        chat.name ||
        "default";

      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
        seed
      )}`;
    }

    if (
      member?.profilePic
    ) {
      return normalizeUrl(
        member.profilePic
      );
    }

    const freshUser =
      users.find(
        (u) =>
          u._id ===
          member?._id
      );

    if (
      freshUser?.profilePic
    ) {
      return normalizeUrl(
        freshUser.profilePic
      );
    }

    const seed =
      member?._id ||
      member?.name ||
      chat.name ||
      "default";

    return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(
      seed
    )}`;
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (
    date
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // IMAGE ERROR
  // ============================================================

  const handleImageError = (
    chatId
  ) => {
    if (
      !imageErrors[
        chatId
      ]
    ) {
      setImageErrors(
        (prev) => ({
          ...prev,
          [chatId]: true,
        })
      );
    }
  };

  // ============================================================
  // OPEN CHAT MENU
  // ============================================================

  const openMenu = (
    e,
    chat
  ) => {
    e.preventDefault();

    const x = Math.min(
      e.pageX,
      window.innerWidth -
        220
    );

    const y = Math.min(
      e.pageY,
      window.innerHeight -
        250
    );

    onChatMenuOpen({
      visible: true,
      x,
      y,
      chat,
    });
  };

  // ============================================================
  // LONG PRESS
  // ============================================================

  const handleTouchStart = (
    chat
  ) => {
    pressTimer.current =
      setTimeout(() => {
        onChatMenuOpen?.({
          visible: true,
          x: 120,
          y: 200,
          chat,
        });
      }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(
      pressTimer.current
    );
  };

  const handleTouchMove = () => {
    clearTimeout(
      pressTimer.current
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      className={`
        flex flex-col
        w-full
        md:w-[35%]
        lg:w-[32%]
        xl:w-[30%]
        min-w-0
        md:min-w-[300px]
        h-full
        bg-[#F5F7FB]
        p-4
        text-black
        md:rounded-l-[40px]
        ${className}
      `}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Chats
          </h2>

          {chats?.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {chats.length}{" "}
              {chats.length ===
              1
                ? "conversation"
                : "conversations"}
            </p>
          )}
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() =>
            setShowSidebar(true)
          }
        >
          ☰
        </button>
      </div>

      {/* ========================================================
          SEARCH
      ======================================================== */}

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search chats..."
          className="
            w-full
            px-3
            py-2.5
            pr-10
            rounded-xl
            bg-white
            border
            border-gray-200
            focus:outline-none
            focus:border-[#7B61FF]
            focus:ring-1
            focus:ring-[#7B61FF]
            text-sm
          "
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <MagnifyingGlassIcon
          className="
            w-5
            h-5
            text-gray-400
            absolute
            right-3
            top-1/2
            -translate-y-1/2
          "
        />
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#7B61FF]/20 border-t-[#7B61FF] rounded-full animate-spin" />

            <p className="text-sm text-gray-400">
              Loading chats...
            </p>
          </div>
        </div>
      ) : chats?.length === 0 ? (
        /* ======================================================
           EMPTY CHAT LIST
        ======================================================= */

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-[240px]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#7B61FF]/10 flex items-center justify-center">
              <UserPlusIcon className="w-7 h-7 text-[#7B61FF]" />
            </div>

            <h3 className="text-sm font-semibold text-gray-700">
              No conversations yet
            </h3>

            <p className="text-xs text-gray-400 mt-2 leading-5">
              Add a contact to
              start chatting.
            </p>

            <button
              onClick={
                onAddContact
              }
              className="
                mt-5
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-[#7B61FF]
                hover:bg-[#6B51E5]
                text-white
                text-sm
                font-medium
                transition
                shadow-sm
              "
            >
              <UserPlusIcon className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>
      ) : filteredChats.length ===
        0 ? (
        /* ======================================================
           NO SEARCH RESULTS
        ======================================================= */

        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            No chats found
          </p>
        </div>
      ) : (
        /* ======================================================
           CHAT LIST
        ======================================================= */

        <div className="space-y-3 overflow-y-auto flex-1 scrollbar-invisible pb-2">
          {filteredChats.map(
            (chat) => {
              const avatarUrl =
                getAvatar(
                  chat
                );

              const isSelected =
                selectedChat?.id ===
                  chat.id ||
                selectedChat?._id ===
                  chat._id;

              return (
                <div
                  key={
                    chat._id
                  }
                  onClick={() =>
                    setSelectedChat(
                      chat
                    )
                  }
                  onContextMenu={(
                    e
                  ) =>
                    openMenu(
                      e,
                      chat
                    )
                  }
                  onTouchStart={() =>
                    handleTouchStart(
                      chat
                    )
                  }
                  onTouchEnd={
                    handleTouchEnd
                  }
                  onTouchMove={
                    handleTouchMove
                  }
                  className={`
                    flex
                    items-start
                    gap-3
                    p-3
                    rounded-xl
                    cursor-pointer
                    transition
                    relative
                    group
                    ${
                      isSelected
                        ? "bg-[#7B61FF]/10"
                        : "bg-white hover:bg-gray-100"
                    }
                  `}
                >
                  {/* TIME */}

                  <span className="absolute top-2.5 right-3 text-[10px] text-gray-400">
                    {formatTime(
                      chat.updatedAt
                    )}
                  </span>

                  {/* UNREAD */}

                  {chat.unreadCount >
                    0 && (
                    <span className="absolute top-7 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full z-10">
                      {chat.unreadCount >
                      99
                        ? "99+"
                        : chat.unreadCount}
                    </span>
                  )}

                  {/* AVATAR */}

                  <div className="relative shrink-0">
                    <img
                      src={
                        avatarUrl
                      }
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                      alt={
                        chat.name
                      }
                      onError={() =>
                        handleImageError(
                          chat._id
                        )
                      }
                      loading="lazy"
                    />

                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  {/* CHAT INFO */}

                  <div className="flex-1 min-w-0 pr-10">
                    <p
                      className={`
                        font-semibold
                        flex
                        items-center
                        gap-2
                        truncate
                        ${
                          isSelected
                            ? "text-[#7B61FF]"
                            : "text-[#7B61FF]"
                        }
                      `}
                    >
                      <span className="truncate">
                        {
                          chat.name
                        }
                      </span>

                      {chat.isGroup && (
                        <span className="text-xs text-gray-400 font-normal shrink-0">
                          Group
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {chat.lastMessage ||
                        "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ========================================================
          SCROLLBAR
      ======================================================== */}

      <style jsx global>{`
        .scrollbar-invisible {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scrollbar-invisible::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}