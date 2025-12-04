"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const sellerFromParam = searchParams?.get("seller")
  const [selectedChat, setSelectedChat] = useState(0)
  const [messageInput, setMessageInput] = useState("")

  // Mock chat data
  const chats = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "Is this still available?",
      timestamp: "2:30 PM",
      unread: 2,
      item: "Calculus Textbook",
      messages: [
        { id: 1, sender: "Sarah", text: "Is this still available?", timestamp: "2:15 PM" },
        { id: 2, sender: "You", text: "Yes, it is! Still in great condition.", timestamp: "2:20 PM" },
        { id: 3, sender: "Sarah", text: "Can we meet tomorrow at the main campus?", timestamp: "2:30 PM" },
      ],
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "Great price!",
      timestamp: "1:15 PM",
      unread: 0,
      item: "Monitor 27 inch",
      messages: [
        { id: 1, sender: "Mike", text: "How much for the monitor?", timestamp: "12:00 PM" },
        { id: 2, sender: "You", text: "$180", timestamp: "12:05 PM" },
        { id: 3, sender: "Mike", text: "Great price!", timestamp: "1:15 PM" },
      ],
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "Thanks!",
      timestamp: "11:45 AM",
      unread: 0,
      item: "Winter Jacket",
      messages: [
        { id: 1, sender: "Alex", text: "Is the jacket size M available?", timestamp: "11:30 AM" },
        { id: 2, sender: "You", text: "Yes, it is. Perfect condition.", timestamp: "11:35 AM" },
        { id: 3, sender: "Alex", text: "Thanks!", timestamp: "11:45 AM" },
      ],
    },
  ]

  // Auto-select chat if coming from listing detail page
  useEffect(() => {
    if (sellerFromParam) {
      const existingChatIndex = chats.findIndex(
        (chat) => chat.name.toLowerCase() === sellerFromParam.toLowerCase()
      )
      if (existingChatIndex !== -1) {
        setSelectedChat(existingChatIndex)
      }
    }
  }, [sellerFromParam])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-6xl px-4 h-[calc(100vh-80px)] flex gap-4 py-4">
        {/* Chat List */}
        <div className="w-full md:w-80 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{ color: secondaryColor }}>Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat, idx) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(idx)}
                className={`w-full p-4 border-b border-gray-200 text-left transition-colors ${
                  selectedChat === idx ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
                style={{ borderLeftColor: selectedChat === idx ? primaryColor : 'transparent', borderLeftWidth: selectedChat === idx ? '4px' : '0px' }}
              >
                <div className="flex gap-3">
                  <img
                    src={chat.avatar || "/placeholder.svg"}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full bg-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate" style={{ color: secondaryColor }}>{chat.name}</p>
                      <p className="text-xs text-gray-500">{chat.timestamp}</p>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{chat.item}</p>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                      {chat.unread}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-white rounded-xl border border-gray-200">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={chats[selectedChat].avatar || "/placeholder.svg"}
                alt={chats[selectedChat].name}
                className="w-10 h-10 rounded-full bg-gray-300"
              />
              <div>
                <p className="font-semibold" style={{ color: secondaryColor }}>{chats[selectedChat].name}</p>
                <p className="text-xs text-gray-600">{chats[selectedChat].item}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg text-xl font-bold">
              ⋮
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chats[selectedChat].messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === "You" ? "text-white" : "bg-gray-100 text-gray-900"
                  }`}
                  style={msg.sender === "You" ? { backgroundColor: primaryColor } : {}}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
              className="rounded-lg border-gray-300"
            />
            <Button
              onClick={handleSendMessage}
              className="text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
              size="icon"
            >
              ➤
            </Button>
          </div>
        </div>

        {/* Mobile Message View */}
        <div className="md:hidden flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <img
              src={chats[selectedChat].avatar || "/placeholder.svg"}
              alt={chats[selectedChat].name}
              className="w-8 h-8 rounded-full bg-gray-300"
            />
            <div>
              <p className="font-semibold text-sm" style={{ color: secondaryColor }}>{chats[selectedChat].name}</p>
              <p className="text-xs text-gray-600">{chats[selectedChat].item}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chats[selectedChat].messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 text-sm rounded-lg ${
                    msg.sender === "You" ? "text-white" : "bg-gray-100 text-gray-900"
                  }`}
                  style={msg.sender === "You" ? { backgroundColor: primaryColor } : {}}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <Input
              placeholder="Message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage()
              }}
              className="rounded-lg text-sm border-gray-300"
            />
            <Button
              onClick={handleSendMessage}
              className="text-white rounded-lg"
              style={{ backgroundColor: primaryColor }}
              size="sm"
            >
              ➤
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
