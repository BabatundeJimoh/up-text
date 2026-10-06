"use client";

import API_BASE_URL from "../config/api";

import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import toast from "react-hot-toast";
import io from "socket.io-client";
import axios from "axios";

import { Routes, Route, Navigate } from "react-router-dom";

import SideBar from "../components/SideBar";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import AddContactModal from "../components/AddContactModal";
import GroupModal from "../components/GroupModal";
import Settings from "../components/Settings";
import ChatActionMenu from "../components/ChatActionMenu";
import FloatingChat from "../components/FloatingChat";

const socket = io(API_BASE_URL);

// ============================================================
// SORT CHATS
// ============================================================

const sortChats = (list) =>
  [...list].sort(
    (a, b) =>
      new Date(b.updatedAt || 0) -
      new Date(a.updatedAt || 0)
  );

// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  // ================= USER =================

  const [user, setUser] = useState(null);

  // ================= CHATS =================

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // ================= USERS =================

  const [users, setUsers] = useState([]);

  // ================= CHAT MENU =================

  const [chatMenu, setChatMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    chat: null,
  });

  // ================= SEARCH =================

  const [search, setSearch] = useState("");

  // ================= MODALS =================

  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // ================= GROUP =================

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // ================= MOBILE =================

  const [mobileView, setMobileView] = useState("list");

  // ================= MESSAGE =================

  const [newMessage, setNewMessage] = useState("");

  // ================= LOADING =================

  const [loadingChats, setLoadingChats] = useState(true);

  // ================= REFS =================

  const socketInit = useRef(false);
  const toastShownRef = useRef(new Set());
  const pendingMessagesRef = useRef(new Map());

  // ================= AUDIO =================

  const sentSoundRef = useRef(null);
  const receivedSoundRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // ============================================================
  // LOAD USER
  // ============================================================

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      if (parsed?._id) {
        setUser(parsed);
      }

      const savedSoundPref =
        localStorage.getItem("soundEnabled");

      if (savedSoundPref !== null) {
        setSoundEnabled(savedSoundPref === "true");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }, []);

  // ============================================================
  // INITIALIZE AUDIO
  // ============================================================

  useEffect(() => {
    sentSoundRef.current = new Audio(
      "/notifications/sent.mp3"
    );

    receivedSoundRef.current = new Audio(
      "/notifications/received.mp3"
    );

    sentSoundRef.current.load();
    receivedSoundRef.current.load();

    return () => {
      if (sentSoundRef.current) {
        sentSoundRef.current.pause();
        sentSoundRef.current = null;
      }

      if (receivedSoundRef.current) {
        receivedSoundRef.current.pause();
        receivedSoundRef.current = null;
      }
    };
  }, []);

  // ============================================================
  // PLAY SOUND
  // ============================================================

  const playSound = async (soundRef) => {
    if (!soundEnabled || !soundRef.current) return;

    try {
      soundRef.current.currentTime = 0;
      await soundRef.current.play();
    } catch (error) {
      console.log("Audio play failed:", error);
    }
  };

  // ============================================================
  // LOAD USERS
  // ============================================================

  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`${API_BASE_URL}/api/auth/users`)
      .then((res) => {
        setUsers(
          res.data.filter(
            (u) => u._id !== user._id
          )
        );
      })
      .catch((error) => {
        console.error("Error loading users:", error);
      });
  }, [user]);

  // ============================================================
  // LOAD CHATS
  // ============================================================

  const loadChats = async () => {
    if (!user?._id) return;

    setLoadingChats(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/chats/${user._id}`
      );

      const formatted = res.data.map((chat) => {
        const other = chat.members?.find(
          (m) => m._id !== user._id
        );

        return {
          ...chat,
          id: chat._id,
          name: chat.isGroup
            ? chat.name
            : other?.name || "User",
          lastMessage: chat.lastMessage || "",
          updatedAt:
            chat.updatedAt || new Date(),
          unreadCount: 0,
        };
      });

      const sorted = sortChats(formatted);

      setChats(sorted);

      // ========================================================
      // MOBILE EMPTY STATE
      // ========================================================

      if (sorted.length === 0) {
        setSelectedChat(null);
        setMobileView("empty");
      } else {
        setMobileView((current) => {
          if (current === "empty") {
            return "list";
          }

          return current;
        });
      }
    } catch (error) {
      console.error(
        "Error loading chats:",
        error
      );
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [user]);

  // ============================================================
  // JOIN ROOMS
  // ============================================================

  useEffect(() => {
    chats.forEach((chat) => {
      if (chat?.id) {
        socket.emit(
          "join_chat",
          chat.id
        );
      }
    });
  }, [chats]);

  // ============================================================
  // LOAD MESSAGES
  // ============================================================

  useEffect(() => {
    if (!selectedChat?.id) return;

    axios
      .get(
        `${API_BASE_URL}/api/messages/${selectedChat.id}`
      )
      .then((res) => {
        setMessages(res.data);

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  unreadCount: 0,
                }
              : chat
          )
        );
      })
      .catch((error) => {
        console.error(
          "Error loading messages:",
          error
        );
      });
  }, [selectedChat]);

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  const getProfileImage = () => {
    if (!user?.profilePic) {
      return "https://static.vecteezy.com/system/resources/previews/026/631/405/non_2x/human-icon-symbol-design-illustration-vector.jpg";
    }

    if (user.profilePic.startsWith("http")) {
      return user.profilePic;
    }

    return `${API_BASE_URL.replace(
      /\/$/,
      ""
    )}${user.profilePic}`;
  };

  // ============================================================
  // PROFILE IMAGE FOR PERSON
  // ============================================================

  const getProfileImageUrl = (person) => {
    if (!person?.profilePic) {
      return "https://static.vecteezy.com/system/resources/previews/026/631/405/non_2x/human-icon-symbol-design-illustration-vector.jpg";
    }

    if (person.profilePic.startsWith("http")) {
      return person.profilePic;
    }

    return `${API_BASE_URL.replace(
      /\/$/,
      ""
    )}${person.profilePic}`;
  };

  // ============================================================
  // UPDATE CHAT LAST MESSAGE
  // ============================================================

  const updateChatLastMessage = (
    chatId,
    messageText,
    senderId,
    senderName
  ) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map(
        (chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: messageText,
              updatedAt: new Date(),

              unreadCount:
                chat.id === selectedChat?.id
                  ? 0
                  : (chat.unreadCount || 0) + 1,
            };
          }

          return chat;
        }
      );

      return sortChats(updatedChats);
    });
  };

  // ============================================================
  // SOCKET MESSAGE
  // ============================================================

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const senderId =
        typeof msg.sender === "object"
          ? msg.sender._id
          : msg.sender;

      const isOwnMessage =
        senderId === user._id;

      // Incoming sound
      if (!isOwnMessage) {
        playSound(receivedSoundRef);
      }

      const messageKey =
        msg._id ||
        `${msg.chatId}_${msg.text}_${msg.createdAt}`;

      if (
        pendingMessagesRef.current.has(
          messageKey
        )
      ) {
        return;
      }

      pendingMessagesRef.current.set(
        messageKey,
        Date.now()
      );

      setTimeout(() => {
        pendingMessagesRef.current.delete(
          messageKey
        );
      }, 1000);

      // ========================================================
      // UPDATE MESSAGES
      // ========================================================

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            (m._id &&
              m._id === msg._id) ||
            (m.tempId &&
              m.tempId === msg.tempId)
        );

        if (exists) {
          return prev;
        }

        return [...prev, msg];
      });

      // ========================================================
      // UPDATE CHAT
      // ========================================================

      const senderName =
        typeof msg.sender === "object"
          ? msg.sender.name
          : "User";

      updateChatLastMessage(
        msg.chatId,
        msg.text,
        senderId,
        senderName
      );

      // ========================================================
      // TOAST
      // ========================================================

      const isCurrentChat =
        msg.chatId === selectedChat?.id;

      const shouldShowToast =
        !isCurrentChat &&
        !isOwnMessage;

      const toastKey = `${
        msg.chatId
      }_${msg.createdAt || Date.now()}`;

      if (
        shouldShowToast &&
        !toastShownRef.current.has(
          toastKey
        )
      ) {
        toastShownRef.current.add(
          toastKey
        );

        setTimeout(() => {
          toastShownRef.current.delete(
            toastKey
          );
        }, 1000);

        const sender =
          typeof msg.sender === "object"
            ? msg.sender
            : null;

        const toastSenderName =
          sender?.name || "New Message";

        let imageUrl =
          getProfileImageUrl(sender);

        if (!imageUrl) {
          imageUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`;
        }

        toast.custom((t) => (
          <div
            className={`${
              t.visible
                ? "animate-enter"
                : "animate-leave"
            } max-w-sm w-full bg-white shadow-xl rounded-xl flex items-center gap-3 p-3 border cursor-pointer`}
            onClick={() => {
              const chatToSelect =
                chats.find(
                  (chat) =>
                    chat.id ===
                    msg.chatId
                );

              if (chatToSelect) {
                setSelectedChat(
                  chatToSelect
                );

                setMobileView("chat");
              }

              toast.dismiss(t.id);
            }}
          >
            <img
              src={imageUrl}
              className="w-10 h-10 rounded-full object-cover"
              alt={toastSenderName}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/personas/svg?seed=${senderId}`;
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

            <span className="text-[10px] text-gray-400">
              now
            </span>
          </div>
        ));
      }
    };

    socket.on(
      "receive_message",
      handleMessage
    );

    return () => {
      socket.off(
        "receive_message",
        handleMessage
      );
    };
  }, [
    user,
    selectedChat,
    chats,
  ]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = () => {
    if (
      !newMessage.trim() ||
      !selectedChat?.id ||
      !user?._id
    ) {
      return;
    }

    playSound(sentSoundRef);

    const tempId = `temp_${Date.now()}_${Math.random()}`;

    const msg = {
      chatId: selectedChat.id,
      sender: user._id,
      text: newMessage,
      createdAt:
        new Date().toISOString(),
      tempId,
    };

    const localMsg = {
      ...msg,
      seen: false,
      _id: tempId,
      sender: user._id,
    };

    setMessages((prev) => [
      ...prev,
      localMsg,
    ]);

    updateChatLastMessage(
      selectedChat.id,
      newMessage,
      user._id,
      user.name
    );

    socket.emit(
      "send_message",
      msg
    );

    setNewMessage("");
  };

  // ============================================================
  // START CHAT
  // ============================================================

  const handleStartChat = async (
    contact
  ) => {
    if (
      !contact?._id ||
      !user?._id
    ) {
      return;
    }

    try {
      // ========================================================
      // CHECK EXISTING CHAT
      // ========================================================

      const existing = chats.find(
        (c) =>
          !c.isGroup &&
          c.members?.some(
            (m) =>
              m._id ===
              contact._id
          )
      );

      if (existing) {
        setSelectedChat(existing);
        setShowModal(false);

        // Mobile opens chat
        setMobileView("chat");

        return;
      }

      // ========================================================
      // CREATE NEW CHAT
      // ========================================================

      const res =
        await axios.post(
          `${API_BASE_URL}/api/chats`,
          {
            senderId: user._id,
            receiverId:
              contact._id,
          }
        );

      const newChat = {
        ...res.data,

        id: res.data._id,

        name: contact.name,

        lastMessage: "",

        updatedAt:
          new Date(),

        unreadCount: 0,
      };

      // ========================================================
      // UPDATE CHAT LIST
      // ========================================================

      setChats((prev) =>
        sortChats([
          newChat,
          ...prev,
        ])
      );

      // ========================================================
      // SELECT CHAT
      // ========================================================

      setSelectedChat(
        newChat
      );

      // ========================================================
      // CLOSE MODAL
      // ========================================================

      setShowModal(false);

      // ========================================================
      // MOBILE OPEN CHAT
      // ========================================================

      setMobileView("chat");
    } catch (error) {
      console.error(
        "Error starting chat:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to start conversation"
      );
    }
  };

  // ============================================================
  // CREATE GROUP
  // ============================================================

  const createGroup = async (
    name,
    list
  ) => {
    if (
      !name?.trim() ||
      !list?.length
    ) {
      return;
    }

    try {
      const res =
        await axios.post(
          `${API_BASE_URL}/api/chats/group`,
          {
            name: name.trim(),
            members: [
              user._id,
              ...list.map(
                (u) => u._id
              ),
            ],
          }
        );

      const group = {
        ...res.data,

        id: res.data._id,

        lastMessage: "",

        updatedAt:
          new Date(),

        isGroup: true,

        unreadCount: 0,
      };

      setChats((prev) =>
        sortChats([
          group,
          ...prev,
        ])
      );

      setSelectedChat(
        group
      );

      setGroupName("");
      setSelectedUsers([]);

      setShowGroupModal(
        false
      );

      setMobileView("chat");
    } catch (error) {
      console.error(
        "Error creating group:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Failed to create group"
      );
    }
  };

  // ============================================================
  // FLOATING CHAT MESSAGE
  // ============================================================

  const handleFloatingChatMessage = (
    message
  ) => {
    if (
      !message ||
      !selectedChat?.id
    ) {
      return;
    }

    updateChatLastMessage(
      selectedChat.id,
      message.text,
      user._id,
      user.name
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
        <div className="text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  // ============================================================
  // CHAT ACTIONS
  // ============================================================

  const muteChat = (chat) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chat.id
          ? {
              ...c,
              muted: !c.muted,
            }
          : c
      )
    );
  };

  const archiveChat = (chat) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chat.id
          ? {
              ...c,
              archived:
                !c.archived,
            }
          : c
      )
    );
  };

  const deleteChat = (chat) => {
    setChats((prev) =>
      prev.filter(
        (c) =>
          c.id !== chat.id
      )
    );

    if (
      selectedChat?.id ===
      chat.id
    ) {
      setSelectedChat(null);

      if (chats.length <= 1) {
        setMobileView("empty");
      } else {
        setMobileView("list");
      }
    }
  };

  const restoreChat = async (
    chat
  ) => {
    try {
      await fetch(
        `${API_BASE_URL}/chat/restore/${chat._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      setChats((prev) => {
        const exists =
          prev.find(
            (c) =>
              c._id ===
              chat._id
          );

        if (exists) {
          return prev;
        }

        return [
          chat,
          ...prev,
        ];
      });
    } catch (error) {
      console.error(
        "Restore failed:",
        error
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#9F6BFF] to-[#7B61FF]">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <SideBar
        user={user}
        setShowModal={setShowModal}
        setShowGroupModal={
          setShowGroupModal
        }
        showSidebar={
          showSidebar
        }
        setShowSidebar={
          setShowSidebar
        }
      />

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="flex flex-1 min-w-0 overflow-hidden">
        <Routes>
          {/* ====================================================
              CHATS
          ==================================================== */}

          <Route
            path="chats"
            element={
              <div className="flex flex-1 min-w-0 h-full">
                {/* =================================================
                    CHAT LIST

                    MOBILE:
                    Hide when there are no chats or when viewing chat.

                    DESKTOP:
                    Always show.
                ================================================== */}

                <ChatList
                  chats={chats}
                  setChats={setChats}
                  user={user}
                  users={users}
                  selectedChat={
                    selectedChat
                  }
                  setSelectedChat={(
                    chat
                  ) => {
                    setSelectedChat(
                      chat
                    );

                    setMobileView(
                      "chat"
                    );
                  }}
                  onChatMenuOpen={
                    setChatMenu
                  }
                  setShowSidebar={
                    setShowSidebar
                  }
                  onAddContact={() =>
                    setShowModal(
                      true
                    )
                  }
                  loading={
                    loadingChats
                  }
                  className={`
                    ${
                      mobileView ===
                      "chat"
                        ? "hidden md:flex"
                        : ""
                    }
                    ${
                      mobileView ===
                        "empty" &&
                      chats.length ===
                        0
                        ? "hidden md:flex"
                        : ""
                    }
                  `}
                />

                {/* =================================================
                    CHAT ACTION MENU
                ================================================== */}

                <ChatActionMenu
                  menu={chatMenu}
                  setMenu={setChatMenu}
                  onOpenChat={(
                    chat
                  ) => {
                    setSelectedChat(
                      chat
                    );

                    setMobileView(
                      "chat"
                    );
                  }}
                  onMuteChat={
                    muteChat
                  }
                  onArchiveChat={
                    archiveChat
                  }
                  onDeleteChat={
                    deleteChat
                  }
                  onRestoreChat={
                    restoreChat
                  }
                />

                {/* =================================================
                    CHAT WINDOW

                    MOBILE:
                    Show empty state when there are no chats.
                    Show chat when a chat is selected.

                    DESKTOP:
                    Always show.
                ================================================== */}

                <ChatWindow
                  selectedChat={
                    selectedChat
                  }
                  messages={
                    messages
                  }
                  newMessage={
                    newMessage
                  }
                  setNewMessage={
                    setNewMessage
                  }
                  handleSendMessage={
                    handleSendMessage
                  }
                  user={user}
                  setShowSidebar={
                    setShowSidebar
                  }
                  setMobileView={
                    setMobileView
                  }
                  onAddContact={() =>
                    setShowModal(
                      true
                    )
                  }
                  loading={
                    loadingChats
                  }
                  className={`
                    ${
                      mobileView ===
                        "list" &&
                      chats.length >
                        0
                        ? "hidden md:flex"
                        : "flex"
                    }
                  `}
                />
              </div>
            }
          />

          {/* ====================================================
              SETTINGS
          ==================================================== */}

          <Route
            path="settings"
            element={
              <Settings
                user={user}
                setUser={setUser}
                soundEnabled={
                  soundEnabled
                }
                setShowSidebar={
                  setShowSidebar
                }
                toggleSound={() => {
                  const newValue =
                    !soundEnabled;

                  setSoundEnabled(
                    newValue
                  );

                  localStorage.setItem(
                    "soundEnabled",
                    newValue
                  );
                }}
              />
            }
          />

          {/* ====================================================
              DEFAULT
          ==================================================== */}

          <Route
            path="*"
            element={
              <Navigate to="chats" />
            }
          />
        </Routes>
      </main>

      {/* ========================================================
          FLOATING CHAT
      ======================================================== */}

      {user && (
        <FloatingChat
          user={user}
          selectedChat={
            selectedChat
          }
          socket={socket}
          onMessageSent={
            handleFloatingChatMessage
          }
        />
      )}

      {/* ========================================================
          ADD CONTACT MODAL
      ======================================================== */}

      {showModal && (
        <AddContactModal
          users={users}
          search={search}
          setSearch={setSearch}
          startChat={
            handleStartChat
          }
          closeModal={() =>
            setShowModal(
              false
            )
          }
        />
      )}

      {/* ========================================================
          GROUP MODAL
      ======================================================== */}

      {showGroupModal && (
        <GroupModal
          users={users}
          groupName={
            groupName
          }
          setGroupName={
            setGroupName
          }
          selectedUsers={
            selectedUsers
          }
          setSelectedUsers={
            setSelectedUsers
          }
          createGroup={
            createGroup
          }
          closeModal={() =>
            setShowGroupModal(
              false
            )
          }
        />
      )}
    </div>
  );
}