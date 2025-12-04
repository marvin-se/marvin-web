"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/listing-card"
import { User, Listing } from "@/lib/types"
import { Share2 } from "lucide-react"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<User | null>(null)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with API call: const profile = await fetchUserProfile(userId)
    // For now, using mock data
    setProfile({
      id: 1,
      full_name: "Alex Chen", // decodeURIComponent(userId),
      email: `${userId}@university.edu`,
      university: "State University",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
      items_sold: 12,
      items_purchased: 8,
      items_listed: 5,
    })
    
    // TODO: Replace with API call: const listings = await fetchUserListings(userId)
    // Mock listings for other users
    setUserListings([
      {
        id: 10,
        title: "Physics Textbook",
        description: "Comprehensive physics textbook with all chapters.",
        price: 55,
        image_url: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2787&auto=format&fit=crop",
        category: "Books",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: userId,
      },
      {
        id: 11,
        title: "Gaming Chair",
        description: "Comfortable gaming chair in excellent condition.",
        price: 120,
        image_url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=2787&auto=format&fit=crop",
        category: "Furniture",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: userId,
      },
      {
        id: 12,
        title: "Wireless Mouse",
        description: "Ergonomic wireless mouse, barely used.",
        price: 35,
        image_url: "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=2788&auto=format&fit=crop",
        category: "Electronics",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: userId,
      },
      {
        id: 13,
        title: "Backpack",
        description: "Durable backpack perfect for campus life.",
        price: 40,
        image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2787&auto=format&fit=crop",
        category: "Clothing",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: userId,
      },
      {
        id: 14,
        title: "Chemistry Lab Kit",
        description: "Complete chemistry lab kit with all equipment.",
        price: 90,
        image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2790&auto=format&fit=crop",
        category: "Hobbies",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId,
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_by: userId,
      },
    ])
    setLoading(false)
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
          <Link href="/browse">
            <Button>Back to Browse</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
          {/* Top: Avatar and Profile Info */}
          <div className="flex gap-8 mb-8">
            {/* Avatar */}
            <img
              src="/young-student.avif"
              alt={profile.full_name}
              className="w-32 h-32 rounded-full object-cover flex-shrink-0"
            />
            
            {/* Profile Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1" style={{ color: secondaryColor }}>
                {profile.full_name}
              </h1>
              <p className="text-sm text-gray-600 mb-3">{profile.university} • Campus Community Member</p>
              <p className="text-sm text-gray-700 mb-4">
                Active member of the campus marketplace. Quality items and reliable service.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link href={`/messages?seller=${encodeURIComponent(profile.full_name)}`} className="flex">
                  <Button
                    className=" text-white rounded-lg px-4 py-2 text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    💬 Message Seller
                  </Button>
                </Link>
                <Button
                  className="text-white rounded-lg px-4 py-2 text-sm"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom: Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">📋</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Listed</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {profile.items_listed || 0}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">✅</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Sold</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {profile.items_sold || 0}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">⭐</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Campus Rating</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                4.9/5
              </p>
            </div>
          </div>
        </div>

        {/* User Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: secondaryColor }}>Listings</h2>
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-5xl mx-auto mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: secondaryColor }}>No Listings Yet</h3>
              <p className="text-gray-600">This user hasn't created any listings.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

