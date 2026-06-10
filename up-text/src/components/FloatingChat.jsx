'use client'

import React, { useState, useRef } from "react"
import API_BASE_URL from "../config/api"

export default function FloatingChat({ user, selectedChat, socket }) {
  const [open, setOpen] = useState(false)
  const [isSchedule, setIsSchedule] = useState(false)
  const [time, setTime] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  // ================= DRAG STATE (BUTTON + WINDOW) =================
  const buttonRef = useRef(null)
  const boxRef = useRef(null)

  const dragState = useRef({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
    target: null
  })

  const startDrag = (e, target) => {
    const el = target
    const rect = el.getBoundingClientRect()

    dragState.current.dragging = true
    dragState.current.target = el
    dragState.current.offsetX = e.clientX - rect.left
    dragState.current.offsetY = e.clientY - rect.top

    el.style.position = "fixed"
    el.style.zIndex = 9999
  }

  const moveDrag = (e) => {
    if (!dragState.current.dragging || !dragState.current.target) return

    const x = e.clientX - dragState.current.offsetX
    const y = e.clientY - dragState.current.offsetY

    dragState.current.target.style.left = `${x}px`
    dragState.current.target.style.top = `${y}px`
    dragState.current.target.style.right = "auto"
    dragState.current.target.style.bottom = "auto"
  }

  const stopDrag = () => {
    dragState.current.dragging = false
    dragState.current.target = null
  }

  // ================= POINTER EVENTS (WORKS ON ALL DEVICES) =================
  const onPointerDown = (e, target) => {
    e.preventDefault()
    startDrag(e, target)

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }

  const onPointerMove = (e) => moveDrag(e)

  const onPointerUp = () => {
    stopDrag()
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
  }

  // ================= SEND =================
  const handleSend = () => {
    if (!message.trim() || !selectedChat?.id || !user?._id) return

    const msg = {
      chatId: selectedChat.id,
      sender: user._id,
      text: message,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, { sender: "me", text: message }])

    socket.emit("send_message", msg)

    setMessage("")
  }

  // ================= SCHEDULE =================
  const handleSchedule = async () => {
    if (!message.trim() || !time || !selectedChat?.id || !user?._id) return

    try {
      await fetch(`${API_BASE_URL}/api/schedule/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.id,
          sender: user._id,
          text: message,
          sendAt: time,
        }),
      })

      alert("Message scheduled!")

      setMessage("")
      setTime("")
      setIsSchedule(false)

    } catch (err) {
      console.error(err)
      alert("Failed to schedule message")
    }
  }

  return (
    <>
      {/* ================= FLOATING BUTTON (NOW DRAGGABLE) ================= */}
      <button
        ref={buttonRef}
        onPointerDown={(e) => onPointerDown(e, buttonRef.current)}
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-16 right-6 w-14 h-14 bg-[#7B61FF] text-white rounded-full shadow-lg text-2xl z-50 touch-none"
      >
        💬
      </button>

      {/* ================= CHAT WINDOW ================= */}
      {open && (
        <div
          ref={boxRef}
          className="w-80 h-[450px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50"
          style={{ position: "fixed", bottom: 100, right: 20 }}
        >
          {/* HEADER (DRAGGABLE) */}
          <div
            onPointerDown={(e) => onPointerDown(e, boxRef.current)}
            className="bg-[#7B61FF] text-white p-3 flex justify-between items-center cursor-move touch-none"
          >
            <p className="font-semibold">
              Chat {selectedChat ? `- ${selectedChat.name}` : ""}
            </p>

            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "me"
                    ? "bg-purple-500 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* SCHEDULE */}
          <div className="px-3 py-2 text-xs flex justify-between items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSchedule}
                onChange={() => setIsSchedule(!isSchedule)}
              />
              Send later
            </label>

            {isSchedule && (
              <input
                type="datetime-local"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border px-1 py-1 text-xs rounded"
              />
            )}
          </div>

          {/* INPUT */}
          <div className="p-2 border-t flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Type message..."
            />

            <button
              onClick={isSchedule ? handleSchedule : handleSend}
              className="bg-[#7B61FF] text-white px-3 rounded"
            >
              {isSchedule ? "Schedule" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}