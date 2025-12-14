import { Listing, User } from './types';

// ============================================================================
// MOCK DATABASE & API
// In a real application, this data would come from a database.
// This file serves as a centralized source of truth for all mock data.
// ============================================================================

export const mockUsers: { [key: string]: User } = {
  "test@campus.com": {
    id: 1,
    fullName: "Test User",
    email: "test@campus.com",
    university: { id: 1, name: "Campus University" },
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  "jane.doe@university.edu": {
    id: 2,
    fullName: "Jane Doe",
    email: "jane.doe@university.edu",
    university: { id: 2, name: "State University" },
    createdAt: new Date().toISOString(),
    isActive: true,
  },
};

export const mockListings: Listing[] = [
  {
    id: 1,
    title: "Calculus Textbook",
    description: "Excellent condition calculus textbook. Used for only one semester.",
    price: 45,
    image_url: "https://images.unsplash.com/photo-1543002588-b9b6b622e8af?q=80&w=2835&auto=format&fit=crop",
    category: "Books",
    status: 'active',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: "jane.doe@university.edu",
    updated_at: new Date().toISOString(),
    updated_by: "jane.doe@university.edu",
  },
  {
    id: 2,
    title: "Monitor 27 inch",
    description: "High-quality 27-inch monitor.",
    price: 180,
    image_url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2832&auto=format&fit=crop",
    category: "Electronics",
    status: 'active',
    created_at: new Date().toISOString(),
    created_by: "test@campus.com",
    updated_at: new Date().toISOString(),
    updated_by: "test@campus.com",
  },
  {
    id: 3,
    title: "Vintage Sector 9 Longboard",
    description: "Classic longboard, perfect for cruising around campus. Rides smooth!",
    price: 85,
    image_url: "https://i.redd.it/ujwk6nmh1h481.jpg",
    category: "Sports & Outdoors",
    status: 'sold', // This item is sold
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: "test@campus.com",
    updated_at: new Date().toISOString(),
    updated_by: "test@campus.com",
  },
  {
    id: 4,
    title: "IKEA Desk",
    description: "Sturdy IKEA desk in great condition.",
    price: 120,
    image_url: "/placeholder.svg?key=ys508",
    category: "Furniture",
    status: 'sold', // This item is also sold
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: "jane.doe@university.edu",
    updated_at: new Date().toISOString(),
    updated_by: "jane.doe@university.edu",
  },
];

// Mock API functions
export const getListingById = (id: string | number) => {
  const listing = mockListings.find(l => l.id.toString() === id.toString());
  if (!listing) return null;
  
  const sellerData = mockUsers[listing.created_by];
  return { listing, sellerData };
};

export const getListingsByUser = (email: string) => {
  return mockListings.filter(l => l.created_by === email);
};

export const getActiveListings = () => {
  return mockListings.filter(l => l.status === 'active');
};

export const getSoldTransactions = () => {
    return mockListings.filter(l => l.status === 'sold');
}
