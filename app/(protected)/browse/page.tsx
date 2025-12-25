"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
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
import { searchListings, getCategories, getCampuses, addToFavorites, removeFromFavorites, getUserFavorites } from "@/lib/api/listings";
import { Listing, Category, CategoryResponse, CampusResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext"

import api from "@/lib/api/index";

const primaryColor = "#72C69B"

export default function BrowsePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams()

  // State for fetched data
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [campuses, setCampuses] = useState<CampusResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [selectedUniversity, setSelectedUniversity] = useState("All")
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 12

  const handleFavoriteToggle = async (id: number) => {
    const listingIndex = listings.findIndex(l => l.id === id);
    if (listingIndex === -1) return;
    
    const listing = listings[listingIndex];
    const wasFavorite = !!listing.isFavourite;
    
    // Optimistic update
    const newListings = [...listings];
    newListings[listingIndex] = { ...listing, isFavourite: !wasFavorite };
    setListings(newListings);

    try {
        if (!wasFavorite) {
            await addToFavorites(id);
        } else {
            await removeFromFavorites(id);
        }
    } catch (err) {
        console.error("Failed to toggle favorite:", err);
        // Revert
        const revertedListings = [...listings];
        revertedListings[listingIndex] = { ...listing, isFavourite: wasFavorite };
        setListings(revertedListings);
    }
  }

  // --- Initial Data Fetching (Categories & Campuses) ---
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, camps] = await Promise.all([getCategories(), getCampuses()]);
        setCategories(cats);
        setCampuses(camps);
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
        // We can still proceed, just dropdowns might be empty
      }
    };
    fetchMetadata();
  }, []);

  // --- URL Search Query Effect ---
  useEffect(() => {
    const query = searchParams.get("search")
    if (query !== null) {
      setSearchQuery(query)
    }
  }, [searchParams])

  // --- Listings Fetching Effect ---
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchListings({
            keyword: searchQuery,
            category: selectedCategory === "All" ? undefined : selectedCategory as Category,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            universityId: selectedUniversity === "All" ? undefined : Number(selectedUniversity),
            page: currentPage - 1, // Backend is 0-indexed
            size: pageSize,
            sortBy: "createdAt",
            sortDirection: "DESC"
        });

        // Filter out SOLD items on the client side as well, just in case backend returns them
        let activeListings = response.products.filter(l => l.status !== 'SOLD');

        // --- CLIENT-SIDE SELLER VERIFICATION ---
        // Since backend doesn't filter out deleted users or provide sellerName in the list,
        // we must verify each seller exists by fetching their profile.
        if (activeListings.length > 0) {
            const uniqueSellerIds = Array.from(new Set(activeListings.map(l => l.sellerId).filter((id): id is number => id !== undefined)));
            
            const validSellerIds = new Set<number>();
            
            // Fetch user profiles in parallel to check existence
            await Promise.all(uniqueSellerIds.map(async (sellerId) => {
                try {
                    await api.get(`/user/${sellerId}`);
                    validSellerIds.add(sellerId);
                } catch (err) {
                    // Only exclude if 404 (User Not Found)
                    // If network error or 500, we should probably give benefit of doubt or handle differently
                    // @ts-ignore
                    if (err.response?.status === 404) {
                        // User definitely doesn't exist
                    } else {
                        // Some other error, assume valid to avoid hiding legitimate listings during glitches
                        validSellerIds.add(sellerId); 
                    }
                }
            }));

            // Filter listings to only include those with valid sellers
            activeListings = activeListings.filter(l => l.sellerId && validSellerIds.has(l.sellerId));
        }

        // --- MERGE FAVORITES ---
        // Backend search response might not include isFavourite flag correctly or at all.
        // We fetch user's favorites separately and merge them.
        try {
            const userFavorites = await getUserFavorites();
            const favoriteProductIds = new Set(userFavorites.map(f => f.productId));
            
            activeListings = activeListings.map(l => ({
                ...l,
                isFavourite: favoriteProductIds.has(l.id)
            }));
        } catch (favErr) {
            console.warn("Failed to fetch user favorites for merging:", favErr);
            // Continue without merging favorites if this fails
        }

        setListings(activeListings);
        setTotalPages(response.totalPages);

      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to fetch listings. Please ensure the backend is running and reachable.");
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search query slightly to avoid too many requests
    const timeoutId = setTimeout(() => {
        fetchListings();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, priceRange, selectedUniversity, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, selectedUniversity]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.displayName}
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
                    max={2000} 
                    step={10}
                    className="flex-1 [&_[role=slider]]:bg-[#72C69B] [&_[role=slider]]:border-[#72C69B] [&_.bg-primary]:bg-[#72C69B]"
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
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id.toString()}>
                      {campus.name}
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
          ) : listings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => {
                // Logic to check ownership
                const isOwner = user?.id === listing.sellerId;

                return (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    onFavoriteToggle={() => handleFavoriteToggle(listing.id)}
                    // 3. Pass the result to the prop
                    showFavoriteButton={!isOwner} 
                  />
                );
              })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4">
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
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">No Listings Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {currentPage > 1 
                  ? "Listings on this page are currently unavailable (sold or removed)." 
                  : "We couldn't find any listings matching your criteria. Try adjusting your filters."}
              </p>
              {currentPage > 1 && (
                 <div className="mt-6">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Go to Previous Page
                    </button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}