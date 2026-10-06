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
   <div className="fixed inset-0 z-[99999] flex items-center justify-center">

  {/* Background Overlay */}
  <div
    className="absolute inset-0 bg-black/40"
    onClick={closeModal}
  />

  {/* Add Contact Window */}
  <div className="relative z-[100000] bg-white p-5 rounded-2xl text-black w-80 shadow-2xl">

    {/* Add Contact Header */}
    <div className="bg-gradient-to-r from-[#9F6BFF] to-[#7B61FF] -mx-5 -mt-5 mb-5 px-5 py-4 rounded-t-2xl">
      <h2 className="text-lg font-semibold text-white">
        Add Contact
      </h2>
    </div>

    <input
      value={search}
      onChange={(e) => setSearch?.(e.target.value)}
      placeholder="Search..."
      className="
        w-full
        mb-3
        border
        border-gray-200
        rounded-lg
        p-2.5
        outline-none
        focus:border-[#7B61FF]
      "
    />

    <div className="max-h-60 overflow-y-auto">
      {filtered.length > 0 ? (
        filtered.map(user => (
          <div
            key={user._id}
            onClick={() => startChat(user)}
            className="
              p-2.5
              rounded-lg
              hover:bg-gray-100
              cursor-pointer
              transition
            "
          >
            {user.name}
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400 py-3 text-center">
          No users found
        </p>
      )}
    </div>

    <button
      onClick={closeModal}
      className="
        mt-4
        w-full
        bg-red-500
        hover:bg-red-600
        text-white
        px-4
        py-2
        rounded-lg
        transition
      "
    >
      Close
    </button>

  </div>
</div>
  )
}