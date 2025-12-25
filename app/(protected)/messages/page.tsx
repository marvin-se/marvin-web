"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Client } from "@stomp/stompjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { markAsSold, getListingDetailById, getListingImages } from "@/lib/api/listings"
import { AlertTriangle, CheckCircle } from "lucide-react"

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
  sellerId?: number
}

interface ConversationDTO {
  id: number
  username: string
  product: ProductResponse
  userId: number
  lastMessage: LastMessageDTO | null
  messages?: MessageDTO[]
  imageUrl?: string  // Product image URL from backend
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const sellerFromParam = searchParams?.get("seller")
  const productNameParam = searchParams?.get("productName")
  const productIdParam = searchParams?.get("productId")
  const sellerNameParam = searchParams?.get("sellerName")
  const { user } = useAuth()
  
  // State
  const [conversations, setConversations] = useState<ConversationDTO[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentMessages, setCurrentMessages] = useState<MessageDTO[]>([])
  const [isProductSold, setIsProductSold] = useState(false)
  const [isMarkingSold, setIsMarkingSold] = useState(false)
  const [productSellerId, setProductSellerId] = useState<number | null>(null)
  
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
          const incoming = JSON.parse(message.body)

          // Normalize backend payload differences
          // Supports both { id } and { messageId }, may omit senderId
          const activeChat = conversations.find(c => c.id === selectedChatId)
          const currentUserId = user?.id ?? 0
          const receiverId = incoming.receiverId
          const computedSenderId =
            typeof incoming.senderId === "number"
              ? incoming.senderId
              : (receiverId === currentUserId ? (activeChat?.userId ?? 0) : currentUserId)

          const normalized: MessageDTO = {
            id: typeof incoming.messageId === "number" ? incoming.messageId : (incoming.id ?? Date.now()),
            senderId: computedSenderId,
            receiverId: receiverId,
            content: incoming.content,
            sentAt: incoming.sentAt,
            read: false,
          }

          setCurrentMessages((prev) => {
            // Guard: avoid duplicates by id OR by same content+sender within 5 seconds
            if (prev.some(m => m.id === normalized.id)) return prev
            
            // Also check for optimistic messages with same content from same sender (within 5 sec)
            const isDuplicateContent = prev.some(m => 
              m.senderId === normalized.senderId && 
              m.content === normalized.content &&
              Math.abs(new Date(m.sentAt).getTime() - new Date(normalized.sentAt).getTime()) < 5000
            )
            if (isDuplicateContent) return prev
            
            const next = [...prev, normalized]

            // Update lastMessage AND persist messages for the active conversation
            setConversations((prevConvos) => prevConvos.map(c => {
              if (c.id !== selectedChatId) return c
              
              // Append to existing messages array (with dedupe)
              const existingMessages = c.messages || []
              const alreadyExists = existingMessages.some(m => m.id === normalized.id)
              const alreadyHasContent = existingMessages.some(m => 
                m.senderId === normalized.senderId && 
                m.content === normalized.content &&
                Math.abs(new Date(m.sentAt).getTime() - new Date(normalized.sentAt).getTime()) < 5000
              )
              if (alreadyExists || alreadyHasContent) {
                // Just update lastMessage, don't add duplicate
                return {
                  ...c,
                  lastMessage: {
                    id: normalized.id,
                    senderId: normalized.senderId,
                    content: normalized.content,
                    isRead: false,
                    sentAt: normalized.sentAt,
                  },
                }
              }
              
              return {
                ...c,
                messages: [...existingMessages, normalized],
                lastMessage: {
                  id: normalized.id,
                  senderId: normalized.senderId,
                  content: normalized.content,
                  isRead: false,
                  sentAt: normalized.sentAt,
                },
              }
            }))

            return next
          })
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

        // 2.5 Fetch presigned image URLs for each conversation's product
        const chatsWithImages = await Promise.all(
          fetchedChats.map(async (chat) => {
            // If imageUrl is already a full URL (presigned), use it
            // Otherwise, fetch the presigned URL from the product images endpoint
            if (chat.product?.id && (!chat.imageUrl || !chat.imageUrl.startsWith('http'))) {
              try {
                const images = await getListingImages(chat.product.id)
                return {
                  ...chat,
                  imageUrl: images.length > 0 ? images[0].url : "/placeholder.svg"
                }
              } catch (e) {
                console.warn(`Failed to fetch images for product ${chat.product.id}`)
                return { ...chat, imageUrl: "/placeholder.svg" }
              }
            }
            return chat
          })
        )
        fetchedChats = chatsWithImages

        // 3. Handle "Message Seller" Logic (Phantom Chat)
        if (sellerFromParam) {
          const targetSellerId = parseInt(sellerFromParam)
          const targetProductId = productIdParam ? parseInt(productIdParam) : 0
          
          // Check if chat exists in DB list - match BOTH userId AND productId
          const existingChat = fetchedChats.find(c => 
            c.userId === targetSellerId && c.product.id === targetProductId
          )

          if (existingChat) {
            // Chat exists -> Select it
            setSelectedChatId(existingChat.id)
          } else {
            // Chat DOES NOT exist -> Create "Phantom" chat for UI
            // First fetch the product image
            let phantomImageUrl = "/placeholder.svg"
            if (targetProductId > 0) {
              try {
                const images = await getListingImages(targetProductId)
                if (images.length > 0) {
                  phantomImageUrl = images[0].url
                }
              } catch (e) {
                console.warn("Failed to fetch image for phantom chat product")
              }
            }
            
            const phantomChat: ConversationDTO = {
              id: -999, // Negative ID signals "Not saved in DB yet"
              userId: targetSellerId,
              username: sellerNameParam || `User ${targetSellerId}`, // Use actual seller name from URL
              product: { 
                id: targetProductId, 
                title: productNameParam || "New Inquiry" 
              },
              lastMessage: null,
              imageUrl: phantomImageUrl
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
  }, [sellerFromParam, productNameParam, productIdParam, sellerNameParam]) // Depend on params so it re-runs if URL changes

  // --- LOAD CONVERSATION WHEN SELECTED ---
  useEffect(() => {
    const loadConversation = async () => {
      if (selectedChatId && selectedChatId > 0) {
        const activeChat = conversations.find(c => c.id === selectedChatId)
        if (activeChat && !activeChat.messages) {
          loadFullConversation(selectedChatId, activeChat.userId, activeChat.product.id)
        } else if (activeChat?.messages) {
          setCurrentMessages(activeChat.messages)
        }
        
        // Fetch product details to get sellerId
        if (activeChat?.product?.id) {
          try {
            console.log("Fetching product details for id:", activeChat.product.id)
            const productData = await getListingDetailById(activeChat.product.id.toString())
            console.log("Full Product data:", productData)
            
            const sellerId = productData.sellerId ?? null
            console.log("Extracted sellerId:", sellerId, "Current user:", user?.id)
            
            setProductSellerId(sellerId)
            setIsProductSold(productData.status === 'SOLD')
          } catch (error) {
            console.error("Failed to fetch product details:", error)
            setProductSellerId(null)
          }
        }
      } else if (selectedChatId === -999) {
        // For phantom chats, use the productId from URL params
        const targetProductId = productIdParam ? parseInt(productIdParam) : 0
        if (targetProductId > 0) {
          try {
            console.log("Fetching product details for phantom chat, id:", targetProductId)
            const productData = await getListingDetailById(targetProductId.toString())
            console.log("Full Product data (phantom):", productData)
            
            const sellerId = productData.sellerId ?? null
            console.log("Extracted sellerId (phantom):", sellerId, "Current user:", user?.id)
            
            setProductSellerId(sellerId)
            setIsProductSold(productData.status === 'SOLD')
          } catch (error) {
            console.error("Failed to fetch product details:", error)
            setProductSellerId(null)
          }
        }
      } else {
        setCurrentMessages([])
        setProductSellerId(null)
        setIsProductSold(false)
      }
    }
    
    loadConversation()
  }, [selectedChatId, productIdParam])

  // --- ACTION HANDLERS ---
  const handleMarkAsSold = async () => {
    if (!activeChat || isMarkingSold) return
    
    // Use conversation ID (not product ID) - backend expects conversation ID
    // to find both buyer and seller from the conversation participants
    setIsMarkingSold(true)
    try {
      await markAsSold(activeChat.id.toString())
      setIsProductSold(true)
    } catch (error) {
      console.error("Failed to mark item as sold:", error)
    } finally {
      setIsMarkingSold(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId || isProductSold) return

    const activeChat = conversations.find(c => c.id === selectedChatId)
    if (!activeChat) return

    // For phantom chats (new conversations), we need to use the product ID
    const productId = activeChat.product.id
    const receiverId = activeChat.userId 
    const isPhantomChat = selectedChatId === -999

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
      
      // Optimistically add the sent message to UI and conversation state
      const optimisticMessage: MessageDTO = {
        id: Date.now(), // Temporary ID, will be replaced by server echo
        senderId: user?.id ?? 0,
        receiverId: receiverId,
        content: payload.content,
        sentAt: new Date().toISOString(),
        read: false,
      }
      
      setCurrentMessages(prev => {
        if (prev.some(m => m.content === optimisticMessage.content && m.senderId === optimisticMessage.senderId)) return prev
        return [...prev, optimisticMessage]
      })
      
      // Persist in conversation state so it survives navigation
      setConversations(prev => prev.map(c => {
        if (c.id !== selectedChatId) return c
        const existingMessages = c.messages || []
        return {
          ...c,
          messages: [...existingMessages, optimisticMessage],
          lastMessage: {
            id: optimisticMessage.id,
            senderId: optimisticMessage.senderId,
            content: optimisticMessage.content,
            isRead: false,
            sentAt: optimisticMessage.sentAt,
          },
        }
      }))
      
      setMessageInput("")

      // If this is a phantom chat, fetch the real conversation after sending
      if (isPhantomChat) {
        // Wait a bit for backend to process
        setTimeout(async () => {
          try {
            const response = await api.get(`/messages/conversations/${receiverId}/${productId}`)
            const realConvo = response.data as ConversationDTO
            
            // Replace phantom chat with real conversation
            setConversations(prev => prev.map(c => 
              c.id === -999 ? realConvo : c
            ))
            
            // Update selected chat ID to the real one
            setSelectedChatId(realConvo.id)
            
            // Update current messages
            setCurrentMessages(realConvo.messages || [])
          } catch (error) {
            console.error("Error fetching new conversation:", error)
          }
        }, 500) // Small delay to let backend create the conversation
      }
    } else {
      console.error("WebSocket is not connected.")
    }
  }

  // Helper to find the active object
  const activeChat = conversations.find((c) => c.id === selectedChatId)
  
  // Debug: check seller ownership
  const isCurrentUserSeller = activeChat?.product?.sellerId === user?.id || productSellerId === user?.id
  console.log("Debug seller check:", {
    productSellerId,
    "activeChat.product.sellerId": activeChat?.product?.sellerId,
    "user.id": user?.id,
    isCurrentUserSeller,
    isProductSold
  })

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
                        src={chat.imageUrl || "/placeholder.svg"}
                        alt="Product"
                        className="w-10 h-10 rounded-full bg-gray-300 object-cover"
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
                    src={activeChat.imageUrl || "/placeholder.svg"}
                    alt="Product"
                    className="w-10 h-10 rounded-full bg-gray-300 object-cover"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: secondaryColor }}>
                      {activeChat.username}
                    </p>
                    <p className="text-xs text-gray-600">{activeChat.product?.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mark as Sold button - only visible to seller (product owner) 
                      Check if product sellerId matches current user, or use fetched productSellerId */}
                  {!isProductSold && (activeChat.product?.sellerId === user?.id || productSellerId === user?.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAsSold}
                      disabled={isMarkingSold}
                      className="font-semibold text-green-700 hover:bg-green-100 bg-green-50 border border-green-200"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Sold
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="rounded-lg text-xl font-bold">
                    ⋮
                  </Button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isProductSold && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">This item has been marked as sold</span>
                  </div>
                )}
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => {
                    const isMyMessage = message.senderId === user?.id
                    const isSystemMessage = message.senderId === 0
                    
                    if (isSystemMessage) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 text-center">
                            <p className="font-semibold">{message.content}</p>
                          </div>
                        </div>
                      )
                    }
                    
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
                  placeholder={isProductSold ? "This item is sold" : "Type a message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendMessage()
                  }}
                  className="rounded-lg border-gray-300"
                  disabled={isProductSold}
                />
                <Button
                  onClick={handleSendMessage}
                  className="text-white rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                  size="icon"
                  disabled={isProductSold}
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