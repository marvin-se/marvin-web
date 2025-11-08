"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Fake data with improved visuals and English localization
  const listings = [
    {
      id: 1,
      title: "Barely used textbook",
      price: 50,
      campus: "Engineering",
      category: "Books",
      image: "https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Macbook Pro 2020",
      price: 900,
      campus: "Business",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2826&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "IKEA Desk",
      price: 150,
      campus: "Architecture",
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1611210118484-6046f003a13a?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Winter Coat (Size M)",
      price: 80,
      campus: "Medical School",
      category: "Clothing",
      image: "https://images.unsplash.com/photo-1593760991912-48203335c285?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "Physics Lab Guide",
      price: 30,
      campus: "Engineering",
      category: "Books",
      image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 6,
      title: "27-inch Monitor",
      price: 250,
      campus: "Computer Science",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2832&auto=format&fit=crop",
    },
    {
      id: 7,
      title: "Bookshelf",
      price: 100,
      campus: "Law",
      category: "Furniture",
      image: "https://images.unsplash.com/photo-1558304923-5383a5544636?q=80&w=2787&auto=format&fit=crop",
    },
    {
      id: 8,
      title: "Running Shoes (Size 9)",
      price: 60,
      campus: "Sports Science",
      category: "Clothing",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2787&auto=format&fit=crop",
    },
  ]

  const categories = ["All", "Books", "Electronics", "Furniture", "Clothing", "Hobbies"]

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-12 grid-cols-1 lg:grid-cols-4">
        {/* Filtering Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {/* Search */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Search</h3>
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings */}
        <main className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-8">Listings</h1>
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No Results Found</h2>
              <p className="text-muted-foreground">Try adjusting your filter criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
