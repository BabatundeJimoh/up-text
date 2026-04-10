'use client'
import React from 'react'

export default function AddContactModal({ users, search, setSearch, startChat, closeModal }) {
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white w-80 p-5 rounded-xl shadow-lg text-black">
        <h2 className="text-lg font-bold mb-3">Start New Chat</h2>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full mb-3 px-3 py-2 border rounded outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="p-2 hover:bg-gray-200 cursor-pointer rounded"
                onClick={() => startChat(user)}
              >
                {user.name}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No users found</p>
          )}
        </div>
        <button
          onClick={closeModal}
          className="mt-4 bg-[#e64e74] px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  )
}