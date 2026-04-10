'use client'
import React from 'react'

export default function Settings({ user }) {
  return (
    <div className="flex-1 bg-[#F5F7FB] p-12 overflow-y-auto  md:rounded-l-[40px]">

      <div className="space-y-6">

       {/* Page Title */}
      <h1 className="text-3xl font-bold text-[#7B61FF] mb-6">
        Settings
      </h1>

      <div className="space-y-6">

      {/* PROFILE SECTION */}
<div className="p-6 ">
  <h2 className="text-xl font-semibold text-black mb-4">
    Profile
  </h2>

  <p className='text-gray-500 mb-4'>
    Update your profile and personal details here
  </p>

  <div className="flex items-center gap-5">

    <img
      src={user?.profilePic || 'https://i.pravatar.cc/150?img=3'}
      alt="Profile"
      className="w-24 h-24 rounded-full object-cover"
    />

    <div className="flex gap-3 flex-1">

      <button className="bg-[#7B61FF] text-white px-4 py-2 rounded-lg">
        Update Picture
      </button>

      <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
        Remove
      </button>

    </div>

  </div>
</div>
            
          </div>
        

  {/* Bio */}
  <div className=" p-6 ">
    <label className="block text-gray-700 mb-2 font-medium">
      Bio
    </label>

    <textarea
      rows="2"
      defaultValue={user?.bio}
      placeholder="Tell people about yourself..."
      className="w-full border rounded-lg px-2 py-2 "
    />
  </div>

        {/* ACCOUNT SECTION */}
        <div className=" p-6 ">
          <h2 className="text-xl font-semibold text-black mb-4">
            Account Settings
          </h2>

          <div className="space-y-3">

            <input
              type="email"
              placeholder="Email Address"
              defaultValue={user?.email}
              className="w-full border rounded-lg px-2 py-2"
            />

            <button className="bg-[#7B61FF] text-white px-5 py-3 rounded-lg">
              Change Password
            </button>

          </div>
        </div>


        {/* PREFERENCES */}
        <div className="p-6 ">
          <h2 className="text-xl font-semibold text-black mb-4">
            Preferences
          </h2>

          <div className="flex justify-between items-center">

            <span className="text-gray-700">Dark Mode</span>

            <input type="checkbox" className="w-5 h-5" />

          </div>
        </div>

        {/* NOTIFICATIONS */}
<div className="p-6">
  <h2 className="text-xl font-semibold text-black mb-4">
    Notifications
  </h2>

  <div className="space-y-4">

    {/* Enable Notifications Toggle */}
    <div className="flex justify-between items-center">
      <span className="text-gray-700">Enable Notifications</span>
      <input type="checkbox" className="w-5 h-5" />
    </div>

    {/* Notification Sound Select */}
    <div className="flex flex-col gap-2">
      <label className="text-gray-700">
        Notification Sound
      </label>

      <select className="border text-black rounded-lg px-3 py-2 w-full">
        <option>Default</option>
        <option>Chime</option>
        <option>Pop</option>
        <option>Bell</option>
        <option>Soft Ping</option>
      </select>
    </div>

  </div>
</div>



        {/* SAVE BUTTON */}
        <button className="bg-[#7B61FF] hover:bg-[#6a4fe0] transition text-white px-6 py-3 rounded-lg">
          Save Changes
        </button>


        {/* LOGOUT */}
        <button className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-3 rounded-lg ml-4">
          Logout
        </button>

      </div>
    </div>
  )
}