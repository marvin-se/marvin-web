"use client"

import { useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ListingCard from "@/components/listing-card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { getActiveListings, mockUsers } from "@/lib/mock-data";
import { User } from "@/lib/types"

const primaryColor = "#72C69B"

export default function BrowsePage() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedUniversity, setSelectedUniversity] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 1000])

  useEffect(() => {
    const query = searchParams.get("search")
    if (query !== null) {
      setSearchQuery(query)
    } else {
      setSearchQuery("")
    }
  }, [searchParams])

  // Get active listings from the central mock data source
  const listings = getActiveListings();
  const usersMap: Record<string, User> = mockUsers;

  const categories = ["All", "Books", "Electronics", "Furniture", "Clothing", "Sports & Outdoors", "Other"]
  
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
    <div className="w-full min-h-screen">
      <div className="w-full pt-18 px-6 pb-12">
        {/* Header Section */}
        <div 
          className="mb-8 py-9 px-6 rounded-lg bg-cover bg-center relative"
          style={{ backgroundColor: "#F5F6F8"  }}
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-[#182C53] mb-2">Campus Marketplace</h1>
            <p className="text-gray-500 text-sm mb-6">Buy and sell second-hand items from fellow students.</p>
            
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for textbooks, furniture, electronics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 items-end">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-300"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== "All").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 max-w-sm">
                <Label className="block text-sm font-medium text-gray-700 mb-2">Price Range</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={1000}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">University</Label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-300"
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
        </div>

        {/* Listings Grid */}
        <div className="bg-[#F5F6F8] rounded-xl border border-gray-200 p-8 mb-8">
          {filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                              className={page === currentPage ? "bg-gray-100 border-gray-300 text-gray-800" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">No Results Found</h2>
              <p className="text-gray-600">Try adjusting your filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
