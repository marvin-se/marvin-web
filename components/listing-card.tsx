"use client"

import { useState } from "react"
import Link from "next/link"

interface ListingCardProps {
  listing: {
    id: number
    title: string
    price: number
    campus: string
    category: string
    image: string
  }
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
        {/* Image Container */}
        <div className="relative h-48 bg-muted overflow-hidden">
          <img
            src={listing.image || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
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
          {/* Campus Tag */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {listing.campus}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{listing.category}</p>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{listing.title}</h3>
          <p className="text-lg font-bold text-primary">${listing.price}</p>
        </div>
      </div>
    </Link>
  )
}
