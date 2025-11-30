"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Listing } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"


interface ListingCardProps {
  listing: Listing
  from?: string
  isFavorited?: boolean
  onFavoriteToggle?: (id: number) => void
}

export default function ListingCard({ listing, from, isFavorited, onFavoriteToggle }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(!!isFavorited)

  // sync internal state when prop changes
  useEffect(() => {
    setIsFavorite(!!isFavorited)
  }, [isFavorited])

  const [confirmOpen, setConfirmOpen] = useState(false)

  const href = from ? `/listing/${listing.id}?from=${encodeURIComponent(from)}` : `/listing/${listing.id}`

  return (
    <Link href={href}>
      <div
        className="group bg-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer border"
        style={{ borderColor: "#182C53" }}
      >
        {/* Image Container */}
        <div className="relative h-64 bg-slate-700 overflow-hidden">
          <img
            src={listing.image_url || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              if (onFavoriteToggle) {
                // If coming from favorites and currently favorited, open the confirmation dialog
                if (from === "favorites" && isFavorite) {
                  setConfirmOpen(true)
                } else {
                  onFavoriteToggle(listing.id)
                }
                return
              }

              setIsFavorite(!isFavorite)
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "#ef4444" : "none"}
              stroke={isFavorite ? "#ef4444" : "#9ca3af"}
              strokeWidth="2"
              className="transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        {/* Confirmation dialog for removing from favorites (client-only) */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Favorites</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this item from your favorites? You can add it back later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  // prevent the click from bubbling to the parent Link and causing navigation
                  e.preventDefault();
                  e.stopPropagation();
                  if (onFavoriteToggle) onFavoriteToggle(listing.id);
                  setConfirmOpen(false);
                }}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Content */}
          <div className="p-4 bg-white">
          {listing.category && (
            <p className="text-xs text-blue-600 mb-2 font-semibold">{listing.category}</p>
          )}
          <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 text-sm">{listing.title}</h3>
          <p className="text-lg font-bold mb-2" style={{ color: "#182C53" }}>${listing.price}</p>
            <p className="text-xs text-slate-500">Seller by {listing.created_by.split("@")[0]}</p>
        </div>
      </div>
    </Link>
  )
}
