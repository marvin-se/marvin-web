"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"
import { Share2 } from "lucide-react"
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

import { useAuth } from "@/contexts/AuthContext";
import { User, Listing } from "@/lib/types";
import api from "@/lib/api";

const primaryColor = "#72C69B";
const secondaryColor = "#182C53";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(user); // Initialize with context data
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Only fetch listings, as the profile data is now from the context
        const listingsResponse = await api.get<Listing[]>(
          `/seller/${user.id}/listings`
        );
        setUserListings(listingsResponse.data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError("Could not load your listings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    // Set profile from the (now fresh) context user data
    setProfile(user);
    fetchListings();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    const updatedData = {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      profilePicUrl: profile.profilePicUrl,
      universityName: profile.university?.name,
    };

    try {
      await api.put<User>("/user/edit-profile", updatedData);
      await refreshUser(); // This will fetch the latest user data into the context
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // You can add a state to show an error message to the user
    }
  };

  const handleDeleteListing = () => {
    if (listingToDelete === null) return
    
    // TODO: Replace with API call: await deleteListing(listingToDelete)
    // For now, just remove from state
    setUserListings((prevListings) => prevListings.filter((listing) => listing.id !== listingToDelete))
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
      

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
          {/* Top: Avatar and Profile Info */}
          <div className="flex gap-8 mb-8">
            {/* Avatar */}
            <img
              src={profile?.profilePicUrl || "/young-student.avif"}
              alt={profile?.fullName || "User Avatar"}
              className="w-32 h-32 rounded-full object-cover flex-shrink-0"
            />
            
            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold" style={{ color: secondaryColor }}>
                  {profile?.fullName}
                </h1>
                {profile?.isActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    ✓ Active
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-1">📍 {profile?.university?.name || 'No University Set'}</p>
              <p className="text-sm text-gray-600 mb-1">📧 {profile?.email}</p>
              
              {profile?.phoneNumber && (
                <p className="text-sm text-gray-600 mb-3">📞 {profile.phoneNumber}</p>
              )}
              
              {profile?.createdAt && (
                <p className="text-xs text-gray-500 mb-4">Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-white rounded-lg px-4 py-2 text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Edit Profile
                </Button>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">📋</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Active Listings</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {(profile?.items_listed || 0) - (profile?.items_sold || 0)}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">✅</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Sold</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {profile?.items_sold || 0}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">📦</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Total Listings</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {profile?.items_listed || 0}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">🛍️</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Purchased</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {profile?.items_purchased || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: secondaryColor }}>Edit Profile Information</h2>
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold block mb-2">Full Name</label>
                  <Input
                    value={profile?.fullName || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                    className="rounded-lg"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Phone Number</label>
                  <Input
                    value={profile?.phoneNumber || ""}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                    className="rounded-lg"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Email Address</label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Email address cannot be changed.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">University</label>
                <Input
                  value={profile?.university?.name || ""}
                  disabled
                  className="rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">
                  University cannot be changed after registration.
                </p>
              </div>

              {profile?.createdAt && (
                <div>
                  <label className="text-sm font-semibold block mb-2">Member Since</label>
                  <Input
                    value={new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    disabled
                    className="rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1 text-white rounded-lg font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex-1 rounded-lg font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* My Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: secondaryColor }}>My Listings</h2>
          {userListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userListings.map((item) => (
                <div key={item.id} className="relative group">
                  <ListingCard listing={item} />
                  {/* Edit/Delete Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Link href={`/listing/${item.id}/edit`}>
                        <Button
                          size="sm"
                          className="text-white rounded-lg h-8 px-3 text-xs"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
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
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-5xl mx-auto mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: secondaryColor }}>No Listings Yet</h3>
              <p className="text-gray-600 mb-6">Start selling by creating your first listing</p>
              <Link href="/create-listing">
                <Button className="text-white rounded-lg" style={{ backgroundColor: primaryColor }}>
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
