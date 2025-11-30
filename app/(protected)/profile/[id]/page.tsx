"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/listing-card"
import { User, Listing } from "@/lib/types"

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
      full_name: decodeURIComponent(userId),
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/browse" className="text-primary mb-6 block hover:underline">
          ← Back to Browse
        </Link>

        {/* Profile Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 w-full">
              <div className="w-24 h-24 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                <div className="flex flex-col md:flex-row gap-2 text-muted-foreground text-sm mb-4">
                  {profile.university && (
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      🏫 {profile.university}
                    </div>
                  )}
                  <div className="flex items-center justify-center md:justify-start gap-1">✉️ {profile.email}</div>
                  {profile.phone_number && (
                    <div className="flex items-center justify-center md:justify-start gap-1">📞 {profile.phone_number}</div>
                  )}
                </div>
                
                {/* Stats - Horizontal */}
                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="bg-muted rounded-lg p-4 text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-primary">{profile.items_listed || 0}</p>
                    <p className="text-xs text-muted-foreground">Listed</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-primary">{profile.items_sold || 0}</p>
                    <p className="text-xs text-muted-foreground">Sold</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center min-w-[80px]">
                    <p className="text-2xl font-bold text-primary">{profile.items_purchased || 0}</p>
                    <p className="text-xs text-muted-foreground">Purchased</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Link
              href={`/messages?seller=${encodeURIComponent(profile.full_name)}`}
              className="flex-1"
            >
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                💬 Message Seller
              </Button>
            </Link>
          </div>
        </div>

        {/* User Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Listings</h2>
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="text-5xl mx-auto mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground">This user hasn't created any listings.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

