'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ChatList({ chats, setSelectedChat, user, users = [], className = ""  }) {
  const [search, setSearch] = useState('')

  const filteredChats = (chats || [])
  .filter(
    (chat) =>
      chat?.name &&
      chat.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  // ================= AVATAR =================
 const getAvatar = (chat) => {
  if (chat.isGroup) return '/group.png'

  const member = chat.members?.find(
    (m) => m._id !== user?._id
  )

  // 🔥 PRIORITY 1: chat data (FASTEST + ALWAYS AVAILABLE IF BACKEND IS FIXED)
  if (member?.profilePic) {
    return `http://localhost:5000${member.profilePic}`
  }

  // 🔥 PRIORITY 2: fallback to users list (when available)
  const freshUser = users.find(u => u._id === member?._id)

  if (freshUser?.profilePic) {
    return `http://localhost:5000${freshUser.profilePic}`
  }

  // 🔥 FINAL FALLBACK
  const seed = member?._id || member?.name || 'default'
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`
}





  // ================= FORMAT TIME =================
  const formatTime = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
   <section className={`w-96 bg-[#F5F7FB] p-4 border-l md:rounded-l-[40px] text-black 
  ${className} 
  ${className?.includes("hidden") ? "" : "md:block"}
`}>
      <h2 className="text-lg font-bold mb-3 ml-4">Chats</h2>

      {/* SEARCH */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 pr-10 rounded-lg bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* CHAT LIST */}
   <div className="space-y-3 overflow-y-auto h-[calc(100vh-140px)]">

  {filteredChats.length === 0 && (
    <p className="text-gray-400 text-sm text-center mt-10">
      No chats found
    </p>
  )}

  {filteredChats.map((chat) => (
    <div
      key={chat._id}
      onClick={() => setSelectedChat(chat)}
      className="flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition relative"
    >
      {/* TIME */}
      <span className="absolute top-2 right-3 text-[11px] text-gray-400">
        {formatTime(chat.updatedAt)}
      </span>

      {/* 🔥 UNREAD BADGE (moved under time) */}
      {chat.unreadCount > 0 && (
        <span className="absolute top-7 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
        </span>
      )}

      <img
        src={getAvatar(chat)}
        className="w-10 h-10 rounded-full object-cover"
        alt="Avatar"
      />

      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-[#7B61FF] flex items-center gap-2">
          {chat.name}
        </p>

        <p className="text-sm text-gray-400 truncate">
          {chat.lastMessage || 'No messages yet'}
        </p>
      </div>
    </div>
  ))}

</div>
    </section>
  )
}