"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/listing-card";
import { useAuth } from "@/contexts/AuthContext";
import { Listing, Favorite } from "@/lib/types";
import { getUserFavorites, removeFromFavorites, getListingDetailById } from "@/lib/api/listings";

const primaryColor = "#72C69B";
const secondaryColor = "#182C53";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setError("Please log in to view your favorites.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const favs = await getUserFavorites();
        const productIds = favs.map((fav) => fav.productId);

        if (productIds.length > 0) {
          const productPromises = productIds.map((id) =>
            getListingDetailById(id.toString())
          );
          const products = await Promise.all(productPromises);
          setFavorites(products);
        } else {
          setFavorites([]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError("Could not load your favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (productId: number) => {
    if (!user) return;

    try {
      await removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      // Optionally, show a toast notification for the error
      setError("Could not remove the item. Please try again.");
    }
  };
  
  const emptyFavorites = favorites.length === 0;

  return (
    <div className="w-full min-h-screen">
      <div className="w-full pt-18 px-6 pb-12">
        
        {/* Header Section */}
        <div 
          className="mb-8 py-9 px-6 rounded-lg"
          style={{ backgroundColor: "#F5F6F8" }}
        >
          <h1 className="text-4xl font-bold text-[#182C53] mb-2">My Favorites</h1>
          <p className="text-gray-500 text-sm">Items you've saved for later</p>
        </div>

        {/* Listings Container - Same style as Browse page */}
        <div className="bg-[#F5F6F8] rounded-xl border border-gray-200 p-8 mb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ListingCard.Skeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : emptyFavorites ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-white rounded-full text-5xl">❤️</div>
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">No Favorites Yet</h2>
              <p className="text-gray-600 mb-6">
                Start exploring and save items you like
              </p>
              <Link href="/browse">
                <Button
                  className="text-white rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        
      </div>
    </div>
  );
}
