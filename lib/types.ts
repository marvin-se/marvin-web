// Shared type definitions for the application
// These types match the database schema

// User type - matches the user table in the database
export interface User {
  id: number  // LONG SERIAL
  full_name: string  // VARCHAR(100) NOT NULL
  email: string  // VARCHAR(150) NOT NULL
  password_hash?: string  // VARCHAR(255) NOT NULL - only used for registration/login, not stored in frontend
  university?: string | null  // VARCHAR(150) - optional
  phone_number?: string | null  // VAR_CHAR(20) - optional
  created_at: string | Date  // TIMESTAMP NOT NULL
  is_active: boolean  // BOOLEAN NOT NULL
  
  // Optional computed/display fields (not in database, calculated from listings/transactions)
  items_sold?: number  // Number of items sold by this user
  items_purchased?: number  // Number of items purchased by this user
  items_listed?: number  // Number of active listings by this user
}

// Seller type - represents a User in the context of a listing
// Uses utility types to pick only needed fields from User, plus optional display fields
export type Seller = Pick<User, 'id' | 'full_name' | 'university' | 'email'> & {
  // Optional display-only fields (not in database, computed/display only)
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

