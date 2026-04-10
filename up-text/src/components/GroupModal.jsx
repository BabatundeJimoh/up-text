'use client'
import React from 'react'

export default function GroupModal({
  users,
  groupName,
  setGroupName,
  selectedUsers,
  setSelectedUsers,
  closeModal,
  createGroup
}) {
  const [search, setSearch] = React.useState('')

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleUser = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white w-96 p-5 rounded-xl shadow-lg text-black">
        <h2 className="text-lg font-bold mb-3">Create Group</h2>

        <input
          type="text"
          placeholder="Group Name"
          className="w-full mb-3 px-3 py-2 border rounded outline-none"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search users..."
          className="w-full mb-3 px-3 py-2 border rounded outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-60 overflow-y-auto mb-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`p-2 cursor-pointer rounded ${
                selectedUsers.find(u => u._id === user._id)
                  ? 'bg-purple-200'
                  : 'hover:bg-gray-200'
              }`}
              onClick={() => toggleUser(user)}
            >
              {user.name}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => createGroup(groupName, selectedUsers)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}