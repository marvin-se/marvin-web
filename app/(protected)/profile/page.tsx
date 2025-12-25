"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import FloatingAlert from "@/components/ui/floating-alert"

import { useAuth } from "@/contexts/AuthContext";
import { User, Listing, SalesResponse, PurchaseResponse } from "@/lib/types";
import api from "@/lib/api";
import { getUserListings } from "@/lib/api/listings";

const primaryColor = "#72C69B";
const secondaryColor = "#182C53";

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(user); // Initialize with context data
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [salesCount, setSalesCount] = useState(0);
  const [purchasesCount, setPurchasesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<number | null>(null);

  // Delete Account State
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Change Password State
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  const [shareAlertVisible, setShareAlertVisible] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch listings
        const allListings = await getUserListings(user.id);
        setUserListings(allListings);

        // Calculate sold count from listings (manual mark as sold)
        const soldListingsCount = allListings.filter(l => l.status === 'SOLD').length;

        // Fetch sales history
        const salesResponse = await api.get<SalesResponse>('/user/sales');
        let transactionCount = 0;
        if (salesResponse.data && salesResponse.data.transactions) {
          transactionCount = salesResponse.data.transactions.length;
        }
        
        // Use the larger of the two to account for both manual marks and actual transactions
        setSalesCount(Math.max(soldListingsCount, transactionCount));

        // Fetch purchase history
        const purchasesResponse = await api.get<PurchaseResponse>('/user/purchases');
        if (purchasesResponse.data && purchasesResponse.data.transactions) {
          setPurchasesCount(purchasesResponse.data.transactions.length);
        }

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
        setError("Could not load your profile data. Please try again later.");
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
      description: profile.description,
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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountLoading(true);
    setDeleteAccountError(null);

    try {
      // Since the backend delete endpoint doesn't verify password, 
      // we verify it by attempting a login first.
      if (!user?.email) {
        throw new Error("User email not found.");
      }

      const loginResponse = await api.post("/auth/login", {
        email: user.email,
        password: deletePassword
      });

      // If login successful, update token in localStorage to ensure we have the valid session
      // This is important if the backend invalidates the old token upon new login
      if (loginResponse.data && loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);
      }

      // Proceed to delete with the (potentially new) token
      await api.delete("/user/delete-profile");
      
      // Close dialog and logout
      setDeleteAccountOpen(false);
      logout();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Delete account error:", err);
      const errorData = err.response?.data;
      let errorMessage = "Failed to delete account.";
      
      if (err.config?.url?.includes("/auth/login")) {
         errorMessage = "Incorrect password.";
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      setDeleteAccountError(errorMessage);
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const handleShare = () => {
    if (!user?.id) return;
    
    // Construct the public profile URL
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("New passwords do not match.");
      setChangePasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setChangePasswordError("Password must be at least 8 characters long.");
      setChangePasswordLoading(false);
      return;
    }

    try {
      await api.post("/auth/change-password", {
        email: user?.email,
        token: "dummy-token", // Backend requires a token field, even if ignored for CHANGE_PASSWORD
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
        type: "CHANGE_PASSWORD"
      });
      
      setChangePasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setChangePasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Change password error:", err);
      const errorData = err.response?.data;
      let errorMessage = "Failed to change password.";
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      setChangePasswordError(errorMessage);
    } finally {
      setChangePasswordLoading(false);
    }
  };

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
                  onClick={() => setChangePasswordOpen(true)}
                  variant="outline"
                  className="rounded-lg px-4 py-2 text-sm border-gray-300"
                >
                  Change Password
                </Button>
                <Button
                  onClick={() => setDeleteAccountOpen(true)}
                  variant="outline"
                  className="rounded-lg px-4 py-2 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete Account
                </Button>
                <Button
                  className="text-white rounded-lg px-4 py-2 text-sm"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={handleShare}
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
                {userListings.filter(l => l.status !== 'SOLD').length}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">✅</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Sold</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {salesCount}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">📦</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Total Listings</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {userListings.filter(l => l.status !== 'SOLD').length}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-xl">🛍️</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">Items Purchased</p>
              <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                {purchasesCount}
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
                <label className="text-sm font-semibold block mb-2">Bio / Description</label>
                <Textarea
                  value={profile?.description || ""}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="rounded-lg min-h-[100px]"
                  placeholder="Tell us a bit about yourself..."
                />
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
          {userListings.filter(item => item.status !== 'SOLD').length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userListings.filter(item => item.status !== 'SOLD').map((item) => (
                <div key={item.id} className="relative group">
                  <ListingCard listing={item} showFavoriteButton={false}/>
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

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your account security.
            </DialogDescription>
          </DialogHeader>
          
          {changePasswordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              <span className="font-medium">Success:</span> {changePasswordSuccess}
            </div>
          )}

          {changePasswordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <span className="font-medium">Error:</span> {changePasswordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="old-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Current Password
              </label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-new-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm New Password
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={changePasswordLoading} style={{ backgroundColor: primaryColor }} className="text-white">
                {changePasswordLoading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, including listings and transaction history, will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          {deleteAccountError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <span className="font-medium">Error:</span> {deleteAccountError}
            </div>
          )}

          <form onSubmit={handleDeleteAccount} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="delete-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Confirm with Password
              </label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDeleteAccountOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={deleteAccountLoading} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteAccountLoading ? "Deleting..." : "Delete My Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {shareAlertVisible && (
        <FloatingAlert
          type="success" 
          title="Successful!" 
          message="Your profile link has been copied to your clipboard!"
          onClose={() => setShareAlertVisible(false)}
        />
      )}
    </main>
  )
}
