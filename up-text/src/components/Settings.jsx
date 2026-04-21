'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function Settings({ user, setUser }) {

  const [loading, setLoading] = useState(false)

  // ✅ CONTROLLED STATES (FIX)
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      setBio(user.bio || '')
      setEmail(user.email || '')
    }
  }, [user])

  if (!user) return <div className="p-5">Loading...</div>

  // =========================
  // ✅ SAVE PROFILE DETAILS
  // =========================
  const handleSave = async () => {
    try {
      setLoading(true)

      const res = await axios.put(
        `http://localhost:5000/api/auth/update-profile/${user._id}`,
        { bio, email }
      )

      const updatedUser = res.data.user

      localStorage.setItem("user", JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)

      setLoading(false)
      alert("Profile updated!")

    } catch (err) {
      setLoading(false)
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  }

  // =========================
  // ✅ UPLOAD IMAGE
  // =========================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const formData = new FormData()
    formData.append("image", file)

    try {
      setLoading(true)

      const res = await axios.put(
        `http://localhost:5000/api/auth/upload-profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const updatedUser = res.data.user

      localStorage.setItem("user", JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)

      setLoading(false)

    } catch (err) {
      setLoading(false)
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  }

  // =========================
  // ✅ REMOVE IMAGE
  // =========================
  const handleRemove = async () => {
    try {
      setLoading(true)

      const res = await axios.put(
        `http://localhost:5000/api/auth/remove-profile/${user._id}`
      )

      const updatedUser = res.data.user

      localStorage.setItem("user", JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)

      setLoading(false)

    } catch (err) {
      setLoading(false)
      console.error(err)
      alert(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] p-12 overflow-y-auto md:rounded-l-[40px]">

      <h1 className="text-3xl font-bold text-[#7B61FF] mb-6">
        Settings
      </h1>

      {/* PROFILE */}
      <div className="p-6">

        <h2 className="text-xl font-semibold text-black mb-2">
          Profile
        </h2>

        <p className="text-gray-500 mb-4">
          Update your profile and personal details here
        </p>

        <div className="flex items-center gap-5">

          <img
            src={
              user?.profilePic
                ? `http://localhost:5000${user.profilePic}`
                : 'https://static.vecteezy.com/system/resources/previews/026/631/405/non_2x/human-icon-symbol-design-illustration-vector.jpg'
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
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
              disabled={loading}
            >
              {loading ? "Uploading..." : "Update Picture"}
            </button>

            <button
              onClick={handleRemove}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
              disabled={loading}
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
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself..."
          className="w-full border rounded-lg px-2 py-2"
        />
      </div>

      {/* ACCOUNT */}
      <div className="p-6">

        <h2 className="text-xl font-semibold text-black mb-4">
          Account Settings
        </h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-2 py-2 mb-3"
        />

        <button className="bg-[#7B61FF] text-white px-5 py-3 rounded-lg">
          Change Password
        </button>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 p-6">

        <button
          onClick={handleSave}
          className="bg-[#7B61FF] text-white px-6 py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
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
  )
}