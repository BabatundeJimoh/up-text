'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function GroupModal({
  users,
  groupName,
  setGroupName,
  selectedUsers,
  setSelectedUsers,
  createGroup,
  closeModal
}) {
  const toggleUser = (user) => {
    const alreadySelected = selectedUsers.some(
      (selected) => selected._id === user._id
    )

    if (alreadySelected) {
      setSelectedUsers(
        selectedUsers.filter((selected) => selected._id !== user._id)
      )
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one member')
      return
    }

    createGroup(groupName.trim(), selectedUsers)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#9F6BFF] to-[#7B61FF]">
            <h2 className="text-lg font-semibold text-white">
              Create Group
            </h2>

            <button
              type="button"
              onClick={closeModal}
              className="text-white text-2xl leading-none hover:opacity-80"
            >
              ×
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            {/* GROUP NAME */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>

              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-black outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF]"
              />
            </div>

            {/* MEMBERS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Members
                </label>

                <span className="text-xs text-gray-500">
                  {selectedUsers.length} selected
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {users?.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No users available
                  </p>
                ) : (
                  users?.map((user) => {
                    const selected = selectedUsers.some(
                      (selectedUser) => selectedUser._id === user._id
                    )

                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleUser(user)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition ${
                          selected
                            ? 'bg-[#F1ECFF]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* PROFILE IMAGE */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={
                              user.profilePic ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                user.name || 'User'
                              )}`
                            }
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* NAME */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {user.name || 'Unknown User'}
                          </p>

                          {user.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>

                        {/* CHECKBOX */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            selected
                              ? 'bg-[#7B61FF] border-[#7B61FF]'
                              : 'border-gray-300'
                          }`}
                        >
                          {selected && (
                            <span className="text-white text-sm">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#9F6BFF] to-[#7B61FF] text-white font-medium hover:opacity-90 transition"
              >
                Create Group
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}