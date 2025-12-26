"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Listing } from "@/lib/types"
import { Heart, Share2, ArrowLeft, Edit, AlertTriangle, PackageCheck, Trash2, Ban, MoreHorizontal, ShieldCheck, Eye } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getListingDetailById, deleteListing, addToFavorites, removeFromFavorites } from "@/lib/api/listings" 
import api from "@/lib/api"
import { getUserProfilePicture } from "@/lib/api/user"
import FloatingAlert from "@/components/ui/floating-alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

const primaryColor = "#72C69B"

// Helper function to check if a URL is a valid image URL (presigned or direct)
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

export default function ListingDetailPage() {
  // --- ROUTER & AUTH HOOKS ---
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from");
  
  // Data State
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerProfile, setSellerProfile] = useState<any>(null); // To store fetched seller details if needed
  const [sellerProfilePic, setSellerProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State 
  const [isFavorite, setIsFavorite] = useState(false); 
  const [isBlocked, setIsBlocked] = useState(false);
  const [shareAlertVisible, setShareAlertVisible] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState<{visible: boolean, type: 'success' | 'error', message: string}>({ visible: false, type: 'success', message: '' });
  const [blockAlertVisible, setBlockAlertVisible] = useState<{visible: boolean, message: string, type: 'success' | 'error'}>({ visible: false, message: '', type: 'success' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return; 
      setIsLoading(true);
      setError(null);
      try {
        const fetchedListing = await getListingDetailById(id);
        setListing(fetchedListing);
        setIsFavorite(!!fetchedListing.isFavourite);

        // Fetch seller profile picture
        if (fetchedListing.sellerId) {
            try {
                const picUrl = await getUserProfilePicture(fetchedListing.sellerId);
                setSellerProfilePic(picUrl);
            } catch (e) {
                console.warn("Failed to fetch seller profile picture", e);
            }
        }

        // If sellerName is missing but we have sellerId, try to fetch seller profile
        if (!fetchedListing.sellerName && fetchedListing.sellerId) {
            try {
                // We use a direct fetch here to avoid circular dependency or complex logic
                // Assuming api is available globally or imported
                const { default: api } = await import("@/lib/api");
                const userRes = await api.get(`/user/${fetchedListing.sellerId}`);
                setSellerProfile(userRes.data);
            } catch (err) {
                console.warn("Failed to fetch seller details (user might be deleted):", err);
                // Ignore error, we'll just show "Unknown Seller"
            }
        }

      } catch (e: any) {
        console.error("Fetch Error:", e);
        setError(e.message || "Failed to load listing details.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListing();
  }, [id]); 

  // --- Memoized Back Link ---
  const getBackLink = useMemo(() => {
    switch (from) {
      case 'favorites': return { href: '/favorites', label: 'Back to Favorites' };
      case 'purchase-sales': return { href: '/purchase-sales', label: 'Back to Purchase & Sales' };
      default: return { href: '/browse', label: 'Back to Browse' };
    }
  }, [from]);
  const { href: backHref, label: backLabel } = getBackLink;

  const handleBlockSeller = async () => {
    if (!listing?.sellerId) return;
    try {
      await api.post(`/user/${listing.sellerId}/block`);
      setIsBlocked(true);
      setBlockAlertVisible({ visible: true, message: "Seller has been blocked successfully.", type: 'success' });
    } catch (err: any) {
      console.error("Failed to block seller:", err);
      if (err.response?.data?.message === "This user is already blocked.") {
         setIsBlocked(true);
         setBlockAlertVisible({ visible: true, message: "Seller was already blocked.", type: 'success' });
      } else {
         setBlockAlertVisible({ visible: true, message: "Failed to block seller.", type: 'error' });
      }
    }
  };

  const handleUnblockSeller = async () => {
    if (!listing?.sellerId) return;
    try {
      await api.delete(`/user/${listing.sellerId}/unblock`);
      setIsBlocked(false);
      setBlockAlertVisible({ visible: true, message: "Seller has been unblocked successfully.", type: 'success' });
    } catch (err) {
      console.error("Failed to unblock seller:", err);
      setBlockAlertVisible({ visible: true, message: "Failed to unblock seller.", type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl text-gray-600">Loading Listing Details...</h1>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 shadow-sm max-w-md">
          <Ban className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You have blocked this seller</h1>
          <p className="text-gray-600 mb-6">You cannot view this listing while the seller is blocked.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/browse">
              <Button variant="outline">Back to Browse</Button>
            </Link>
            <Button 
              onClick={handleUnblockSeller} 
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              Unblock Seller
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error: {error || "Listing Not Found"}</h1>
          <p className="text-muted-foreground">The listing could not be loaded or does not exist.</p>
          <Link href="/browse">
            <Button className="mt-4">Back to Browse</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleToggleFavorite = async () => {
    if (!listing) return;
    
    // Optimistic update
    const newState = !isFavorite;
    setIsFavorite(newState);

    try {
        if (newState) {
            await addToFavorites(listing.id);
        } else {
            await removeFromFavorites(listing.id);
        }
    } catch (err) {
        console.error("Failed to toggle favorite:", err);
        // Revert on error
        setIsFavorite(!newState);
    }
  };

  const handleShare = () => {
    const listingUrl = window.location.href;
    
    if (!navigator.clipboard) {
        // You can still use a simple JS alert if clipboard is missing
        alert("Clipboard functionality not supported by this browser.");
        return;
    }

    navigator.clipboard.writeText(listingUrl)
      .then(() => {
        // ✅ SUCCESS PATH: Show the custom alert
        setShareAlertVisible(true);
        // The FloatingAlert component handles its own disappearance timer
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        // You could use a simple console error or state for a permanent error message
      });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteListing(id);
      setDeleteAlert({ visible: true, type: 'success', message: 'Listing deleted successfully. Redirecting...' });
      setTimeout(() => {
        router.push('/browse');
      }, 1500);
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setDeleteAlert({ visible: true, type: 'error', message: 'Failed to delete listing. Please try again.' });
    }
  };

  // DTO Adaptation and flags
  const listingCategory = listing.category?.replace('_', ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'N/A';
  
  // NOTE: isOwner logic relies on `created_by` being a unique identifier (like user ID or email)
  const isOwner = (user?.id && listing.sellerId) 
    ? user.id === listing.sellerId 
    : user?.email === listing.created_by;

  const isSold = listing.status === 'SOLD'; // Assuming the default status is 'SOLD' from the backend DTO
  const isFromHistory = from === 'purchase-sales';
  
  const renderActionButtons = () => {
    if (isFromHistory || isSold) {
      return null;
    }
    
    if (isOwner) {
      return (
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-2 w-full">
            <Link href={`/listing/${id}/edit`} className="flex-1">
              <Button className="w-full font-semibold py-3 rounded-lg" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button 
              className="flex-1 font-semibold py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
              variant="ghost"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      );
    }
    
    return (
        <Link href={`/messages?seller=${listing.sellerId}&productId=${listing.id}&productName=${encodeURIComponent(listing.title)}&sellerName=${encodeURIComponent(listing.sellerName || sellerProfile?.fullName || 'Seller')}`} className="flex-1">
        <Button className="w-full text-white font-semibold py-3 rounded-lg" style={{ backgroundColor: primaryColor }}>
          Message Seller
        </Button>
      </Link>
    );
  };
  
  const renderTopBanner = () => {
    if (isFromHistory) {
      return (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md" role="alert">
          <p className="font-bold flex items-center"><PackageCheck className="mr-2" />Past Transaction</p>
          <p>This is a record of a past transaction from your history. Actions are disabled.</p>
        </div>
      );
    }
    if (isSold) {
      return (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md" role="alert">
          <p className="font-bold flex items-center"><AlertTriangle className="mr-2" />Item Sold</p>
          <p>This item is no longer available for purchase.</p>
        </div>
      );
    }
    return null;
  }
  
  const showSecondaryActions = !isFromHistory && !isSold;

  return (
    <main className="min-h-screen bg-white pt-18">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link href={backHref} className="flex items-center text-gray-600 mb-8 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
        
        {renderTopBanner()}

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Left: Image Carousel */}
          <div>
            {listing.images && listing.images.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div 
                        className="bg-gray-100 rounded-2xl overflow-hidden relative h-96 cursor-pointer"
                        onClick={() => setSelectedImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${listing.title} - Image ${index + 1}`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {listing.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>
            ) : (
              <div 
                className="bg-gray-100 rounded-2xl overflow-hidden relative h-96 cursor-pointer"
                onClick={() => setSelectedImage(listing.imageUrl || "/placeholder.svg")}
              >
                <img 
                  src={listing.imageUrl || "/placeholder.svg"} 
                  alt={listing.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </div>
            )}
            
            {/* Thumbnail Gallery (Optional - can be added later if needed) */}
            {listing.images && listing.images.length > 1 && (
               <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                 {listing.images.map((img, index) => (
                   <div 
                     key={index} 
                     className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                     onClick={() => setSelectedImage(img)}
                   >
                     <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Right: Details, Seller, and Actions */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                <div className="flex gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1" title="Favorites">
                        <Heart className="h-4 w-4" />
                        <span>{listing.favouriteCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Views">
                        <Eye className="h-4 w-4" />
                        <span>{listing.visitCount || 0}</span>
                    </div>
                </div>
            </div>
            
            {showSecondaryActions && (
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                ₺{listing.price}
              </p>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><p className="text-gray-600">Category</p><p className="font-medium">{listingCategory}</p></div>
                <div className="flex justify-between"><p className="text-gray-600">University</p><p className="font-medium">{listing.universityName || 'N/A'}</p></div>
                {listing.createdAt && (
                  <div className="flex justify-between">
                    <p className="text-gray-600">Posted</p>
                    <p className="font-medium">
                      {new Date(listing.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            <div className="flex items-center gap-2">
              <Link href={isOwner ? '/profile' : `/profile/${listing.sellerId || listing.created_by}`} className="block flex-1"> 
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg h-full border hover:bg-gray-100 transition-colors">
                  <img 
                    src={sellerProfilePic || (isValidImageUrl(sellerProfile?.profilePicUrl) ? sellerProfile.profilePicUrl : "/young-student.avif")} 
                    alt={listing.sellerName || sellerProfile?.fullName || "Seller"} 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {listing.sellerName || sellerProfile?.fullName || "Unknown Seller"}
                      {isOwner && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-600">{listing.universityName || 'University'}</p>
                  </div>
                </div>
              </Link>

              {!isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-full min-h-[88px] w-12 p-0 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBlockSeller} className="text-red-600 cursor-pointer">
                      <Ban className="mr-2 h-4 w-4" />
                      <span>Block Seller</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex gap-2">
              {renderActionButtons()}
              {showSecondaryActions && (
                <>
                {!isOwner && (
                        <Button 
                          className="shrink-0 text-white font-semibold py-3 px-4 rounded-lg" 
                          style={{ backgroundColor: primaryColor }} 
                          onClick={handleToggleFavorite}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                      
                      {/* Share button usually stays for everyone, including the owner */}
                      <Button 
                        className="shrink-0 font-semibold py-3 px-4 rounded-lg" 
                        style={{ backgroundColor: primaryColor, color: 'white' }} 
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{listing.description}</p>
        </div>
      </div>

      {shareAlertVisible && (
        <FloatingAlert
          type="success" 
          title="Successful!" 
          message="The listing link has been copied to your clipboard!"
          onClose={() => setShareAlertVisible(false)}
        />
      )}

      {deleteAlert.visible && (
        <FloatingAlert
          type={deleteAlert.type}
          title={deleteAlert.type === 'success' ? "Deleted" : "Error"}
          message={deleteAlert.message}
          onClose={() => setDeleteAlert({ ...deleteAlert, visible: false })}
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

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
           <DialogTitle className="sr-only">Zoomed Listing Image</DialogTitle>
           <div className="relative w-full h-[80vh] flex items-center justify-center pointer-events-none">
             <img 
               src={selectedImage || undefined} 
               alt="Zoomed listing image" 
               className="max-w-full max-h-full object-contain pointer-events-auto"
             />
           </div>
        </DialogContent>
      </Dialog>

    </main>
  );
}