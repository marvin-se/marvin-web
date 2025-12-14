// Shared type definitions for the application
// These types match the backend DTOs

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
  createdAt: string | Date
  isActive: boolean
  token?: string  // JWT token from login response
  
  // Optional computed/display fields (not in database, calculated from listings/transactions)
  items_sold?: number
  items_purchased?: number
  items_listed?: number
}

// Seller type - represents a User in the context of a listing
export type Seller = Pick<User, 'id' | 'fullName' | 'university' | 'email'> & {
  // Optional display-only fields
}

// Listing type - matches the products table in the database
export interface Listing {
  // Required fields from database
  id: number  // LONG SERIAL
  title: string  // VARCHAR(100) NOT NULL
  description: string  // VARCHAR(255) NOT NULL
  price: number  // DOUBLE NOT NULL
  image_url: string  // VARCHAR(150) NOT NULL
  category?: string | null  // VAR_CHAR(20) - optional
  status: 'active' | 'sold'; // Status of the listing
  created_at: string | Date  // TIMESTAMP NOT NULL
  created_by: string  // VARCHAR(100) NOT NULL (user ID or email)
  updated_at: string | Date  // TIMESTAMP NOT NULL
  updated_by: string  // VARCHAR(100) NOT NULL (user ID or email)

  // Computed/display fields (can be generated from other fields)
  details?: Array<{ label: string; value: string }>
}

// Helper type for listing card (only needs minimal fields)
// This allows ListingCard to work with partial data
export type ListingCardData = Pick<Listing, 'id' | 'title' | 'price' | 'category'> & {
  image: string  // Card always needs at least one image (from image_url or image)
}

