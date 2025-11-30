"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Listing, User } from "@/lib/types"

const primaryColor = "#72C69B"

const chamferStyle = {
  clipPath: "polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
}

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedUniversity, setSelectedUniversity] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Mock user data
  const usersMap: Record<string, User> = {
    "user1@example.com": {
      id: 1,
      full_name: "John Doe",
      email: "user1@example.com",
      university: "State University",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user2@example.com": {
      id: 2,
      full_name: "Jane Smith",
      email: "user2@example.com",
      university: "Tech Institute",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user3@example.com": {
      id: 3,
      full_name: "Bob Johnson",
      email: "user3@example.com",
      university: "State University",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user4@example.com": {
      id: 4,
      full_name: "Alice Williams",
      email: "user4@example.com",
      university: "City College",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user5@example.com": {
      id: 5,
      full_name: "Charlie Brown",
      email: "user5@example.com",
      university: "State University",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user6@example.com": {
      id: 6,
      full_name: "Diana Prince",
      email: "user6@example.com",
      university: "Tech Institute",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user7@example.com": {
      id: 7,
      full_name: "Eve Adams",
      email: "user7@example.com",
      university: "City College",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
    "user8@example.com": {
      id: 8,
      full_name: "Frank Miller",
      email: "user8@example.com",
      university: "State University",
      phone_number: null,
      created_at: new Date().toISOString(),
      is_active: true,
    },
  }

  // Mock listings data
  const listings: Listing[] = [
    {
      id: 1,
      title: "Barely used textbook",
      description: "Excellent condition textbook, used for only one semester.",
      price: 50,
      image_url: "https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user1@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user1@example.com",
    },
    {
      id: 2,
      title: "Macbook Pro 2020",
      description: "Well-maintained MacBook Pro, perfect for students.",
      price: 900,
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2826&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user2@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user2@example.com",
    },
    {
      id: 3,
      title: "IKEA Desk",
      description: "Sturdy IKEA desk in great condition, perfect for studying.",
      price: 150,
      image_url: "https://images.unsplash.com/photo-1611210118484-6046f003a13a?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user3@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user3@example.com",
    },
    {
      id: 4,
      title: "Winter Coat (Size M)",
      description: "Warm winter coat, barely worn, excellent condition.",
      price: 80,
      image_url: "https://images.unsplash.com/photo-1593760991912-48203335c285?q=80&w=2787&auto=format&fit=crop",
      category: "Clothing",
      created_at: new Date().toISOString(),
      created_by: "user4@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user4@example.com",
    },
    {
      id: 5,
      title: "Physics Lab Guide",
      description: "Comprehensive physics lab guide with all experiments.",
      price: 30,
      image_url: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2787&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user5@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user5@example.com",
    },
    {
      id: 6,
      title: "27-inch Monitor",
      description: "High-quality 27-inch monitor, perfect for coding and design work.",
      price: 250,
      image_url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2832&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user6@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user6@example.com",
    },
    {
      id: 7,
      title: "Bookshelf",
      description: "Spacious bookshelf, perfect for organizing textbooks and supplies.",
      price: 100,
      image_url: "https://images.unsplash.com/photo-1558304923-5383a5544636?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user7@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user7@example.com",
    },
    {
      id: 8,
      title: "Running Shoes (Size 9)",
      description: "Comfortable running shoes, great for campus walks and workouts.",
      price: 60,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2787&auto=format&fit=crop",
      category: "Clothing",
      created_at: new Date().toISOString(),
      created_by: "user8@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user8@example.com",
    },
    {
      id: 9,
      title: "Intro to Chemistry Textbook",
      description: "Used textbook, annotations in margins but otherwise fine.",
      price: 25,
      image_url: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2787&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user1@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user1@example.com",
    },
    {
      id: 10,
      title: "Wireless Headphones",
      description: "Noise-cancelling headphones with good battery life.",
      price: 120,
      image_url: "https://images.unsplash.com/photo-1518444027821-9c0b0b5c8e87?q=80&w=2787&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user2@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user2@example.com",
    },
    {
      id: 11,
      title: "Compact Study Lamp",
      description: "Adjustable LED lamp with touch controls.",
      price: 20,
      image_url: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user3@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user3@example.com",
    },
    {
      id: 12,
      title: "Leather Jacket (M)",
      description: "Stylish leather jacket, little wear on cuffs.",
      price: 95,
      image_url: "https://images.unsplash.com/photo-1520975918066-53a7b3a9d7a9?q=80&w=2787&auto=format&fit=crop",
      category: "Clothing",
      created_at: new Date().toISOString(),
      created_by: "user4@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user4@example.com",
    },
    {
      id: 13,
      title: "Calculus Problem Set Solutions",
      description: "Set of typed solutions for practice problems.",
      price: 10,
      image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2787&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user5@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user5@example.com",
    },
    {
      id: 14,
      title: "USB-C Docking Station",
      description: "Useful for multi-monitor setups and charging.",
      price: 75,
      image_url: "https://images.unsplash.com/photo-1555617117-08bdaea4f8f5?q=80&w=2787&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user6@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user6@example.com",
    },
    {
      id: 15,
      title: "Corner Bookshelf",
      description: "Wooden bookshelf that fits neatly into a corner.",
      price: 65,
      image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user7@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user7@example.com",
    },
    {
      id: 16,
      title: "Yoga Mat",
      description: "Non-slip yoga mat in great condition.",
      price: 15,
      image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2787&auto=format&fit=crop",
      category: "Hobbies",
      created_at: new Date().toISOString(),
      created_by: "user8@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user8@example.com",
    },
    {
      id: 17,
      title: "Organic Chemistry Model Kit",
      description: "Molecular model kit for organic chemistry courses.",
      price: 35,
      image_url: "https://images.unsplash.com/photo-1581092795360-2a2a2f0b7d1e?q=80&w=2787&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user1@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user1@example.com",
    },
    {
      id: 18,
      title: "Bluetooth Speaker",
      description: "Portable speaker, clear sound, some cosmetic marks.",
      price: 45,
      image_url: "https://images.unsplash.com/photo-1519669556871-8f4a0d6f9fef?q=80&w=2787&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user2@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user2@example.com",
    },
    {
      id: 19,
      title: "Rolling Office Chair",
      description: "Comfortable chair with lumbar support.",
      price: 85,
      image_url: "https://images.unsplash.com/photo-1549187774-b4a9f0cbd2b6?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user3@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user3@example.com",
    },
    {
      id: 20,
      title: "Graphic Tee (L)",
      description: "Comfortable cotton tee with minimal fade.",
      price: 12,
      image_url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2787&auto=format&fit=crop",
      category: "Clothing",
      created_at: new Date().toISOString(),
      created_by: "user4@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user4@example.com",
    },
    {
      id: 21,
      title: "Discrete Math Notes",
      description: "Handwritten and typed lecture notes for quick revision.",
      price: 8,
      image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2787&auto=format&fit=crop",
      category: "Books",
      created_at: new Date().toISOString(),
      created_by: "user5@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user5@example.com",
    },
    {
      id: 22,
      title: "External SSD 1TB",
      description: "Fast external drive in excellent condition.",
      price: 140,
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2826&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user6@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user6@example.com",
    },
    {
      id: 23,
      title: "Small Coffee Table",
      description: "Minimalist coffee table, small scratch on top.",
      price: 40,
      image_url: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=2787&auto=format&fit=crop",
      category: "Furniture",
      created_at: new Date().toISOString(),
      created_by: "user7@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user7@example.com",
    },
    {
      id: 24,
      title: "Tennis Racket",
      description: "Lightweight racket, includes cover.",
      price: 30,
      image_url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2787&auto=format&fit=crop",
      category: "Hobbies",
      created_at: new Date().toISOString(),
      created_by: "user8@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user8@example.com",
    },
    {
      id: 25,
      title: "Organic Gardening Kit",
      description: "Starter kit with seeds and small tools.",
      price: 22,
      image_url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2787&auto=format&fit=crop",
      category: "Hobbies",
      created_at: new Date().toISOString(),
      created_by: "user1@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user1@example.com",
    },
    {
      id: 26,
      title: "HDMI Cables (3-pack)",
      description: "3 high-speed HDMI cables, various lengths.",
      price: 18,
      image_url: "https://images.unsplash.com/photo-1585386959984-a415522c7b5d?q=80&w=2787&auto=format&fit=crop",
      category: "Electronics",
      created_at: new Date().toISOString(),
      created_by: "user2@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user2@example.com",
    },
    {
      id: 27,
      title: "Vintage Typewriter",
      description: "Decorative vintage typewriter, keys functional.",
      price: 200,
      image_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2787&auto=format&fit=crop",
      category: "Other",
      created_at: new Date().toISOString(),
      created_by: "user3@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user3@example.com",
    },
    {
      id: 28,
      title: "Sketching Pencils Set",
      description: "Full range sketching pencils in a wooden box.",
      price: 14,
      image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2787&auto=format&fit=crop",
      category: "Hobbies",
      created_at: new Date().toISOString(),
      created_by: "user4@example.com",
      updated_at: new Date().toISOString(),
      updated_by: "user4@example.com",
    },
  ]

  const categories = ["All", "Books", "Electronics", "Furniture", "Clothing", "Hobbies", "Other"]

  const universities = useMemo(() => {
    const uniqueUniversities = new Set<string>()
    Object.values(usersMap).forEach((user) => {
      if (user.university) {
        uniqueUniversities.add(user.university)
      }
    })
    return Array.from(uniqueUniversities).sort()
  }, [])

  const getUserUniversity = (createdBy: string): string | null => {
    const user = usersMap[createdBy]
    return user?.university || null
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]
    const userUniversity = getUserUniversity(listing.created_by)
    const matchesUniversity = selectedUniversity === "All" || userUniversity === selectedUniversity
    return matchesSearch && matchesCategory && matchesPrice && matchesUniversity
  })

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedUniversity, priceRange])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredListings.slice(start, start + pageSize)
  }, [filteredListings, currentPage])

  return (
    <div className="relative">
      <img
        src="/bg-browse.svg"
        alt="background"
        className="pointer-events-none fixed inset-0 -z-50 w-full h-full object-cover"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 70%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 70%)',
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-8">
        {/* Frame Container with Chamfered Border */}
        <div className="drop-shadow-lg filter">
          <div className="p-0.5" style={{ backgroundColor: primaryColor, ...chamferStyle }}>
            <div style={chamferStyle} className="bg-white">
              {/* Filter Bar at Top */}
              <div className="border-b-2 border-slate-200 bg-slate-50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Search */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-700 uppercase tracking-wide">Search</h3>
                    <Input
                      type="text"
                      placeholder="Search Textbooks, etc."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-700 uppercase tracking-wide">Category</h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-700 uppercase tracking-wide">Price Range</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="bg-white border-slate-300 text-slate-800 w-1/2 rounded-none"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                        className="bg-white border-slate-300 text-slate-800 w-1/2 rounded-none"
                      />
                    </div>
                  </div>

                  {/* University Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-700 uppercase tracking-wide">University</h3>
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-none"
                    >
                      <option value="All">All Universities</option>
                      {universities.map((university) => (
                        <option key={university} value={university}>
                          {university}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Listings Grid */}
              <div className="p-6 bg-white">
                {filteredListings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {paginatedListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination>
                          <PaginationContent className="gap-1">
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                              />
                            </PaginationItem>

                            {Array.from({ length: totalPages }).map((_, i) => {
                              const page = i + 1
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => setCurrentPage(page)}
                                    className={page === currentPage ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            })}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold mb-2 text-slate-800">No Results Found</h2>
                    <p className="text-slate-600">Try adjusting your filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
