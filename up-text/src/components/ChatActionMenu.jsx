'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ChatActionMenu({
  menu,
  setMenu,

  onOpenChat,
  onMuteChat,
  onArchiveChat,
  onDeleteChat,
  onRestoreChat
}) {

  if (!menu?.visible) return null

  const chat = menu.chat

  const closeMenu = () => {
    setMenu({
      ...menu,
      visible: false
    })
  }

  const handleAction = (action) => {
    action?.()
    closeMenu()
  }

  const handleDelete = () => {
    const deletedChat = chat

    onDeleteChat?.(deletedChat)

    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Chat deleted</span>

        <button
          className="text-[#7B61FF] font-bold"
          onClick={() => {
            onRestoreChat?.(deletedChat)
            toast.dismiss(t.id)
          }}
        >
          Undo
        </button>
      </div>
    ), {
      duration: 4000
    })

    closeMenu()
  }

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closeMenu}
      />

      {/* MENU */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 w-56 bg-white rounded-xl shadow-2xl border overflow-hidden"
          style={{
            top: menu.y,
            left: menu.x
          }}
        >

          {/* OPEN CHAT */}
          <button
            onClick={() => handleAction(() => onOpenChat?.(chat))}
            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition"
          >
            📌 Open Chat
          </button>

          {/* MUTE */}
          <button
            onClick={() => handleAction(() => onMuteChat?.(chat))}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition ${
              chat?.muted ? "text-gray-400" : ""
            }`}
          >
            {chat?.muted ? "🔇 Unmute" : "🔇 Mute"}
          </button>

          {/* ARCHIVE */}
          <button
            onClick={() => handleAction(() => onArchiveChat?.(chat))}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition ${
              chat?.archived ? "text-gray-400" : ""
            }`}
          >
            {chat?.archived ? "📁 Unarchive" : "📁 Archive"}
          </button>

          {/* DELETE */}
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            🗑️ Delete
          </button>

        </motion.div>
      </AnimatePresence>
    </>
  )
}