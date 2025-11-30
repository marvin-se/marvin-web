"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/listing-card"


export default function FavoritesPage() {
  // Mock favorites data (stateful so we can remove items)
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "Calculus Textbook",
      description: "Excellent condition calculus textbook.",
      price: 45,
      image_url: "/placeholder.svg?key=qocij",
      category: "Books",
      campus: "Main",
      created_at: new Date().toISOString(),
      created_by: "user1@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user1@example.com",
    },
    {
      id: 2,
      title: "Macbook Pro 2020",
      description: "Well-maintained MacBook Pro.",
      price: 800,
      image_url: "/placeholder.svg?key=z2grh",
      category: "Electronics",
      campus: "North",
      created_at: new Date().toISOString(),
      created_by: "user2@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user2@example.com",
    },
    {
      id: 3,
      title: "IKEA Desk",
      description: "Sturdy IKEA desk in great condition.",
      price: 120,
      image_url: "/placeholder.svg?key=ys508",
      category: "Furniture",
      campus: "Main",
      created_at: new Date().toISOString(),
      created_by: "user3@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user3@example.com",
    },
  ])

  const emptyFavorites = favorites.length === 0

  const handleRemoveFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        {emptyFavorites ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-card rounded-full text-5xl">❤️</div>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring and save items you like</p>
            <Link href="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                from="favorites"
                isFavorited={true}
                onFavoriteToggle={handleRemoveFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
