'use client'

import React from 'react'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

export default function SideBar({
  setShowModal,
  setShowGroupModal,
  user,
  showSidebar,
  setShowSidebar
}) {

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${
      isActive ? 'text-yellow-400' : 'text-white'
    }`

  // ✅ SAFE FUNCTION (prevents crash)
  const closeSidebar = () => {
    if (typeof setShowSidebar === 'function') {
      setShowSidebar(false)
    }
  }

  return (
    <>
      {/* BACKDROP (mobile only) */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-50 h-full w-72 md:w-60
          bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF]
          flex flex-col p-4
          transition-transform duration-300
          md:translate-x-0
          ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >

        {/* CLOSE BUTTON (mobile only) */}
        <div className="md:hidden flex justify-end">
          <button onClick={closeSidebar}>
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* PROFILE */}
        <div className="flex justify-center py-5">
          <img
            className="rounded-full w-20 h-20 object-cover"
            src={user?.profilePic || "https://i.pravatar.cc/150?img=3"}
            alt="Profile"
          />
        </div>

        <p className="text-center mb-7 font-semibold text-white ">
          {user?.name || 'Guest User'}
        </p>

        <ul className="space-y-7 flex-1 overflow-y-auto">

          <li>
            <NavLink
              to="/dashboard/chats"
              className={linkClass}
              onClick={closeSidebar}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              <p className="text-white">Chats</p>
            </NavLink>
          </li>

          <li
            onClick={() => {
              setShowModal?.(true)   // ✅ SAFE CALL
              closeSidebar()
            }}
            className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded cursor-pointer"
          >
            <UserGroupIcon className="w-5 h-5 text-white" />
            <p className="text-white">Add Contact</p>
          </li>

          <li
            onClick={() => {
              setShowGroupModal?.(true)  // ✅ SAFE CALL
              closeSidebar()
            }}
            className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded cursor-pointer"
          >
            <UserGroupIcon className="w-5 h-5 text-white  " />
            <p className="text-white">Create Group</p>
          </li>

          <li>
            <NavLink
              to="/dashboard/settings"
              className={linkClass}
              onClick={closeSidebar}
            >
              <Cog6ToothIcon className="w-5 h-5 text-white" />
              <p className="text-white">Settings</p>
            </NavLink>
          </li>

        </ul>
      </aside>
    </>
  )
}