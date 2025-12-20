// Shared type definitions for the application
// These types match the backend DTOs

// Category type - directly from backend constants
export type Category = 
  | "ELECTRONICS"
  | "BOOKS"
  | "FASHION"
  | "HOME"
  | "SPORTS"
  | "OTHER"
  | "STATIONERY"
  | "FURNITURE"
  

// University type - matches backend University entity
export interface University {
  id: number
  name: string
}

// User type - matches backend UserResponse DTO
export interface User {
  id: number
  fullName: string
  email: string
  phoneNumber?: string | null
  university?: University | null
  profilePicUrl?: string | null
  description?: string | null
  createdAt: string | Date
  isActive: boolean
  token?: string  // JWT token from login response
  
  // Optional computed/display fields (not in database, calculated from listings/transactions)
  items_sold?: number
  items_purchased?: number
  items_listed?: number
}

export interface PublicProfile {
  fullName: string;
  universityId: number;
  universityName: string;
  profilePicUrl: string | null;
  description: string | null;
}

// Seller type - represents a User in the context of a listing
export type Seller = Pick<User, 'id' | 'fullName' | 'university' | 'email'> & {
  // Optional display-only fields
}


// ----------------------------------------------------------------------
// NEW LISTING TYPES (Aligned with ProductDTO.Response)
// ----------------------------------------------------------------------

/**
 * Interface that directly maps to the backend's ProductDTO.Response.
 */
export interface ProductListing {
  id: number;
  title: string;
  description: string;
  price: number; // BigDecimal from backend maps to number in JS
  category: Category;

  // New fields from the backend DTO
  universityName: string; // From user.university.name
  images: string[]; // List of all image URLs
  imageUrl: string; // The primary image URL (first item in 'images' list)
  sellerId?: number;
  sellerName?: string;

  // OWNER ONLY fields
  favoriteCount?: number;
  visitCount?: number;
  
  // User specific
  isFavourite?: boolean;

  // Fields needed to satisfy existing frontend logic:
  // created_by is used for the avatar/university lookup in the old mock data.
  // We'll use the university name as a default for the avatar initial display, 
  // as the full user object is not available here.
  created_by: string; // We map this from 'universityName' or 'id' in the fetch function
}

/**
 * Listing interface is now an alias for ProductListing to minimize changes 
 * in components like BrowsePage.tsx and ListingCard.tsx.
 */
export type Listing = ProductListing & {
    // We add 'status' and 'created_at' back for any component that might rely on the old structure,
    // assuming the backend fetch handles mapping the Product entity's status and date fields 
    // onto the DTO's response or that they will be added to the DTO later.
    status?: 'ACTIVE' | 'SOLD'; 
    created_at?: string | Date;
}


// Helper type for listing card (only needs minimal fields)
export type ListingCardData = Pick<Listing, 'id' | 'title' | 'price' | 'category'> & {
  // Use 'imageUrl' from ProductListing for compatibility
  image: string;
}

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
}

export interface Transaction {
  id: number;
  product: ProductListing;
  seller: User;
  buyer: User;
  createdAt: string;
}

export interface SalesResponse {
  transactions: Transaction[];
}

export interface PurchaseResponse {
  transactions: Transaction[];
}

export interface SearchRequest {
  keyword?: string;
  category?: Category | "All";
  minPrice?: number;
  maxPrice?: number;
  universityId?: number;
  universityName?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface SearchResponse {
  products: Listing[]; // We map ProductDTO.Response to Listing
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CategoryResponse {
  category: Category;
  displayName: string;
}

export interface CampusResponse {
  id: number;
  name: string;
}

export interface UniversityNameResponse {
  name: string;
}