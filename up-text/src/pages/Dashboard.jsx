'use client'

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import io from 'socket.io-client'
import axios from 'axios'
import { Routes, Route, Navigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import AddContactModal from '../components/AddContactModal'
import GroupModal from '../components/GroupModal'
import Settings from '../components/Settings'

const socket = io('http://localhost:5000')

const sortChats = (list) =>
  [...list].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  )

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
const [mobileView, setMobileView] = useState("list") 
  const [newMessage, setNewMessage] = useState('')
  const socketInit = useRef(false)

  // ================= LOAD USER =================
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const parsed = JSON.parse(stored)
    if (parsed?._id) setUser(parsed)
  }, [])

  // ================= LOAD USERS =================
  useEffect(() => {
    if (!user?._id) return

    axios.get('http://localhost:5000/api/auth/users')
      .then(res => {
        setUsers(res.data.filter(u => u._id !== user._id))
      })
      .catch(console.error)
  }, [user])

  // ================= LOAD CHATS =================
  useEffect(() => {
    if (!user?._id) return

    axios.get(`http://localhost:5000/api/chats/${user._id}`)
      .then(res => {
        const formatted = res.data.map(chat => {
          const other = chat.members?.find(m => m._id !== user._id)

          return {
            ...chat,
            id: chat._id,
            name: chat.isGroup ? chat.name : other?.name || 'User',
            lastMessage: chat.lastMessage || '',
            updatedAt: chat.updatedAt || new Date()
          }
        })

        setChats(sortChats(formatted))
      })
  }, [user])

  // ================= JOIN ROOMS =================
  useEffect(() => {
    chats.forEach(chat => {
      if (chat?.id) socket.emit('join_chat', chat.id)
    })
  }, [chats])

  // ================= LOAD MESSAGES =================
  useEffect(() => {
    if (!selectedChat?.id) return

    axios.get(`http://localhost:5000/api/messages/${selectedChat.id}`)
      .then(res => setMessages(res.data))
  }, [selectedChat])

 
//SOCKET RECEIVE + SEEN
  useEffect(() => {
  if (socketInit.current) return
  socketInit.current = true

  // ================= RECEIVE MESSAGE =================
  socket.on('receive_message', (msg) => {
    setMessages(prev => [...prev, msg])

    const senderId =
      typeof msg.sender === 'object'
        ? msg.sender._id
        : msg.sender

    setChats(prev => {
      const updated = prev.map(chat => {
        if (chat.id === msg.chatId) {
          return {
            ...chat,
            lastMessage: msg.text,
            updatedAt: new Date(),

            // ❌ DO NOT increment here
            // backend handles unreadCount now
          }
        }
        return chat
      })

      return sortChats(updated)
    })

    // toast only for other user messages
    if (senderId !== user?._id) {
      toast(`${msg.sender?.name || 'New'}: ${msg.text}`)
    }
  })

  // ================= SEE MESSAGES =================
  socket.on("messages_seen", ({ chatId }) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    )
  })

}, [user])

  // ================= SEND =================
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat?.id || !user?._id) return

    const msg = {
      chatId: selectedChat.id,
      sender: user._id,
      text: newMessage
    }

    socket.emit('send_message', msg)

    // 🔥 INSTANT UI UPDATE
    setMessages(prev => [
      ...prev,
      { ...msg, createdAt: new Date(), seen: false }
    ])

    setChats(prev =>
      sortChats(
        prev.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
            : chat
        )
      )
    )

    setNewMessage('')
  }

  // ================= START CHAT =================
  const handleStartChat = async (contact) => {
    if (!contact?._id || !user?._id) return

    const existing = chats.find(
      c => !c.isGroup && c.members?.some(m => m._id === contact._id)
    )

    if (existing) {
      setSelectedChat(existing)
      setShowModal(false)
      return
    }

    const res = await axios.post('http://localhost:5000/api/chats', {
      senderId: user._id,
      receiverId: contact._id
    })

    const newChat = {
      ...res.data,
      id: res.data._id,
      name: contact.name,
      lastMessage: '',
      updatedAt: new Date()
    }

    setChats(prev => sortChats([newChat, ...prev]))
    setSelectedChat(newChat)
    setShowModal(false)
  }

  

  // ================= CREATE GROUP =================
  const createGroup = async (name, list) => {
    if (!name || !list.length) return

    const res = await axios.post('http://localhost:5000/api/chats/group', {
      name,
      members: [user._id, ...list.map(u => u._id)]
    })

    const group = {
      ...res.data,
      id: res.data._id,
      lastMessage: '',
      updatedAt: new Date(),
      isGroup: true
    }

    setChats(prev => sortChats([group, ...prev]))
    setSelectedChat(group)
    setShowGroupModal(false)
  }

  if (!user) return <div className="p-5">Loading...</div>

  return (
   <div className="flex h-screen  bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF]">

    <SideBar
      user={user}
      setShowModal={setShowModal}
      setShowGroupModal={setShowGroupModal}
      showSidebar={showSidebar}
      setShowSidebar={setShowSidebar}
    />

    <main className="flex flex-1">

      <Routes>

        {/* ================= CHATS ================= */}
        <Route
          path="chats"
          element={
            <>
<ChatList
  chats={chats}
  user={user}
  users={users}
  setSelectedChat={(chat) => {
    setSelectedChat(chat)
    setMobileView("chat") // hide list, show chat
  }}
  className={mobileView === "chat" ? "hidden md:block" : "block md:block"}
/>

<ChatWindow
  selectedChat={selectedChat}
  setSelectedChat={setSelectedChat}
  messages={messages}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  handleSendMessage={handleSendMessage}
  user={user}
  setShowSidebar={setShowSidebar}
  setMobileView={setMobileView}   // ✅ ADD THIS
/>         </>
          }
        />

        {/* ================= SETTINGS ================= */}
        <Route
          path="settings"
          element={
            <Settings
              user={user}
              setUser={setUser}
            />
          }
        />

        {/* ================= DEFAULT ================= */}
        <Route path="*" element={<Navigate to="chats" />} />

      </Routes>

    </main>

    {/* MODALS */}
    {showModal && (
      <AddContactModal
        users={users}
        search={search}
        setSearch={setSearch}
        startChat={handleStartChat}
        closeModal={() => setShowModal(false)}
      />
    )}

    {showGroupModal && (
      <GroupModal
        users={users}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        createGroup={createGroup}
        closeModal={() => setShowGroupModal(false)}
      />
    )}

  </div>
  )
}