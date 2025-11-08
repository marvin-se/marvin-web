"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"


export default function ListingDetailPage() {
  const params = useParams()
  const id = params.id
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)

  // Mock listing data
  const listing = {
    id: 1,
    title: "Calculus Textbook - Latest Edition",
    price: 45,
    campus: "Main",
    category: "Books",
    condition: "Like New",
    description:
      "Excellent condition calculus textbook. Used for only one semester. All pages intact, no highlighting or notes. Perfect for the upcoming course.",
    images: ["https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop", "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2787&auto=format&fit=crop", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2874&auto=format&fit=crop"],
    postedDate: "2 days ago",
    seller: {
      name: "Sarah Johnson",
      university: "State University",
      rating: 4.8,
      reviews: 24,
      avatar: "https://github.com/shadcn.png",
    },
    details: [
      { label: "Category", value: "Books" },
      { label: "Condition", value: "Like New" },
      { label: "Campus", value: "Main Campus" },
      { label: "Posted", value: "2 days ago" },
    ],
  }

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/browse" className="text-primary mb-6 block hover:underline">
          ← Back to Browse
        </Link>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-muted rounded-2xl overflow-hidden">
              <img
                src={listing.images[imageIndex] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageIndex(idx)}
                  className={`h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    imageIndex === idx ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img || "/placeholder.svg"} alt={`view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details Panel */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {listing.category}
                  </span>
                  <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-3 rounded-full hover:bg-card transition-colors text-2xl"
                  title="Toggle favorite"
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
              <p className="text-4xl font-bold text-primary">${listing.price}</p>
              <p className="text-muted-foreground flex items-center gap-2 mb-3">📍 {listing.campus} Campus</p>
              <p className="text-muted-foreground flex items-center gap-2">📅 Posted {listing.postedDate}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={listing.seller.avatar || "/placeholder.svg"}
                  alt={listing.seller.name}
                  className="w-12 h-12 rounded-full bg-muted"
                />
                <div>
                  <p className="font-semibold">{listing.seller.name}</p>
                  <p className="text-sm text-muted-foreground">{listing.seller.university}</p>
                  <p className="text-xs text-muted-foreground">
                    ⭐ {listing.seller.rating} ({listing.seller.reviews} reviews)
                  </p>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg mb-2">
                💬 Message Seller
              </Button>
              <Button variant="outline" className="w-full rounded-lg border-border hover:bg-card bg-transparent">
                📤 Share Listing
              </Button>
            </div>

            {/* Item Details */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-4">Item Details</h3>
              <div className="space-y-3">
                {listing.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span className="font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-foreground leading-relaxed">{listing.description}</p>
        </div>

        {/* Similar Items */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="bg-muted h-40 w-full" />
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Books</p>
                  <p className="font-semibold mb-2">Similar Textbook</p>
                  <p className="text-lg font-bold text-primary">$40 - $60</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
