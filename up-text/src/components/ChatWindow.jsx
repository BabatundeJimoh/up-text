'use client'

import React from 'react'

export default function ChatWindow({
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  user,
  setShowSidebar
}) {
  return (
    <section className="flex-1 max-w-3xl mx-auto flex flex-col justify-between bg-[#F5F7FB] text-black p-4">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg w-full bg-white">

        {/* LEFT SIDE: PROFILE + NAME */}
        <div className="flex items-center gap-3">

          <div className="relative">
            <img
              src="https://i.pravatar.cc/150?img=3"
              alt="User"
              className="w-12 h-12 rounded-full object-cover"
            />

            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <p className="font-semibold text-[#7B61FF]">
            {selectedChat?.name || 'User'}
          </p>
        </div>

        {/* RIGHT SIDE: MOBILE MENU */}
        <button
          className="md:hidden ml-auto text-2xl"
          onClick={() => setShowSidebar(true)}
        >
          ☰
        </button>

      </div>

      {/* MESSAGES */}
      <div className="overflow-y-auto mb-4 flex-1 bg-white p-3 rounded-lg">

        {messages.map((msg, idx) => {
          const isSender = msg.sender === user._id

          return (
            <div
              key={idx}
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

              <span className="text-xs text-gray-400 mt-1 px-1">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now'}
              </span>

            </div>
          )
        })}

      </div>

      {/* INPUT */}
      <div className="flex gap-2">

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />

        <button
          onClick={handleSendMessage}
          className="bg-[#7B61FF] px-4 py-2 rounded text-white"
        >
          Send
        </button>

      </div>

    </section>
  )
}