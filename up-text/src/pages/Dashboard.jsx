'use client'

import React, { useState } from 'react'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'


export default function Dashboard() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen   bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF] text-white overflow-hidden">

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-4 z-50 md:hidden"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* LEFT SIDEBAR */}
<aside
  className={`fixed md:static z-40 h-full w-60 
  bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF]
  flex flex-col transform ${
    open ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 transition-transform duration-300`}
>
        {/* CLOSE BUTTON (MOBILE) */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden mb-4 self-end"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex justify-center py-5" >
          <img
            className="rounded-full w-20 h-20"
            src="https://images.unsplash.com/photo-1554151228-14d9def656e4"
          />
        </div>
        <p className="text-center ">Lewis Cole</p>

        <ul className="space-y-4 flex-1 overflow-y-auto py-6">
          <li className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
            <HomeIcon className="w-5 h-5" />
            Properties
          </li>
          <li className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Chats
          </li>
          <li className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
            <UserGroupIcon className="w-5 h-5" />
            Groups
          </li>
          <li className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
            <DocumentTextIcon className="w-5 h-5" />
            Documents
          </li>
          <li className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
            <Cog6ToothIcon className="w-5 h-5" />
            Settings
          </li>
        </ul>

     <button className="mt-auto bg-purple-500 mb-5 px-3 py-2 rounded w-55 self-center hover:bg-purple-400 transition">
          + Add Group
        </button>
      </aside>

      {/* MIDDLE PANEL */}
      <section className="hidden md:block w-80 bg-[#F5F7FB] p-4 border-l  md:rounded-l-[40px]">
     <div className="mb-4">
  <h2 className="text-lg font-bold mb-3 text-black">Chats</h2>

  <div className="relative ">
    <input
      type="text"
      placeholder="Search chats..."
      className="w-full px-3 py-2 pr-10 rounded-lg bg-[#FFFFFF] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />

    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
  </div>
</div>

      <div className="space-y-3 overflow-y-auto">

  <div className="flex items-center gap-3 p-3 bg-[#FFFFFF] rounded cursor-pointer hover:bg-gray-600">
    <img
      src="https://randomuser.me/api/portraits/men/1.jpg"
      className="w-10 h-10 rounded-full object-cover"
      alt="user"
    />
    <div>
      <p className="font-semibold text-[#7B61FF]">John Doe</p>
      <p className="text-sm text-gray-400">Hey, how are you?</p>
    </div>
  </div>

  <div className="flex items-center gap-3 p-3 bg-[#FFFFFF] rounded cursor-pointer hover:bg-gray-600">
    <img
      src="https://randomuser.me/api/portraits/women/2.jpg"
      className="w-10 h-10 rounded-full object-cover"
      alt="group"
    />
    <div>
      <p className="font-semibold text-[#7B61FF]">Study Group</p>
      <p className="text-sm text-gray-400">Assignment due tomorrow</p>
    </div>
  </div>

</div>
      </section>

      {/* RIGHT PANEL */}
      <main className="flex-1 flex flex-col p-4 md:p-6 bg-[#F5F7FB] ">
     <header className="bg-[#FFFFFF] p-4 mb-4 rounded-lg flex items-center gap-3">
  <img
    src="https://images.unsplash.com/photo-1554151228-14d9def656e4"
    alt="User Avatar"
    className="w-12 h-12 rounded-full"
  />

  <div className="flex flex-col">
    <span className="font-semibold text-[#7B61FF] text-lg md:text-xl">
      Lewis Cole
    </span>
    <span className="text-sm text-green-500">Online</span>
  </div>
</header>

       <div className="flex-1 flex flex-col gap-4 overflow-y-auto  bg-[#FFFFFF]  rounded-lg p-4">
  {/* Messages */}
  <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
    <div className="self-start bg-[#e1e4eb] p-3 rounded-lg max-w-xs">
       <p className='text-[#1E1E2F]'>Hello! Welcome to the group.</p>
    </div>

    <div className="self-end bg-purple-600 p-3 rounded-lg max-w-xs">
      <p>Hi there! Excited to chat!</p>
    </div>
  </div>

  {/* Input */}
  <div className="flex gap-2 mt-4">
    <input
      type="text"
      placeholder="Type your message..."
      className="flex-1 px-3 py-2 rounded bg-[#F5F7FB] text-[#1E1E2F] text-sm md:text-base focus:outline-none"
    />
    <button className="bg-purple-500 px-3 md:px-4 py-2 rounded hover:bg-purple-400">
      Send
    </button>
  </div>
</div>
      </main>
    </div>
  )
}