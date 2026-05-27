'use client'
import React, { useState, useRef } from "react"
import API_BASE_URL from "../config/api"

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [isSchedule, setIsSchedule] = useState(false)
  const [time, setTime] = useState("")
  const [message, setMessage] = useState("")

  // drag state
  const boxRef = useRef(null)
  const pos = useRef({ x: 0, y: 0, relX: 0, relY: 0, dragging: false })

  const onMouseDown = (e) => {
    pos.current.dragging = true
    const rect = boxRef.current.getBoundingClientRect()

    pos.current.relX = e.clientX - rect.left
    pos.current.relY = e.clientY - rect.top

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  const onMouseMove = (e) => {
    if (!pos.current.dragging) return

    const x = e.clientX - pos.current.relX
    const y = e.clientY - pos.current.relY

    boxRef.current.style.left = `${x}px`
    boxRef.current.style.top = `${y}px`
  }

  const onMouseUp = () => {
    pos.current.dragging = false
    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", onMouseUp)
  }

  const handleSend = async () => {
    if (!message.trim()) return

    if (!isSchedule) {
      console.log("Send immediately:", message)
      setMessage("")
      return
    }

    if (!time) {
      alert("Pick a time")
      return
    }

    try {
      await fetch(`${API_BASE_URL}/api/schedule/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: "ai-chat",
          sender: "ai-user",
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
      alert("Failed to schedule")
    }
  }

  return (
    <>
      {/* CHAT WINDOW */}
      {open && (
        <div
          ref={boxRef}
          style={{ position: "fixed", bottom: 100, right: 20 }}
          className="w-80 h-[450px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50"
        >
          {/* HEADER (DRAG HANDLE) */}
          <div
            onMouseDown={onMouseDown}
            className="bg-[#7B61FF] text-white p-3 flex justify-between items-center cursor-move"
          >
            <p className="font-semibold">Chat AI</p>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* BODY */}
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-600">
            👋 Hello! I can chat or schedule messages for you.
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
              onClick={handleSend}
              className="bg-[#7B61FF] text-white px-3 rounded"
            >
              {isSchedule ? "Schedule" : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#7B61FF] text-white rounded-full shadow-lg text-2xl z-50"
      >
        💬
      </button>
    </>
  )
}