'use client'

import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ChatList({ chats, setSelectedChat, user, users = [], className = "" ,setShowSidebar   }) {
  const [search, setSearch] = useState('')
  const [imageErrors, setImageErrors] = useState({})

  const filteredChats = (chats || [])
  .filter(
    (chat) =>
      chat?.name &&
      chat.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  // ================= AVATAR =================
  const getAvatar = (chat) => {
    // For groups
    if (chat.isGroup) {
      return '/group.png'
    }

    // Get the other member
    const member = chat.members?.find(
      (m) => m._id !== user?._id
    )

    // If image failed to load for this chat, use fallback
    if (imageErrors[chat._id]) {
      const seed = member?._id || member?.name || chat.name || 'default'
      return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`
    }

    // Try to get profile pic from member (same logic as ChatWindow)
    if (member?.profilePic) {
      // Check if it already has the full URL or just the path
      if (member.profilePic.startsWith('http')) {
        return member.profilePic
      }
      // Add localhost prefix if it's a path
      return `https://up-text-backend.onrender.com${member.profilePic}`
    }

    // Try to get from users list (for updated images)
    const freshUser = users.find(u => u._id === member?._id)
    if (freshUser?.profilePic) {
      if (freshUser.profilePic.startsWith('http')) {
        return freshUser.profilePic
      }
      return `https://up-text-backend.onrender.com${freshUser.profilePic}`
    }

    // Final fallback to DiceBear (same as ChatWindow's fallback)
    const seed = member?._id || member?.name || chat.name || 'default'
    return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(seed)}`
  }

  // ================= FORMAT TIME =================
  const formatTime = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Handle image loading errors
  const handleImageError = (chatId) => {
    if (!imageErrors[chatId]) {
      console.log(`Image failed to load for chat: ${chatId}`)
      setImageErrors(prev => ({
        ...prev,
        [chatId]: true
      }))
    }
  }

  return (
    <section
      className={`
        flex flex-col
        w-full md:w-96
        h-full
        bg-[#F5F7FB]
        p-4
        text-black
        md:rounded-l-[40px] 
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold">Chats</h2>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-3 py-2 pr-10 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* CHAT LIST WITH INVISIBLE SCROLLBAR */}
      <div className="space-y-3 overflow-y-auto h-[calc(100vh-140px)] scrollbar-invisible">
        {filteredChats.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            No chats found
          </p>
        )}

        {filteredChats.map((chat) => {
          const avatarUrl = getAvatar(chat)
          
          return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className="flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition relative group"
            >
              {/* TIME */}
              <span className="absolute top-2 right-3 text-[11px] text-gray-400">
                {formatTime(chat.updatedAt)}
              </span>

              {/* UNREAD BADGE */}
              {chat.unreadCount > 0 && (
                <span className="absolute top-7 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </span>
              )}

              <div className="relative">
                <img
                  src={avatarUrl}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                  alt={chat.name}
                  onError={() => handleImageError(chat._id)}
                  loading="lazy"
                />
                
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-[#7B61FF] flex items-center gap-2">
                  {chat.name}
                  {chat.isGroup && (
                    <span className="text-xs text-gray-400 font-normal">Group</span>
                  )}
                </p>

                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add global styles for invisible scrollbar */}
      <style jsx global>{`
        .scrollbar-invisible {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .scrollbar-invisible::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </section>
  )
}