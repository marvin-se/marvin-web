"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Client } from "@stomp/stompjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

// --- TYPES (Matching Spring Boot DTOs) ---
interface MessageDTO {
  id: number
  senderId: number
  receiverId: number
  content: string
  sentAt: string
  read: boolean
}

interface LastMessageDTO {
  id: number
  senderId: number
  content: string
  isRead: boolean
  sentAt: string
}

interface ProductResponse {
  id: number
  title: string
  price?: number
  description?: string
}

interface ConversationDTO {
  id: number
  username: string
  product: ProductResponse
  userId: number
  lastMessage: LastMessageDTO | null
  messages?: MessageDTO[]
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const sellerFromParam = searchParams?.get("seller")
  const productNameParam = searchParams?.get("productName")
  const { user } = useAuth()
  
  // State
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentMessages, setCurrentMessages] = useState<MessageDTO[]>([])
  
  // WebSocket
  const stompClientRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "nearest" // <-- BU SATIR HAYAT KURTARIR
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  // --- WEBSOCKET CONNECTION ---
  // --- WEBSOCKET CONNECTION ---
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    // Create the client instance
    const client = new Client({
      brokerURL: "ws://localhost:8080/campustrade/wst",
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // console.log(str) // Uncomment to see debug logs
      },
      reconnectDelay: 5000, // Automagically reconnects if connection is lost
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    // Define what happens on successful connection
    client.onConnect = (frame) => {
      console.log("WebSocket connected")
      stompClientRef.current = client

      // Subscribe to conversation updates when chat is selected
      if (selectedChatId && selectedChatId > 0) {
        client.subscribe(`/topic/conversations/${selectedChatId}`, (message) => {
          const newMessage = JSON.parse(message.body)
          
          setCurrentMessages((prev) => [
            ...prev,
            {
              id: newMessage.messageId, // Veya newMessage.id (Backend DTO'na göre)
              senderId: newMessage.senderId, 
              
              receiverId: newMessage.receiverId,
              content: newMessage.content,
              sentAt: newMessage.sentAt,
              read: false,
            },
          ])
        })
      }
    }

    // Handle errors
    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"])
      console.error("Additional details: " + frame.body)
    }

    // Activate the client
    client.activate()

    // Cleanup on unmount
    return () => {
      client.deactivate()
      console.log("WebSocket disconnected")
    }
  }, [selectedChatId, user?.id])

  // --- LOAD FULL CONVERSATION ---
  const loadFullConversation = async (chatId: number, otherUserId: number, productId: number) => {
    try {
      const response = await api.get(`/messages/conversations/${otherUserId}/${productId}`)
      const fullConvo = response.data as ConversationDTO
      
      // Update the conversation in the list with full messages
      setConversations(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: fullConvo.messages } : c
      ))
      
      // Set current messages for display
      setCurrentMessages(fullConvo.messages || [])
    } catch (error) {
      console.error("Error loading conversation:", error)
      setCurrentMessages([])
    }
  }

  // --- MASTER EFFECT: Fetch Data & Handle URL Params ---
  useEffect(() => {
    async function fetchAndSetupChats() {
      try {
        // 1. Get token from the canonical storage key used by AuthContext
        const token = localStorage.getItem("token")

        if (!token) {
           console.error("No access token found. User is likely not logged in.")
           setIsLoading(false)
           return
        }

        // 2. Fetch conversations through the Next.js proxy to avoid CORS issues
        const response = await api.get("/messages")

        let fetchedChats: ConversationDTO[] = []
        const payload = response.data as any
        fetchedChats = Array.isArray(payload) ? payload : (payload?.conversations || [])

        // 3. Handle "Message Seller" Logic (Phantom Chat)
        if (sellerFromParam) {
          const targetSellerId = parseInt(sellerFromParam)
          
          // Check if chat exists in DB list
          const existingChat = fetchedChats.find(c => c.userId === targetSellerId)

          if (existingChat) {
            // Chat exists -> Select it
            setSelectedChatId(existingChat.id)
          } else {
            // Chat DOES NOT exist -> Create "Phantom" chat for UI
            const phantomChat: ConversationDTO = {
              id: -999, // Negative ID signals "Not saved in DB yet"
              userId: targetSellerId,
              username: `User ${targetSellerId}`, // Placeholder for new chats
              product: { 
                id: 0, 
                title: productNameParam || "New Inquiry" 
              },
              lastMessage: null
            }
            
            // Add phantom chat to top of list
            fetchedChats = [phantomChat, ...fetchedChats]
            setSelectedChatId(-999) 
          }
        } 
        
        setConversations(fetchedChats)
        
      } catch (error) {
        console.error("Error in MessagesPage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndSetupChats()
  }, [sellerFromParam, productNameParam]) // Depend on params so it re-runs if URL changes

  // --- LOAD CONVERSATION WHEN SELECTED ---
  useEffect(() => {
    if (selectedChatId && selectedChatId > 0) {
      const activeChat = conversations.find(c => c.id === selectedChatId)
      if (activeChat && !activeChat.messages) {
        loadFullConversation(selectedChatId, activeChat.userId, activeChat.product.id)
      } else if (activeChat?.messages) {
        setCurrentMessages(activeChat.messages)
      }
    } else {
      setCurrentMessages([])
    }
  }, [selectedChatId])

  // --- ACTION HANDLERS ---
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChatId) return

    const activeChat = conversations.find(c => c.id === selectedChatId)
    if (!activeChat) return

    // For phantom chats (new conversations), we need to use the product ID
    const productId = activeChat.product.id
    const receiverId = activeChat.userId 

    if (stompClientRef.current && stompClientRef.current.active) {
      const payload = {
        productId: productId,
        content: messageInput.trim(),
        receiverId: receiverId 
      }

      stompClientRef.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload)
      })

      console.log("Message sent via WebSocket:", payload)
      setMessageInput("")
    } else {
      console.error("WebSocket is not connected.")
    }
  }

  // Helper to find the active object
  const activeChat = conversations.find((c) => c.id === selectedChatId)

  return (
    <main className="min-h-screen pt-12">
      <div className="mx-auto max-w-6xl px-4 h-[calc(100vh-80px)] flex py-4">
        
        {/* --- Unified Container --- */}
        <div className="flex w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
        
        {/* --- LEFT: Chat List --- */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{ color: secondaryColor }}>Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-gray-500 text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No conversations found.</div>
            ) : (
              conversations.map((chat) => {
                // --- ADD THIS CHECK ---
                // If there is no product or no product title, do not render this chatbox
                if (!chat.product?.title) return null; 

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full p-4 border-b border-gray-200 text-left transition-colors ${
                      selectedChatId === chat.id ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                    style={{
                      borderLeftColor: selectedChatId === chat.id ? primaryColor : 'transparent',
                      borderLeftWidth: selectedChatId === chat.id ? '4px' : '0px'
                    }}
                  >
                    <div className="flex gap-3">
                      <img
                        src={"https://github.com/shadcn.png"}
                        alt="User"
                        className="w-10 h-10 rounded-full bg-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate" style={{ color: secondaryColor }}>
                            {/* Now we don't need the fallback "|| Product" because we filtered them out */}
                            {chat.product.title} - {chat.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {chat.lastMessage
                              ? new Date(chat.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : "New"}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{chat.product.title}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage?.content || <span className="text-blue-500 italic">Start a conversation...</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* --- RIGHT: Chat Window --- */}
        <div className="hidden md:flex flex-1 flex-col">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={"https://github.com/shadcn.png"}
                    alt="User"
                    className="w-10 h-10 rounded-full bg-gray-300"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: secondaryColor }}>
                      {activeChat.username}
                    </p>
                    <p className="text-xs text-gray-600">{activeChat.product?.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-lg text-xl font-bold">
                  ⋮
                </Button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => {
                    const isMyMessage = message.senderId === user?.id
                    return (
                      <div key={message.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-xs px-4 py-2 rounded-lg text-sm"
                          style={{
                            backgroundColor: isMyMessage ? primaryColor : "#f3f4f6",
                            color: isMyMessage ? "#fff" : "#111827",
                          }}
                        >
                          <p>{message.content}</p>
                          <p className="text-[11px] opacity-75 mt-1">
                            {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  // Empty State for New Chats
                  <div className="text-center text-gray-400 mt-10">
                    <p>This is the start of your conversation with {activeChat?.username}.</p>
                    <p className="text-sm mt-2">Ask about <strong>{activeChat?.product?.title}</strong>!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start chatting
            </div>
          )}
        </div>

        </div>
      </div>
    </main>
  )
}