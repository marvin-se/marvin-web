"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ListingCard from "@/components/listing-card"


export default function FavoritesPage() {
  // Mock favorites data
  const favorites = [
    {
      id: 1,
      title: "Calculus Textbook",
      price: 45,
      campus: "Main",
      category: "Books",
      image: "/placeholder.svg?key=qocij",
    },
    {
      id: 2,
      title: "Macbook Pro 2020",
      price: 800,
      campus: "North",
      category: "Electronics",
      image: "/placeholder.svg?key=z2grh",
    },
    {
      id: 3,
      title: "IKEA Desk",
      price: 120,
      campus: "Main",
      category: "Furniture",
      image: "/placeholder.svg?key=ys508",
    },
  ]

  const emptyFavorites = favorites.length === 0

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
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
