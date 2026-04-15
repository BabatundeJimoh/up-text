'use client'
import React from 'react'
import axios from 'axios'

export default function Settings({ user }) {

  // =========================
  // ✅ UPLOAD IMAGE
  // =========================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ✅ Validate image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/upload-profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      // ✅ FIXED
      localStorage.setItem("user", JSON.stringify(res.data.user))

      window.location.reload()

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  }

  // =========================
  // ✅ REMOVE IMAGE
  // =========================
  const handleRemove = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/remove-profile/${user._id}`
      )

      // ✅ FIXED
      localStorage.setItem("user", JSON.stringify(res.data.user))

      window.location.reload()

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] p-12 overflow-y-auto md:rounded-l-[40px]">

      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-[#7B61FF] mb-6">
          Settings
        </h1>

        {/* PROFILE */}
        <div className="p-6">
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

            <div className="flex gap-3">

              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleImageUpload}
              />

              <button
                onClick={() => document.getElementById("fileUpload").click()}
                className="bg-[#7B61FF] text-white px-4 py-2 rounded-lg"
              >
                Update Picture
              </button>

              <button
                onClick={handleRemove}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Remove
              </button>

            </div>

          </div>
        </div>

        {/* BIO */}
        <div className="p-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Bio
          </label>

          <textarea
            rows="2"
            defaultValue={user?.bio}
            placeholder="Tell people about yourself..."
            className="w-full border rounded-lg px-2 py-2"
          />
        </div>

        {/* ACCOUNT */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Account Settings
          </h2>

          <div className="space-y-3">
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full border rounded-lg px-2 py-2"
            />

            <button className="bg-[#7B61FF] text-white px-5 py-3 rounded-lg">
              Change Password
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">

          <button className="bg-[#7B61FF] text-white px-6 py-3 rounded-lg">
            Save Changes
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("user")
              window.location.href = "/login"
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  )
}