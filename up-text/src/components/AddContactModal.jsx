'use client'
import React from 'react'

export default function AddContactModal({
  users = [],
  search = '',
  setSearch,
  startChat,
  closeModal
}) {

  const filtered = users.filter(u =>
    u?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-5 rounded text-black w-80">

        <input
          value={search}
          onChange={(e) => setSearch?.(e.target.value)}
          placeholder="Search..."
          className="w-full mb-3 border p-2"
        />

        {filtered.map(user => (
          <div
            key={user._id}
            onClick={() => startChat(user)}
            className="p-2 hover:bg-gray-200 cursor-pointer"
          >
            {user.name}
          </div>
        ))}

        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  )
}