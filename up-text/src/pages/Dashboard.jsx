'use client'
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import SideBar from '../components/SideBar'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import Settings from '../components/Settings'
import AddContactModal from '../components/AddContactModal'
import GroupModal from '../components/GroupModal'

import io from 'socket.io-client'
import axios from 'axios'

const socket = io('http://localhost:5000')

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])

  const [user, setUser] = useState(null)
  const [chats, setChats] = useState([])
  const [users, setUsers] = useState([])

  // Load user
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'))
    if (loggedUser?._id) setUser(loggedUser)
  }, [])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/users')
        if (user?._id) {
          setUsers(res.data.filter(u => u._id !== user._id))
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (user?._id) fetchUsers()
  }, [user])

  // Fetch chats
  useEffect(() => {
    if (!user?._id) return

    const fetchChats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chats/${user._id}`)

        const uniqueChats = Array.from(
          new Map(res.data.map(c => [c._id, c])).values()
        )

        const formatted = uniqueChats.map(chat => {
          let chatName = chat.name

          if (!chat.isGroup) {
            const otherUser = chat.members.find(m => m._id !== user._id)
            chatName = otherUser?.name || "Unknown"
          }

          return { ...chat, id: chat._id, name: chatName }
        })

        setChats(formatted)
      } catch (err) {
        console.error(err)
      }
    }

    fetchChats()
  }, [user])

  // Join chat rooms
  useEffect(() => {
    chats.forEach(chat => {
      if (chat?.id) socket.emit('join_chat', chat.id)
    })
  }, [chats])

  // Fetch messages
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

  // ===============================
  // 🔥 SOCKET MESSAGE LISTENER
  // ===============================
  useEffect(() => {
    const handleReceive = (data) => {
      setMessages(prev => [...prev, data])

      const isMyMessage = data.sender === user?._id
      const isCurrentChat = data.chatId === selectedChat?.id

      // ONLY notify if:
      // - NOT my message
      // - NOT currently open chat
      if (!isMyMessage && !isCurrentChat) {

        // SOUND
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.7
        audio.play().catch(err => console.log('Audio blocked:', err))

        // TOAST
        toast(`${data.senderName || 'New Message'}: ${data.text}`, {
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

  // ===============================
  // SEND MESSAGE
  // ===============================
  const handleSendMessage = () => {
    if (!newMessage || !selectedChat) return

    const messageData = {
      chatId: selectedChat.id,
      sender: user._id,
      senderName: user.name,
      text: newMessage,
    }

    socket.emit('send_message', messageData)

    setMessages(prev => [...prev, messageData])

    setNewMessage('')
  }

  // Start chat
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
        }

        setChats(prev => [newChat, ...prev])
        setSelectedChat(newChat)
      }

      setShowModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  // Create group
  const createGroup = async (name, selectedUsersList) => {
    try {
      const memberIds = selectedUsersList.map(u => u._id)
      memberIds.push(user._id)

      const res = await axios.post(
        'http://localhost:5000/api/chats/group',
        {
          name,
          members: memberIds,
        }
      )

      const newGroup = {
        ...res.data,
        id: res.data._id,
        name,
      }

      setChats(prev => [newGroup, ...prev])
      setSelectedChat(newGroup)
      setGroupName('')
      setSelectedUsers([])
      setShowGroupModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF] text-white overflow-hidden">

      <SideBar
        user={user}
        setShowModal={setShowModal}
        setShowGroupModal={setShowGroupModal}
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
                  messages={messages.filter(
                    m => m.chatId === selectedChat?.id
                  )}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  user={user}
                />
              </>
            }
          />

          <Route
            path="groups"
            element={<div className="p-6 text-black">Groups Page</div>}
          />

          <Route
            path="settings"
            element={<Settings user={user} />}
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