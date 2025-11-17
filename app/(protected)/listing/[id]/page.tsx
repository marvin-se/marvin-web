"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Listing } from "@/lib/types"

export default function ListingDetailPage() {
  const params = useParams()
  const id = params.id
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock listing data - in production, this would come from an API call
  // TODO: Replace with API call: const listing = await fetchListing(id)
  const listing: Listing = {
    id: 1,
    title: "Calculus Textbook - Latest Edition",
    description: "Excellent condition calculus textbook. Used for only one semester. All pages intact, no highlighting or notes. Perfect for the upcoming course.",
    price: 45,
    image_url: "https://m.media-amazon.com/images/I/41Ln0mEFcdL._SX342_SY445_FMwebp_.jpg", 
    category: "Books",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: "Sarah Johnson",
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_by: "Sarah Johnson",
    details: [
      { label: "Category", value: "Books" },
    ],
  }

  const searchParams = useSearchParams()
  const from = searchParams?.get("from")
  const backHref = from === "favorites" ? "/favorites" : "/browse"
  const backLabel = from === "favorites" ? "← Back to Favorites" : "← Back to Browse"

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href={backHref} className="text-primary mb-6 block hover:underline">
          {backLabel}
        </Link>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Left: Image */}
          <div className="lg:col-span-2">
            <div className="bg-muted rounded-2xl overflow-hidden">
              <img
                src={listing.image_url || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Right: Details Panel */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {listing.category && (
                    <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {listing.category}
                    </span>
                  )}
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
              <p className="text-muted-foreground flex items-center gap-2">
                📅 Posted {new Date(listing.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Seller Info */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <Link 
                href={`/profile/${encodeURIComponent(listing.created_by)}`}
                className="block"
              >
                <div className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold">Seller</p>
                    <p className="text-sm text-muted-foreground">{listing.created_by}</p>
                  </div>
                </div>
              </Link>
              <Link
                href={`/messages?seller=${encodeURIComponent(listing.created_by)}&item=${encodeURIComponent(listing.title)}`}
              >
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg mb-2">
                  💬 Message Seller
                </Button>
              </Link>
              <Button variant="outline" className="w-full rounded-lg border-border hover:bg-card bg-transparent">
                📤 Share Listing
              </Button>
            </div>

            {/* Item Details */}
            {listing.details && listing.details.length > 0 && (
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
            )}
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
