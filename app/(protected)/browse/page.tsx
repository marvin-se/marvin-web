"use client"

import { useSearchParams } from "next/navigation"
import { useState, useMemo, useEffect, useCallback } from "react"
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
import { getAllListings } from "@/lib/api/listings"; // Import the new fetch function
import { Listing, Category } from "@/lib/types"; // Import the updated type

const primaryColor = "#72C69B"

export default function BrowsePage() {
  const searchParams = useSearchParams()

  // State for fetched data and loading
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  // State for Price Range: Initialized to a wide, safe range. Will be updated after fetch.
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedUniversity, setSelectedUniversity] = useState("All")
  
  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllListings();
        setAllListings(data);
        
// Dynamic Price Range Initialization
        const maxPrice = data.reduce((max: number, listing: Listing) => Math.max(max, listing.price), 0);
        
        // Set max price to the nearest hundred above the highest listing price, minimum 1000
        const dynamicMax = Math.max(1000, Math.ceil(maxPrice / 100) * 100); 
        setPriceRange([0, dynamicMax] as [number, number]); // Use explicit tuple type for setPriceRange

      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to fetch listings. Please ensure the backend is running and reachable.");
        setAllListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []) 

  // --- URL Search Query Effect ---
  useEffect(() => {
    const query = searchParams.get("search")
    if (query !== null) {
      setSearchQuery(query)
    } else {
      setSearchQuery("")
    }
  }, [searchParams])

  // --- Dynamic Data ---
  const listings = allListings;
  
  // Categories (based on backend Category enum, converted to display string)
  // Ensure these match the values sent back by the backend DTO if they are strings like "BOOKS"
  const backendCategories: Category[] = [ "ELECTRONICS","BOOKS","FASHION","HOME","SPORTS","OTHER"];
  const categories = ["All", ...backendCategories];
  
  // Dynamically extract universities from fetched data
  const universities = useMemo(() => {
    const uniqueUniversities = new Set<string>()
    listings.forEach((listing) => {
      if (listing.universityName) {
        uniqueUniversities.add(listing.universityName)
      }
    })
    return Array.from(uniqueUniversities).sort()
  }, [listings])

  // Determine max slider value from all listings
  const maxPriceValue = useMemo(() => {
    return allListings.reduce((max, listing) => Math.max(max, listing.price), 1000);
  }, [allListings]);

  // --- Filtering Logic ---
  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Check category: Selected category is "All" OR matches the listing's category (which is a string like "BOOKS")
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory; 
    
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]
    
    // Check university name directly on the listing DTO
    const matchesUniversity = selectedUniversity === "All" || listing.universityName === selectedUniversity
    
    return matchesSearch && matchesCategory && matchesPrice && matchesUniversity
  })

  // --- Pagination Logic ---
  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedUniversity, priceRange])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredListings.slice(start, start + pageSize)
  }, [filteredListings, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: scroll to the top of the listings grid
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Render ---
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
              {/* Category Filter */}
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
                      {category.replace('_', ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex-1 max-w-sm">
                <Label className="block text-sm font-medium text-gray-700 mb-2">Price Range</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <Slider
                    value={priceRange}
                    onValueChange={(val: [number, number]) => setPriceRange(val)}
                    min={0}
                    // Use dynamic max value
                    max={Math.ceil(maxPriceValue / 100) * 100} 
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
              </div>

              {/* University Filter */}
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
          
          {isLoading ? (
            // Loading State
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">Loading Listings...</h2>
              <p className="text-gray-600">Fetching the latest items from the marketplace.</p>
            </div>
          ) : error ? (
            // Error State
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Connection Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedListings.map((listing) => (
                  // The listing prop is now the ProductListing from the backend
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                              className={page === currentPage ? "bg-gray-100 border-gray-300 text-gray-800" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            // No Results State
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