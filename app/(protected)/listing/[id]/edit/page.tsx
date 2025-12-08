"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Listing } from "@/lib/types";
import { getListingById } from "@/lib/mock-data"; // Import from central source

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Partial<Listing>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch data from the central mock data source
      const data = getListingById(id);
      if (data) {
        setListing(data.listing);
      }
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setListing(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setListing(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send a PUT/PATCH request to your API to update the listing
    console.log("Updated Listing:", listing);
    alert("Listing updated successfully! (Simulated)");
    router.push("/profile");
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  if (!listing.id) {
    return <div className="text-center py-10 text-red-500">Listing not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border">
        
        <div>
          <Label htmlFor="title" className="font-semibold">Title</Label>
          <Input 
            id="title" 
            name="title"
            value={listing.title || ""}
            onChange={handleInputChange}
            placeholder="e.g., Gently Used Calculus Textbook" 
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="font-semibold">Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={listing.description || ""}
            onChange={handleInputChange}
            placeholder="Describe the item's condition, features, etc."
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price" className="font-semibold">Price ($)</Label>
            <Input 
              id="price"
              name="price"
              type="number" 
              value={listing.price || ""}
              onChange={handleInputChange}
              placeholder="e.g., 45"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="font-semibold">Category</Label>
            <Select onValueChange={handleSelectChange} value={listing.category || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
            <Label htmlFor="image_url" className="font-semibold">Image URL</Label>
            <Input 
              id="image_url"
              name="image_url"
              value={listing.image_url || ""}
              onChange={handleInputChange}
              placeholder="https://..."
            />
            {listing.image_url && (
                <div className="mt-4">
                    <img src={listing.image_url} alt="Preview" className="rounded-md max-h-40" />
                </div>
            )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
        </div>

      </form>
    </div>
  );
}
