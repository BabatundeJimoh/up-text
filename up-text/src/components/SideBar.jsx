'use client'
import React from 'react'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
import Settings from './Settings' // make sure this path is correct

export default function SideBar({ setShowModal, setShowGroupModal, user }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded hover:bg-gray-700 ${
      isActive ? 'text-yellow-400' : 'text-white'
    }`

  return (
    <aside className="fixed md:static z-40 h-full w-60 bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF] flex flex-col p-4">
      
      <div className="flex justify-center py-5">
        <img
          className="rounded-full w-20 h-20 object-cover"
          src="https://images.unsplash.com/photo-1554151228-14d9def656e4"
          alt="Profile"
        />
      </div>

      <p className="text-center mb-5 font-semibold text-white">
        {user?.name || 'Guest User'}
      </p>

      <ul className="space-y-4 flex-1 overflow-y-auto">

        <li>
          <NavLink to="/dashboard/chats" className={linkClass}>
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Chats
          </NavLink>
        </li>

        <li
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded cursor-pointer"
        >
          <UserGroupIcon className="w-5 h-5" />
          Add Contact
        </li>

        <li
          className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded cursor-pointer"
          onClick={() => setShowGroupModal(true)}
        >
          <UserGroupIcon className="w-5 h-5" />
          Groups
        </li>

        {/* <li>
          <NavLink to="/dashboard/documents" className={linkClass}>
            <DocumentTextIcon className="w-5 h-5" />
            Documents
          </NavLink>
        </li> */}

        <li>
          <NavLink to="/dashboard/settings" className={linkClass}>
            <Cog6ToothIcon className="w-5 h-5" />
            Settings
          </NavLink>
        </li>

      </ul>
    </aside>
  )
}