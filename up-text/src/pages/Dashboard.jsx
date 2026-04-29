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
  const toastShownRef = useRef(new Set())
  const pendingMessagesRef = useRef(new Map())
  
  // Audio refs
  const sentSoundRef = useRef(null)
  const receivedSoundRef = useRef(null)
  const [soundEnabled, setSoundEnabled] = useState(true) // Allow user to toggle sounds

  // ================= LOAD USER =================
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const parsed = JSON.parse(stored)
    if (parsed?._id) setUser(parsed)
    
    // Load sound preference from localStorage
    const savedSoundPref = localStorage.getItem('soundEnabled')
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === 'true')
    }
  }, [])

  // ================= INITIALIZE AUDIO =================
  useEffect(() => {
    // Create audio elements
    sentSoundRef.current = new Audio('../notifications/sent.mp3')
    receivedSoundRef.current = new Audio('../notifications/received.mp3')
    
    // Preload sounds
    sentSoundRef.current.load()
    receivedSoundRef.current.load()
    
    return () => {
      // Cleanup
      if (sentSoundRef.current) {
        sentSoundRef.current.pause()
        sentSoundRef.current = null
      }
      if (receivedSoundRef.current) {
        receivedSoundRef.current.pause()
        receivedSoundRef.current = null
      }
    }
  }, [])

  // Function to play sound with error handling
  const playSound = async (soundRef) => {
    if (!soundEnabled || !soundRef.current) return
    
    try {
      // Reset the audio to start if it's already playing
      soundRef.current.currentTime = 0
      await soundRef.current.play()
    } catch (error) {
      console.log('Audio play failed:', error)
      // Most browsers require user interaction first
      // The sound will work after first user interaction
    }
  }

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
            updatedAt: chat.updatedAt || new Date(),
            unreadCount: 0
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
      .then(res => {
        setMessages(res.data)
        if (selectedChat.id) {
          setChats(prev => 
            prev.map(chat => 
              chat.id === selectedChat.id 
                ? { ...chat, unreadCount: 0 }
                : chat
            )
          )
        }
      })
  }, [selectedChat])

  // Helper function to get profile image URL
  const getProfileImageUrl = (sender) => {
    if (!sender) return null
    
    let profilePic = sender.profilePic
    
    if (!profilePic) return null
    
    if (profilePic.startsWith('http')) {
      return profilePic
    }
    
    return `http://localhost:5000${profilePic}`
  }

  // ================= SOCKET =================
  useEffect(() => {
    if (!user?._id) return

    const handleMessage = (msg) => {
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
      const isOwnMessage = senderId === user._id
      
      if (isOwnMessage) {
        return
      }

      // Play received sound
      playSound(receivedSoundRef)

      const messageKey = msg._id || `${msg.chatId}_${msg.text}_${msg.createdAt}`
      
      if (pendingMessagesRef.current.has(messageKey)) {
        return
      }
      
      pendingMessagesRef.current.set(messageKey, Date.now())
      
      setTimeout(() => {
        pendingMessagesRef.current.delete(messageKey)
      }, 1000)

      setMessages(prev => {
        const exists = prev.some(m => 
          (m._id && m._id === msg._id) || 
          (m.tempId && m.tempId === msg.tempId)
        )
        
        if (exists) {
          return prev
        }
        
        return [...prev, msg]
      })

      const isCurrentChat = msg.chatId === selectedChat?.id

      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === msg.chatId) {
            return {
              ...chat,
              lastMessage: msg.text,
              updatedAt: new Date(),
              unreadCount: !isCurrentChat
                ? (chat.unreadCount || 0) + 1
                : 0
            }
          }
          return chat
        })

        return sortChats(updated)
      })

      const shouldShowToast = !isCurrentChat
      const toastKey = `${msg.chatId}_${msg.createdAt || Date.now()}`
      
      if (shouldShowToast && !toastShownRef.current.has(toastKey)) {
        toastShownRef.current.add(toastKey)
        
        setTimeout(() => {
          toastShownRef.current.delete(toastKey)
        }, 1000)
        
        const sender = typeof msg.sender === 'object' ? msg.sender : null
        const senderName = sender?.name || 'New Message'
        
        let imageUrl = getProfileImageUrl(sender)
        
        if (!imageUrl) {
          imageUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`
        }
        
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-xl rounded-xl flex items-center gap-3 p-3 border`}
          >
            <img
              src={imageUrl}
              className="w-10 h-10 rounded-full object-cover"
              alt={senderName}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`
              }}
            />
            <div className="flex flex-col flex-1">
              <p className="text-sm font-semibold text-[#7B61FF]">
                {senderName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {msg.text}
              </p>
            </div>
            <span className="text-[10px] text-gray-400">now</span>
          </div>
        ))
      }
    }

    socket.on('receive_message', handleMessage)

    return () => {
      socket.off('receive_message', handleMessage)
    }
  }, [user, selectedChat])

  // ================= SEND MESSAGE =================
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat?.id || !user?._id) return

    // Play sent sound
    playSound(sentSoundRef)

    const tempId = `temp_${Date.now()}_${Math.random()}`

    const msg = {
      chatId: selectedChat.id,
      sender: user._id,
      text: newMessage,
      createdAt: new Date().toISOString(),
      tempId: tempId
    }

    const localMsg = { 
      ...msg, 
      seen: false,
      _id: tempId,
      sender: user._id
    }
    
    setMessages(prev => [...prev, localMsg])

    setChats(prev =>
      sortChats(
        prev.map(chat =>
          chat.id === selectedChat.id
            ? { 
                ...chat, 
                lastMessage: newMessage, 
                updatedAt: new Date(),
                unreadCount: chat.unreadCount || 0
              }
            : chat
        )
      )
    )

    socket.emit('send_message', msg)

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
      updatedAt: new Date(),
      unreadCount: 0
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
      isGroup: true,
      unreadCount: 0
    }

    setChats(prev => sortChats([group, ...prev]))
    setSelectedChat(group)
    setShowGroupModal(false)
  }

  // Toggle sound function (you can add a button in settings)
  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem('soundEnabled', newValue)
  }

  if (!user) return <div className="p-5">Loading...</div>

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF]">

      <SideBar
        user={user}
        setShowModal={setShowModal}
        setShowGroupModal={setShowGroupModal}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      <main className="flex flex-1">

        <Routes>

          <Route
            path="chats"
            element={
              <>
                <ChatList
                  chats={chats}
                  user={user}
                  users={users}
                  setShowSidebar={setShowSidebar}
                  setSelectedChat={(chat) => {
                    setSelectedChat(chat)
                    setMobileView("chat")
                  }}
                  className={mobileView === "chat" ? "hidden md:block" : "block md:block"}
                />

                <ChatWindow
                  selectedChat={selectedChat}
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  user={user}
                  setShowSidebar={setShowSidebar}
                  setMobileView={setMobileView}
                  className={mobileView === "list" ? "hidden md:flex" : "flex"}
                />
              </>
            }
          />

          <Route
            path="settings"
            element={
              <Settings 
                user={user} 
                setUser={setUser}
                soundEnabled={soundEnabled}
                setShowSidebar={setShowSidebar}
                toggleSound={toggleSound}
              />
            }
          />

          <Route path="*" element={<Navigate to="chats" />} />

        </Routes>

      </main>

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