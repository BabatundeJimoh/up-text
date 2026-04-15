'use client'
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import io from 'socket.io-client'
import axios from 'axios'

import SideBar from '../components/SideBar'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import Settings from '../components/Settings'
import AddContactModal from '../components/AddContactModal'
import GroupModal from '../components/GroupModal'

const socket = io('http://localhost:5000')

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
const [showSidebar, setShowSidebar] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])

  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])

  // ================= LOAD USER =================
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'))
    if (loggedUser?._id) setUser(loggedUser)
  }, [])

  // ================= FETCH USERS =================
  useEffect(() => {
    if (!user?._id) return

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users')
        setUsers(res.data.filter(u => u._id !== user._id))
      } catch (err) {
        console.error(err)
      }
    }

    fetchUsers()
  }, [user])

  // ================= FETCH CHATS =================
  useEffect(() => {
    if (!user?._id) return

    const fetchChats = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chats/${user._id}`
        )

        const formatted = res.data.map(chat => {
          let chatName = chat.name

          if (!chat.isGroup) {
            const otherUser = chat.members.find(
              m => m._id !== user._id
            )
            chatName = otherUser?.name || 'Unknown'
          }

          return {
            ...chat,
            id: chat._id,
            name: chatName,
            lastMessage: chat.lastMessage || ''
          }
        })

        setChats(formatted)
      } catch (err) {
        console.error(err)
      }
    }

    fetchChats()
  }, [user])

  // ================= JOIN CHAT ROOMS =================
  useEffect(() => {
    chats.forEach(chat => {
      if (chat?.id) socket.emit('join_chat', chat.id)
    })
  }, [chats])

  // ================= FETCH MESSAGES =================
  useEffect(() => {
    if (!selectedChat) return

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedChat.id}`
        )
        setMessages(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchMessages()
  }, [selectedChat])

  // ================= SOCKET RECEIVE =================
  useEffect(() => {
    const handleReceive = (data) => {
      setMessages(prev => [...prev, data])

      // ✅ UPDATE LAST MESSAGE IN CHATLIST
      setChats(prev =>
        prev.map(chat =>
          chat.id === data.chatId
            ? { ...chat, lastMessage: data.text }
            : chat
        )
      )

      const isMyMessage = data.sender === user?._id
      const isCurrentChat = data.chatId === selectedChat?.id

      if (!isMyMessage && !isCurrentChat) {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.7
        audio.play().catch(() => {})

        toast(`${data.sender?.name || 'New Message'}: ${data.text}`, {
          style: {
            background: '#7B61FF',
            color: '#fff',
          },
        })
      }
    }

    socket.on('receive_message', handleReceive)
    return () => socket.off('receive_message', handleReceive)
  }, [selectedChat, user])

  // ================= SEND MESSAGE =================
  const handleSendMessage = () => {
    if (!newMessage || !selectedChat) return

    const messageData = {
      chatId: selectedChat.id,
      sender: user._id,
      text: newMessage,
    }

    socket.emit('send_message', messageData)

    // ✅ UPDATE LAST MESSAGE IN CHATLIST (SENDER SIDE)
    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChat.id
          ? { ...chat, lastMessage: newMessage }
          : chat
      )
    )

    setNewMessage('')
  }

  // ================= START CHAT =================
  const handleStartChat = async (contact) => {
    if (!user?._id || !contact?._id) return

    try {
      const existing = chats.find(
        c => !c.isGroup && c.members?.some(m => m._id === contact._id)
      )

      if (existing) {
        setSelectedChat(existing)
      } else {
        const res = await axios.post(
          'http://localhost:5000/api/chats',
          {
            senderId: user._id,
            receiverId: contact._id,
          }
        )

        const newChat = {
          ...res.data,
          id: res.data._id,
          name: contact.name,
          lastMessage: ''
        }

        setChats(prev => [newChat, ...prev])
        setSelectedChat(newChat)
      }

      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  // ================= CREATE GROUP =================
  const createGroup = async (name, selectedUsersList) => {
    try {
      if (!name.trim()) return alert('Group name required')
      if (!selectedUsersList?.length) return alert('Select users')

      const memberIds = selectedUsersList.map(u => u._id)
      memberIds.push(user._id)

      const res = await axios.post(
        'http://localhost:5000/api/chats/group',
        { name, members: memberIds }
      )

      const newGroup = {
        ...res.data,
        id: res.data._id,
        lastMessage: ''
      }

      setChats(prev => [newGroup, ...prev])
      setSelectedChat(newGroup)

      setGroupName('')
      setSelectedUsers([])
      setShowGroupModal(false)
    } catch (err) {
      console.error(err)
      alert('Group creation failed')
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF] text-white overflow-hidden">

    
<SideBar
  user={user}
  setShowModal={setShowModal}
  setShowGroupModal={setShowGroupModal}
  showSidebar={showSidebar}
  setShowSidebar={setShowSidebar}
/>
      <main className="flex-1 flex">
        <Routes>

          <Route
            path="chats"
            element={
              <>
      
                <ChatList
                  chats={chats}
                  setSelectedChat={setSelectedChat}
                  user={user}
                />

               
                <ChatWindow
  selectedChat={selectedChat}
  messages={messages.filter(m => m.chatId === selectedChat?.id)}
  newMessage={newMessage}
  setNewMessage={setNewMessage}
  handleSendMessage={handleSendMessage}
  user={user}
  setShowSidebar={setShowSidebar}   // ✅ ADD THIS
/>
              </>
            }
          />

          <Route
            path="settings"
            element={user ? <Settings user={user} /> : <div>Loading...</div>}
          />

          <Route
            path="*"
            element={<Navigate to="chats" replace />}
          />

        </Routes>
      </main>

      {showModal && (
        <AddContactModal
          users={users}
          search={''}
          setSearch={() => {}}
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
          closeModal={() => setShowGroupModal(false)}
          createGroup={createGroup}
        />
      )}
    </div>
  )
}