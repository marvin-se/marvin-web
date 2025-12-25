"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/listing-card"
import { PublicProfile, Listing } from "@/lib/types"
import { Share2, MoreHorizontal, Ban, ShieldCheck } from "lucide-react"
import api from "@/lib/api"
import { getUserProfilePicture } from "@/lib/api/user"
import { getUserListings } from "@/lib/api/listings"
import FloatingAlert from "@/components/ui/floating-alert"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const userId = params.id as string
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [displayProfilePic, setDisplayProfilePic] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [shareAlertVisible, setShareAlertVisible] = useState(false)
  const [blockAlertVisible, setBlockAlertVisible] = useState<{visible: boolean, message: string, type: 'success' | 'error'}>({ visible: false, message: '', type: 'success' })

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch user profile
      const profileRes = await api.get<PublicProfile>(`/user/${userId}`);
      setProfile(profileRes.data);

      // Fetch user listings
      const listings = await getUserListings(userId);
      setUserListings(listings);

      // Fetch profile picture
      try {
        const picUrl = await getUserProfilePicture(parseInt(userId));
        setDisplayProfilePic(picUrl);
      } catch (e) {
        console.warn("Failed to fetch profile picture url", e);
      }

    } catch (err: any) {
      console.error("Failed to fetch user data:", err);
      // Check if the error indicates the user is blocked (if backend supported it)
      // For now, we can't know on load.
      setError("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Redirect to private profile if viewing own profile
    if (user && user.id && userId && user.id.toString() === userId.toString()) {
      router.replace('/profile');
      return;
    }

    fetchData();
  }, [userId, user, router, fetchData])

  const handleShare = () => {
    const profileUrl = window.location.href;
    
    if (!navigator.clipboard) {
        alert("Clipboard functionality not supported by this browser.");
        return;
    }

    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        setShareAlertVisible(true);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  const handleBlockUser = async () => {
    try {
      await api.post(`/user/${userId}/block`);
      setIsBlocked(true);
      setBlockAlertVisible({ visible: true, message: "User has been blocked successfully.", type: 'success' });
    } catch (err: any) {
      console.error("Failed to block user:", err);
      if (err.response?.data?.message === "This user is already blocked.") {
         setIsBlocked(true);
         setBlockAlertVisible({ visible: true, message: "User was already blocked.", type: 'success' });
      } else {
         setBlockAlertVisible({ visible: true, message: "Failed to block user.", type: 'error' });
      }
    }
  };

  const handleUnblockUser = async () => {
    try {
      await api.delete(`/user/${userId}/unblock`);
      setIsBlocked(false);
      setBlockAlertVisible({ visible: true, message: "User has been unblocked successfully.", type: 'success' });
      fetchData();
    } catch (err) {
      console.error("Failed to unblock user:", err);
      setBlockAlertVisible({ visible: true, message: "Failed to unblock user.", type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading profile...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">{error || "User not found"}</p>
          <div className="flex gap-4 justify-center mt-4">
            <Link href="/browse">
              <Button variant="outline">Back to Browse</Button>
            </Link>
            <Button 
              onClick={handleUnblockUser} 
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              Unblock User
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-w-md">
          <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You have blocked this user</h1>
          <p className="text-gray-600 mb-6">You cannot view their profile or listings while they are blocked.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/browse">
              <Button variant="outline">Back to Browse</Button>
            </Link>
            <Button 
              onClick={handleUnblockUser} 
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              Unblock User
            </Button>
          </div>
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
              src={displayProfilePic || profile.profilePicUrl || "/young-student.avif"}
              alt={profile.fullName}
              className="w-32 h-32 rounded-full object-cover flex-shrink-0"
            />
            
            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold" style={{ color: secondaryColor }}>
                  {profile.fullName}
                </h1>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">📍 {profile.universityName}</p>
              
              {profile.description && (
                <p className="text-sm text-gray-600 mt-4 max-w-2xl">{profile.description}</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  className="text-white rounded-lg px-4 py-2 text-sm"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg border border-gray-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBlockUser} className="text-red-600 cursor-pointer">
                      <Ban className="mr-2 h-4 w-4" />
                      <span>Block User</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleUnblockUser} className="text-gray-600 cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Unblock User</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">📋</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Active Listings</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {userListings.filter(l => l.status !== 'SOLD').length}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">✅</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Sold</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {userListings.filter(l => l.status === 'SOLD').length}
              </p>
            </div>
          </div>
        </div>

        {/* User Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: secondaryColor }}>{profile.fullName}'s Listings</h2>
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
              <p className="text-gray-600">This user hasn't posted any listings yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {shareAlertVisible && (
        <FloatingAlert
          type="success" 
          title="Successful!" 
          message="The profile link has been copied to your clipboard!"
          onClose={() => setShareAlertVisible(false)}
        />
      )}

      {blockAlertVisible.visible && (
        <FloatingAlert
          type={blockAlertVisible.type}
          title={blockAlertVisible.type === 'success' ? "Success" : "Error"}
          message={blockAlertVisible.message}
          onClose={() => setBlockAlertVisible({ ...blockAlertVisible, visible: false })}
        />
      )}
    </main>
  )
}

