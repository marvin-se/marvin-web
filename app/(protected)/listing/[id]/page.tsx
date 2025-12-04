"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Listing, User } from "@/lib/types"
import { Heart, Share2, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react"

const primaryColor = "#72C69B"
const secondaryColor = "#182C53"

export default function ListingDetailPage() {
  const params = useParams()
  const id = params.id
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Mock multiple images for the listing
  const listingImages = [
    "https://i.redd.it/ujwk6nmh1h481.jpg",
    "https://i.redd.it/ujwk6nmh1h481.jpg",
    "https://i.redd.it/ujwk6nmh1h481.jpg",
  ]

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? listingImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === listingImages.length - 1 ? 0 : prev + 1))
  }

  // Mock user data for seller
  const sellerData: User = {
    id: 1,
    full_name: "Alex Chen",
    email: "alex.chen@example.com",
    university: "UC Berkeley",
    phone_number: null,
    created_at: new Date().toISOString(),
    is_active: true,
  }

  // Mock listing data
  const listing: Listing = {
    id: 1,
    title: "Vintage Sector 9 Longboard",
    description: "Classic longboard, perfect for cruising around campus. Trucks and wheels are in great shape. Minor cosmetic scuffs on the tail. Rides smooth!",
    price: 85,
    image_url: "https://i.redd.it/ujwk6nmh1h481.jpg",
    category: "Sports & Outdoors",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_by: "alex.chen@example.com",
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_by: "alex.chen@example.com",
  }

  const searchParams = useSearchParams()
  const from = searchParams?.get("from");

  const getBackLink = () => {
    switch (from) {
      case 'favorites':
        return { href: '/favorites', label: 'Back to Listings' };
      case 'purchase-sales':
        return { href: '/purchase-sales', label: 'Back to Purchase & Sales' };
      default:
        return { href: '/browse', label: 'Back to Listings' };
    }
  };
  const { href: backHref, label: backLabel } = getBackLink();

  const timeSincePost = () => {
    const postedDate = new Date(listing.created_at)
    const now = new Date()
    const hoursAgo = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60))
    return `Posted ${hoursAgo} hours ago`
  }

  return (
    <main className="min-h-screen bg-white pt-18">
      <div className="mx-auto max-w-6xl px-6 py-0">
        {/* Back Button */}
        <Link href={backHref} className="flex items-center text-gray-600 mb-8 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Left: Image and Thumbnails */}
          <div className="lg:col-span-1">
            <div className="bg-yellow-50 rounded-2xl overflow-hidden relative group mb-4">
              <img
                src={listingImages[currentImageIndex] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-64 object-cover"
              />
              
              {/* Image Navigation Arrows */}
              {listingImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {listingImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    currentImageIndex === index ? 'border-gray-900' : 'border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Middle and Right: Title, Price, Details, and Seller */}
          <div className="lg:col-span-2">
            <p className="text-sm text-gray-500 mb-3">{timeSincePost()}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
            <p className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>
              ${listing.price}
            </p>

            {/* Details Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Category</p>
                    <p className="text-gray-900 font-medium">{listing.category}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">University</p>
                    <p className="text-gray-900 font-medium">{sellerData.university}</p>
                  </div>
                </div>
              </div>

              {/* Seller Card */}
              <Link href={`/profile/${sellerData.id}`} className="block hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg h-full">
                  <img
                    src="/young-student.avif"
                    alt={sellerData.full_name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{sellerData.full_name}</p>
                    <p className="text-xs text-gray-600">{sellerData.university}</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Action Buttons - Horizontal Layout */}
            <div className="flex gap-2">
              <Link href="/messages" className="flex-1">
                <Button className="w-full text-white font-semibold py-3 rounded-lg" style={{ backgroundColor: primaryColor }}>
                  Message Seller
                </Button>
              </Link>
              <Button 
                className="flex-shrink-0 text-white font-semibold py-3 px-4 rounded-lg"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                className="flex-shrink-0 font-semibold py-3 px-4 rounded-lg"
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed">{listing.description}</p>
        </div>

        {/* Similar Items */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 1, title: "Vintage Sector 9", price: "$72C69B", image: "bg-gray-300" },
              { id: 2, title: "Mac Manax Sector Longboard", price: "$72C69B", image: "bg-purple-900" },
              { id: 3, title: "Alinwark Pro", price: "$72C69B", image: "bg-gray-800" },
              { id: 4, title: "Vintage Longboard", price: "$72C69B", image: "bg-gray-400" },
            ].map((item) => (
              <Link key={item.id} href={`/listing/${item.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`h-40 w-full ${item.image}`} />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">Sports & Outdoors</p>
                    <p className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</p>
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>{item.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
