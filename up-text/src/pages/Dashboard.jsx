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
import ChatActionMenu from '../components/ChatActionMenu'
import FloatingChat from '../components/FloatingChat'
import API_BASE_URL from '../config/api'

const socket = io(API_BASE_URL)

const sortChats = (list) =>
  [...list].sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  )

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
const [chatMenu, setChatMenu] = useState({
  visible: false,
  x: 0,
  y: 0,
  chat: null
})
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
  const [soundEnabled, setSoundEnabled] = useState(true)

  // ================= LOAD USER =================
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return

    const parsed = JSON.parse(stored)
    if (parsed?._id) setUser(parsed)
    
    const savedSoundPref = localStorage.getItem('soundEnabled')
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === 'true')
    }
  }, [])

  // ================= INITIALIZE AUDIO =================
  useEffect(() => {
    sentSoundRef.current = new Audio('/notifications/sent.mp3')
    receivedSoundRef.current = new Audio('/notifications/received.mp3')
    
    sentSoundRef.current.load()
    receivedSoundRef.current.load()
    
    return () => {
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

  const playSound = async (soundRef) => {
    if (!soundEnabled || !soundRef.current) return
    
    try {
      soundRef.current.currentTime = 0
      await soundRef.current.play()
    } catch (error) {
      console.log('Audio play failed:', error)
    }
  }

  // ================= LOAD USERS =================
  useEffect(() => {
    if (!user?._id) return

    axios.get(`${API_BASE_URL}/api/auth/users`)
      .then(res => {
        setUsers(res.data.filter(u => u._id !== user._id))
      })
      .catch(console.error)
  }, [user])

  // ================= LOAD CHATS =================
  const loadChats = async () => {
    if (!user?._id) return

    try {
      const res = await axios.get(`${API_BASE_URL}/api/chats/${user._id}`)
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
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  useEffect(() => {
    loadChats()
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

    axios.get(`${API_BASE_URL}/api/messages/${selectedChat.id}`)
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

 
  const getProfileImage = () => {
  if (!user?.profilePic) {
    return "https://static.vecteezy.com/system/resources/previews/026/631/405/non_2x/human-icon-symbol-design-illustration-vector.jpg"
  }

  if (user.profilePic.startsWith("http")) {
    return user.profilePic
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${user.profilePic}`
}

//logic to get profile image url for any person (used in toast notifications)
const getProfileImageUrl = (person) => {
  if (!person?.profilePic) {
    return "https://static.vecteezy.com/system/resources/previews/026/631/405/non_2x/human-icon-symbol-design-illustration-vector.jpg"
  }

  if (person.profilePic.startsWith("http")) {
    return person.profilePic
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${person.profilePic}`
}



  // ================= UPDATE CHAT LAST MESSAGE =================
  const updateChatLastMessage = (chatId, messageText, senderId, senderName) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: messageText,
            updatedAt: new Date(),
            unreadCount: chat.id === selectedChat?.id 
              ? 0 
              : (chat.unreadCount || 0) + 1
          }
        }
        return chat
      })
      return sortChats(updatedChats)
    })
  }

  // ================= SOCKET =================
  useEffect(() => {
    if (!user?._id) return

    const handleMessage = (msg) => {
      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
      const isOwnMessage = senderId === user._id
      
      // Play received sound for incoming messages only
      if (!isOwnMessage) {
        playSound(receivedSoundRef)
      }

      const messageKey = msg._id || `${msg.chatId}_${msg.text}_${msg.createdAt}`
      
      if (pendingMessagesRef.current.has(messageKey)) {
        return
      }
      
      pendingMessagesRef.current.set(messageKey, Date.now())
      
      setTimeout(() => {
        pendingMessagesRef.current.delete(messageKey)
      }, 1000)




      // Update messages state
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


      

      // Update chat last message and unread count
      const senderName = typeof msg.sender === 'object' ? msg.sender.name : 'User'
      updateChatLastMessage(msg.chatId, msg.text, senderId, senderName)

      // Show toast for incoming messages when not in current chat
      const isCurrentChat = msg.chatId === selectedChat?.id
      const shouldShowToast = !isCurrentChat && !isOwnMessage
      const toastKey = `${msg.chatId}_${msg.createdAt || Date.now()}`
      
      if (shouldShowToast && !toastShownRef.current.has(toastKey)) {
        toastShownRef.current.add(toastKey)
        
        setTimeout(() => {
          toastShownRef.current.delete(toastKey)
        }, 1000)
        
        const sender = typeof msg.sender === 'object' ? msg.sender : null
        const toastSenderName = sender?.name || 'New Message'
        
        let imageUrl = getProfileImageUrl(sender)
        
        if (!imageUrl) {
          imageUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`
        }
        
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-full bg-white shadow-xl rounded-xl flex items-center gap-3 p-3 border cursor-pointer`}
            onClick={() => {
              // Find and select the chat when toast is clicked
              const chatToSelect = chats.find(chat => chat.id === msg.chatId)
              if (chatToSelect) {
                setSelectedChat(chatToSelect)
                setMobileView("chat")
              }
              toast.dismiss(t.id)
            }}
          >
            <img
              src={imageUrl}
              className="w-10 h-10 rounded-full object-cover"
              alt={toastSenderName}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`
              }}
            />
            <div className="flex flex-col flex-1">
              <p className="text-sm font-semibold text-[#7B61FF]">
                {toastSenderName}
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
  }, [user, selectedChat, chats])




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

    // Immediately update the chat list with the new message
    updateChatLastMessage(selectedChat.id, newMessage, user._id, user.name)

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

    const res = await axios.post(`${API_BASE_URL}/api/chats`, {
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

    const res = await axios.post(`${API_BASE_URL}/api/chats/group`, {
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

  // ================= HANDLE FLOATING CHAT MESSAGE =================
  const handleFloatingChatMessage = (message) => {
    if (!message || !selectedChat?.id) return
    
    // Update the chat list with the message from FloatingChat
    updateChatLastMessage(selectedChat.id, message.text, user._id, user.name)
  }

  if (!user) return <div className="p-5">Loading...</div>



const muteChat = (chat) => {
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id
        ? { ...c, muted: !c.muted }
        : c
    )
  )
}

const archiveChat = (chat) => {
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id
        ? { ...c, archived: !c.archived }
        : c
    )
  )
}

const deleteChat = (chat) => {
  setChats(prev => prev.filter(c => c.id !== chat.id))

  if (selectedChat?.id === chat.id) {
    setSelectedChat(null)
  }
}



const restoreChat = async (chat) => {
  try {
    await fetch(`${API_BASE_URL}/chat/restore/${chat._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    })

    // add back to UI if missing
    setChats(prev => {
      const exists = prev.find(c => c._id === chat._id)
      if (exists) return prev
      return [chat, ...prev]
    })

  } catch (err) {
    console.error("Restore failed:", err)
  }
}






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
  setChats={setChats}   // ✅ ADD THIS
  user={user}
  users={users}
  onChatMenuOpen={setChatMenu}
  setShowSidebar={setShowSidebar}
  setSelectedChat={(chat) => {
    setSelectedChat(chat)
    setMobileView("chat")
  }}
  className={mobileView === "chat" ? "hidden md:block" : "block md:block"}
/>

<ChatActionMenu
  menu={chatMenu}
  setMenu={setChatMenu}
  onOpenChat={(chat) => setSelectedChat(chat)}
  onMuteChat={muteChat}
  onArchiveChat={archiveChat}
  onDeleteChat={deleteChat}
  onRestoreChat={restoreChat}   // now works
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
                toggleSound={() => {
                  const newValue = !soundEnabled
                  setSoundEnabled(newValue)
                  localStorage.setItem('soundEnabled', newValue)
                }}
              />
            }
          />

          <Route path="*" element={<Navigate to="chats" />} />

        </Routes>

      </main>

      {user && (
        <FloatingChat
          user={user}
          selectedChat={selectedChat}
          socket={socket}
          onMessageSent={handleFloatingChatMessage}
        />
      )}

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