// lib/api/listings.ts
import api from './index'; // Import the centralized Axios instance
import { Listing } from '../types'; // Adjust path to access types.ts
import { AxiosResponse } from 'axios';
import axios from 'axios';

// --- Internal Type Definitions ---
interface ProductDTOResponse {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    universityName: string;
    images: string[];
    imageUrl?: string; // <-- ADDED: The backend is setting this field.
    favoriteCount?: number; // <-- ADDED: These are optional fields.
    visitCount?: number;    // <-- ADDED
}

// --- Listing API Functions ---
export async function getAllListings(): Promise<Listing[]> {
  const url = "/listings"; 
  try {
    const response: AxiosResponse<ProductDTOResponse[]> = await api.get(url);
    
    // DTO Mapping Logic (as provided before)
    const listings: Listing[] = response.data.map((item: ProductDTOResponse) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price, 
      category: item.category as Listing['category'], 
      universityName: item.universityName,
      images: item.images || [],
      imageUrl: item.imageUrl || "/placeholder.svg", 
      created_by: item.universityName || 'Unknown Seller',
      favoriteCount: item.favoriteCount,
      visitCount: item.visitCount,
    }));

    return listings;
  } catch (error) {
    // ... error handling ...
    throw error;
  }
}

/**
 * Fetches a single product listing by its ID.
 * @param id The ID of the product.
 * @returns A promise that resolves to a single Listing object.
 */
export async function getListingDetailById(id: string): Promise<Listing> {
  const url = `/listings/${id}`;

  try {
    const response: AxiosResponse<ProductDTOResponse> = await api.get(url);

    const item = response.data;

    // Map the backend DTO structure to the frontend Listing structure
    const listing: Listing = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price, 
      category: item.category as Listing['category'],
      universityName: item.universityName,
      images: item.images || [],
      imageUrl: item.imageUrl || "/placeholder.svg", 
      // Assuming 'created_by' is used for user identification/avatar:
      created_by: item.universityName || 'Unknown Seller', 

      favoriteCount: item.favoriteCount,
      visitCount: item.visitCount,
    };

    return listing;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Listing not found.");
    }
    console.error(`Error fetching listing ${id}:`, error);
    throw new Error("Failed to fetch listing details.");
  }
}