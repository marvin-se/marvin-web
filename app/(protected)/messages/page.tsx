"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

// --- TYPES (Matching Spring Boot DTOs) ---
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
  product: ProductResponse
  userId: number
  lastMessage: LastMessageDTO | null
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

  // --- ACTION HANDLERS ---
  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    console.log("Sending message to chat ID:", selectedChatId)
    console.log("Content:", messageInput)

    // TODO: Implement the POST /messages endpoint in Spring Boot to actually save this!
    // For now, we just clear the input to simulate sending.
    setMessageInput("")
  }

  // Helper to find the active object
  const activeChat = conversations.find((c) => c.id === selectedChatId)
  const isLastMessageMine = activeChat?.lastMessage && user?.id
    ? activeChat.lastMessage.senderId === user.id
    : false

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 h-[calc(100vh-80px)] flex gap-4 py-4">
        
        {/* --- LEFT: Chat List --- */}
        <div className="w-full md:w-80 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{ color: secondaryColor }}>Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
               <div className="p-4 text-gray-500 text-sm">Loading...</div>
            ) : conversations.length === 0 ? (
               <div className="p-4 text-gray-500 text-sm">No conversations found.</div>
            ) : (
              conversations.map((chat) => (
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
                          {chat.product?.title || "Product"} - User #{chat.userId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chat.lastMessage 
                            ? new Date(chat.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : "New"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{chat.product?.title}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage?.content || <span className="text-blue-500 italic">Start a conversation...</span>}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT: Chat Window --- */}
        <div className="hidden md:flex flex-1 flex-col bg-white rounded-xl border border-gray-200">
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
                      User #{activeChat.userId}
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
                {activeChat.lastMessage ? (
                  // Show last message aligned by sender (Placeholder until full history API exists)
                  <div className={`flex ${isLastMessageMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-xs px-4 py-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: isLastMessageMine ? primaryColor : "#f3f4f6",
                        color: isLastMessageMine ? "#fff" : "#111827",
                      }}
                    >
                       <p>{activeChat.lastMessage.content}</p>
                       <p className="text-[11px] opacity-75 mt-1">
                         {new Date(activeChat.lastMessage.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                       </p>
                    </div>
                  </div>
                ) : (
                  // Empty State for New Chats
                  <div className="text-center text-gray-400 mt-10">
                    <p>This is the start of your conversation with User #{activeChat.userId}.</p>
                    <p className="text-sm mt-2">Ask about <strong>{activeChat.product?.title}</strong>!</p>
                  </div>
                )}
                
                <div className="text-center text-xs text-red-400 mt-4 opacity-50">
                  (Note: Only showing last message. Full history requires backend update.)
                </div>
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
    </main>
  )
}