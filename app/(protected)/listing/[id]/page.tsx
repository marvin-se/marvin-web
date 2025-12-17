"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Listing } from "@/lib/types"
import { Heart, Share2, ArrowLeft, Edit, AlertTriangle, PackageCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getListingDetailById } from "@/lib/api/listings" 
import FloatingAlert from "@/components/ui/floating-alert";

const primaryColor = "#72C69B"

export default function ListingDetailPage() {
  // --- ROUTER & AUTH HOOKS ---
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from");
  
  // Data State
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State 
  const [isFavorite, setIsFavorite] = useState(false); 
  const [shareAlertVisible, setShareAlertVisible] = useState(false);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return; 
      setIsLoading(true);
      setError(null);
      try {
        const fetchedListing = await getListingDetailById(id);
        setListing(fetchedListing);
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


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl text-gray-600">Loading Listing Details...</h1>
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

  // DTO Adaptation and flags
  const listingCategory = listing.category?.replace('_', ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'N/A';
  
  // NOTE: isOwner logic relies on `created_by` being a unique identifier (like user ID or email)
  const isOwner = user?.email === listing.created_by; 
  const isSold = listing.status === 'SOLD'; // Assuming the default status is 'SOLD' from the backend DTO
  const isFromHistory = from === 'purchase-sales';
  
  const renderActionButtons = () => {
    if (isFromHistory || isSold) {
      return null;
    }
    
    if (isOwner) {
      return (
        <Link href={`/listing/${id}/edit`} className="flex-1">
          <Button className="w-full font-semibold py-3 rounded-lg" variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Your Listing
          </Button>
        </Link>
      );
    }
    
    return (
      <Link href={`/messages?recipient=${listing.created_by}`} className="flex-1">
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
          {/* Left: Image */}
          <div>
            <div className="bg-gray-100 rounded-2xl overflow-hidden relative group mb-4">
              {/* Use the primary imageUrl from the DTO */}
              <img 
                src={listing.imageUrl || "/placeholder.svg"} 
                alt={listing.title} 
                className="w-full h-96 object-cover" 
              />
            </div>
            {/* Gallery of multiple images (listing.images) could go here */}
          </div>

          {/* Right: Details, Seller, and Actions */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            
            {showSecondaryActions && (
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                ${listing.price}
              </p>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><p className="text-gray-600">Category</p><p className="font-medium">{listingCategory}</p></div>
                <div className="flex justify-between"><p className="text-gray-600">University</p><p className="font-medium">{listing.universityName || 'N/A'}</p></div>
                {/* NOTE: Listing DTO currently lacks created_at */}
                <div className="flex justify-between">
                <p className="text-gray-600">Posted</p>
                <p className="font-medium">
                    {listing.created_at 
                        ? new Date(listing.created_at).toLocaleDateString()
                        : 'N/A'}
                </p>
            </div>
              </div>
            </div>

            {/* Seller Information (Adapted to use available DTO fields) */}
            <Link href={`/profile/${listing.created_by}`} className="block"> 
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg h-full border hover:bg-gray-100 transition-colors">
                <img src="/young-student.avif" alt={listing.created_by} className="w-14 h-14 rounded-full object-cover"/>
                <div>
                  <p className="font-semibold text-gray-900">Username</p>
                  <p className="text-xs text-gray-600">{listing.universityName || 'University'}</p>
                </div>
              </div>
            </Link>
            
            <div className="flex gap-2">
              {renderActionButtons()}
              {showSecondaryActions && (
                <>
                  <Button className="flex-shrink-0 text-white font-semibold py-3 px-4 rounded-lg" style={{ backgroundColor: primaryColor }} onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button className="flex-shrink-0 font-semibold py-3 px-4 rounded-lg" style={{ backgroundColor: primaryColor, color: 'white' }} onClick={handleShare}>
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

    </main>
  );
}