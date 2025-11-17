"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<number | null>(null)
  const [profile, setProfile] = useState({
    id: 1,
    full_name: "Emma Wilson",
    email: "emma.wilson@university.edu",
    university: "State University",
    phone_number: "+1234567890",
    created_at: new Date().toISOString(),
    is_active: true,
    // Statistics (computed from listings/transactions)
    items_sold: 12,
    items_purchased: 8,
    items_listed: 5,
  })

  // Mock user listings - converted to state so we can delete items
  const [userListings, setUserListings] = useState([
    {
      id: 1,
      title: "Calculus Textbook",
      description: "Excellent condition calculus textbook.",
      price: 45,
      image_url: "https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: profile.email,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    },
    {
      id: 2,
      title: "Monitor 27 inch",
      description: "High-quality 27-inch monitor.",
      price: 180,
      image_url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2832&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: profile.email,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    },
    {
      id: 3,
      title: "Bookshelf",
      description: "Spacious bookshelf for organizing books.",
      price: 85,
      image_url: "https://images.unsplash.com/photo-1558304923-5383a5544636?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: profile.email,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    },
    {
      id: 4,
      title: "Running Shoes",
      description: "Comfortable running shoes in good condition.",
      price: 70,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2787&auto=format&fit=crop",
      category: "Clothing",
      created_at: new Date().toISOString(),
      created_by: profile.email,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    },
    {
      id: 5,
      title: "Desk Lamp",
      description: "Modern desk lamp with adjustable brightness.",
      price: 25,
      image_url: "https://images.unsplash.com/photo-1604079359985-c2b42d5a2c13?q=80&w=2787&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: profile.email,
      updated_at: new Date().toISOString(),
      updated_by: profile.email,
    },
  ])

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Handle profile update
  }

  const handleDeleteListing = () => {
    if (listingToDelete === null) return
    
    // TODO: Replace with API call: await deleteListing(listingToDelete)
    // For now, just remove from state
    setUserListings((prevListings) => prevListings.filter((listing) => listing.id !== listingToDelete))
    // Update items_listed count
    setProfile((prevProfile) => ({
      ...prevProfile,
      items_listed: (prevProfile.items_listed || 0) - 1,
    }))
    setDeleteDialogOpen(false)
    setListingToDelete(null)
  }

  const openDeleteDialog = (listingId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setListingToDelete(listingId)
    setDeleteDialogOpen(true)
  }

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4 md:flex-1">
              <div className="w-24 h-24 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                <div className="flex flex-col md:flex-row gap-2 text-muted-foreground text-sm">
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
                {/* Stats */}
                <div className="flex gap-4 justify-center md:justify-start mb-4">
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
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Phone Number</label>
                <Input
                  value={profile.phone_number || ""}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  className="rounded-lg"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">University</label>
                <Input
                  value={profile.university || ""}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="rounded-lg"
                />
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
                        onClick={(e) => openDeleteDialog(item.id, e)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
