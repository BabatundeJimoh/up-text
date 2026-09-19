import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API_BASE_URL from "../config/api"
import logo from "../assets/logo.png"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Login failed")
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      navigate("/dashboard")
    } catch (error) {
      console.error(error)
      alert("Server error")
    }
  }

  return (
    <div className="min-h-screen flex justify-center px-4 pt-4 sm:pt-8">
      <div className="w-full max-w-md px-6 py-4">
        
        {/* Logo */}
     <div className="flex justify-center mb-3">
  <img
    src={logo}
    alt="UP-TEXT Logo"
    className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
  />
</div>
{/* Header */}
<div className="text-center mb-5 mt-12 sm:mt-10">
  <h2 className="text-3xl font-bold text-gray-800">
    Sign In
  </h2>

  <p className="text-gray-500 mt-1 text-sm pb-9">
    Enter your credentials to access your account
  </p>
</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            Login
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login