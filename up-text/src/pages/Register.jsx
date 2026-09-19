import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API_BASE_URL from "../config/api"
import logo from "../assets/logo.png"

function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Registration failed")
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      navigate("/dashboard")
    } catch (err) {
      console.error(err)
      alert("Something went wrong, please try again.")
    }
  }

  return (
    <div className="min-h-screen flex justify-center px-4 pt-4 sm:pt-8">
      <div className="w-full max-w-md px-6">

        {/* Logo */}
        <div className="flex justify-center mb-10 sm:mb-6">
          <img
            src={logo}
            alt="UP-TEXT Logo"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-gray-800">
            Create Account
          </h2>

          <p className="text-gray-500 mt-1 text-sm">
            Create your account and start chatting
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-400 border border-gray-300 outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-400 border border-gray-300 outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white text-black placeholder-gray-400 border border-gray-300 outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-[#9F6BFF] to-[#7B61FF] hover:opacity-90 transition text-white p-3 rounded-lg font-semibold shadow-md"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-[#7B61FF] font-semibold hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Register