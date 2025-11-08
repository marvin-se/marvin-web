"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Emma Wilson",
    email: "emma.wilson@university.edu",
    university: "State University",
    campus: "Main",
    bio: "Fifth year student. Love buying and selling quality items on campus!",
    avatar: "https://github.com/shadcn.png",
    rating: 4.9,
    reviews: 48,
    itemsSold: 23,
    activeListings: 5,
  })

  // Mock user listings
  const userListings = [
    {
      id: 1,
      title: "Calculus Textbook",
      price: 45,
      campus: "Main",
      category: "Books",
      image: "https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Monitor 27 inch",
      price: 180,
      campus: "East",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2832&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Bookshelf",
      price: 85,
      campus: "North",
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1558304923-5383a5544636?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Running Shoes",
      price: 70,
      campus: "Main",
      category: "Clothing",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Desk Lamp",
      price: 25,
      campus: "South",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1604079359985-c2b42d5a2c13?q=80&w=2787&auto=format&fit=crop",
    },
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Handle profile update
  }

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4 md:flex-1">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt={profile.name}
                className="w-24 h-24 rounded-full bg-muted border-4 border-primary/20"
              />
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                <div className="flex flex-col md:flex-row gap-2 text-muted-foreground text-sm">
                  <div className="flex items-center justify-center md:justify-start gap-1">
                    📍 {profile.campus} Campus, {profile.university}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1">✉️ {profile.email}</div>
                </div>
                <p className="text-foreground mt-3 text-sm">{profile.bio}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:flex-col md:items-end">
              <div className="bg-muted rounded-lg p-4 flex-1 text-center">
                <p className="text-2xl font-bold text-primary">{profile.rating}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  ⭐ {profile.reviews} reviews
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 flex-1 text-center">
                <p className="text-2xl font-bold text-primary">{profile.itemsSold}</p>
                <p className="text-xs text-muted-foreground">Items Sold</p>
              </div>
              <div className="bg-muted rounded-lg p-4 flex-1 text-center">
                <p className="text-2xl font-bold text-primary">{profile.activeListings}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              ✏️ {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            <Link href="/create-listing" className="flex-1">
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg">
                Create Listing
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-lg border-border hover:bg-card bg-transparent text-xl"
              size="icon"
              title="Logout"
            >
              🚪
            </Button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">University</label>
                  <Input
                    value={profile.university}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Campus</label>
                  <Input
                    value={profile.campus}
                    onChange={(e) => setProfile({ ...profile, campus: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* My Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Listings</h2>
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((item) => (
                <div key={item.id} className="relative group">
                  <ListingCard listing={item} />
                  {/* Edit/Delete Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-8 px-3 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-500 text-white hover:bg-red-600 rounded-lg h-8 px-3 text-xs border-0"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <div className="text-5xl mx-auto mb-4">👤</div>
              <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-6">Start selling by creating your first listing</p>
              <Link href="/create-listing">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                  Create Your First Listing
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
