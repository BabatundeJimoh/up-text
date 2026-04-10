'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ChatList({ chats, setSelectedChat, user }) {
  const [search, setSearch] = useState('')

  const filteredChats = (chats || []).filter(
    (chat) =>
      chat?.name &&
      chat.name.toLowerCase().includes(search.toLowerCase())
  )

  const getAvatar = (chat) => {
    if (chat.isGroup) return '/group.png'

    const otherUser = chat.members.find(
      (member) => member._id !== user._id
    )

    const seed = otherUser?._id || 'default'

    return `https://avatars.dicebear.com/api/avataaars/${seed}.svg`
  }

  return (
    <section className="hidden md:block w-80 bg-[#F5F7FB] p-4 border-l md:rounded-l-[40px] text-black">
      <h2 className="text-lg font-bold mb-3">Chats</h2>

      {/* Search */}
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

      {/* Chat List */}
      <div className="space-y-3 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setSelectedChat(chat)}
          >
            <img
              src={getAvatar(chat)}
              className="w-10 h-10 rounded-full object-cover"
              alt="Avatar"
            />

            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-[#7B61FF]">
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