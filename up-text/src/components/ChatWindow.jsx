'use client'

import React, { useEffect, useMemo, useState } from 'react'
import socket from '../socket'

export default function ChatWindow({
  className = "",
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  user,
  setShowSidebar,
  setSelectedChat,
  setMobileView,
}) {

  const [imageError, setImageError] = useState(false)

  // ================= MARK AS SEEN =================
  useEffect(() => {
    if (!selectedChat || !user?._id) return

    socket.emit("mark_seen", {
      chatId: selectedChat.id,
      userId: user._id,
    })
  }, [selectedChat, user])

  // ================= OTHER USER =================
  const otherUser = useMemo(() => {
    if (!selectedChat?.members || !user?._id) return null
    return selectedChat.members.find(m => m._id !== user._id)
  }, [selectedChat, user])

  // ================= GET PROFILE PICTURE =================
  const getProfilePic = () => {
    if (!otherUser) return "https://i.pravatar.cc/150?img=3"
    
    if (imageError) {
      const seed = otherUser._id || otherUser.name || 'default'
      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`
    }

    if (otherUser.profilePic) {
      if (otherUser.profilePic.startsWith('http')) {
        return otherUser.profilePic
      }
      return `https://up-text-backend.onrender.com${otherUser.profilePic}`
    }

    const seed = otherUser._id || otherUser.name || 'default'
    return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <section className={`flex-1 max-w-3xl mx-auto flex flex-col justify-between bg-[#F5F7FB] text-black p-4 relative ${className}`}>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg w-full bg-white">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* BACK BUTTON (MOBILE ONLY) */}
          <button
            className="md:hidden text-2xl mr-1"
            onClick={() => setMobileView("list")}
          >
            ←
          </button>

          <div className="relative">
            <img
              src={getProfilePic()}
              alt="User"
              className="w-12 h-12 rounded-full object-cover bg-gray-200"
              onError={handleImageError}
            />

            <span
              className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                otherUser?.lastSeen === null
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>

          <div className="flex flex-col">
            <p className="font-semibold text-[#7B61FF]">
              {selectedChat?.isGroup 
                ? selectedChat.name 
                : (otherUser?.name || selectedChat?.name || 'User')}
            </p>

            <span className="text-xs text-gray-400">
              {selectedChat?.isGroup 
                ? `${selectedChat.members?.length || 0} members`
                : (otherUser?.lastSeen === null
                  ? "Online"
                  : otherUser?.lastSeen
                  ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : "Offline")}
            </span>
          </div>

        </div>

        {/* RIGHT */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>

      </div>

      {/* ================= MESSAGES ================= */}
      <div className="overflow-y-auto mb-4 flex-1 bg-white p-3 rounded-lg">

        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-10">
            No messages yet
          </p>
        )}

        {messages.map((msg, idx) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
          const isSender = senderId === user?._id

          return (
            <div
              key={msg._id || msg.tempId || idx}
              className={`flex flex-col mb-3 ${
                isSender ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  isSender
                    ? 'bg-[#7B61FF] text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {msg.text}
              </div>

              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-xs text-gray-400">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now'}
                </span>

                {isSender && (
                  <div className="flex gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${msg.seen ? 'bg-blue-500' : 'bg-gray-400'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${msg.seen ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ================= INPUT ================= */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />

        <button
          onClick={handleSendMessage}
          className="bg-[#7B61FF] px-4 py-2 rounded text-white hover:bg-[#6B51E5] transition"
        >
          Send
        </button>
      </div>
    </section>
  )
}