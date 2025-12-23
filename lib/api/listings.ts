// lib/api/listings.ts
import api from './index'; // Import the centralized Axios instance
import { Listing, SearchRequest, SearchResponse, CategoryResponse, CampusResponse, UniversityNameResponse } from '../types'; // Adjust path to access types.ts
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
    favouriteCount?: number; // <-- ADDED: These are optional fields.
    visitCount?: number;    // <-- ADDED
    sellerId?: number;
    sellerName?: string;
    status?: string; // <-- ADDED: Status field from backend
    isFavourite?: boolean;
    createdAt: string;

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
      favouriteCount: item.favouriteCount,
      visitCount: item.visitCount,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      status: (item.status as 'ACTIVE' | 'SOLD') || 'ACTIVE', // Map status
      isFavourite: item.isFavourite,
      createdAt: item.createdAt,
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

      favouriteCount: item.favouriteCount,
      visitCount: item.visitCount,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      status: (item.status as 'ACTIVE' | 'SOLD') || 'ACTIVE', // Map status
      isFavourite: item.isFavourite,
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

/**
 * Deletes a listing by its ID.
 * @param id The ID of the listing to delete.
 */
export async function deleteListing(id: string): Promise<void> {
  const url = `/listings/${id}`;
  try {
    await api.delete(url);
  } catch (error) {
    console.error(`Error deleting listing ${id}:`, error);
    throw new Error("Failed to delete listing.");
  }
}

/**
 * Updates a listing by its ID.
 * @param id The ID of the listing to update.
 * @param data The partial data to update.
 * @returns The updated Listing object.
 */
export async function updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
  const url = `/listings/${id}`;
  
  // Map frontend Listing fields to backend UpdateRequest DTO fields
  const updateData = {
    title: data.title,
    description: data.description,
    price: data.price,
    images: data.images,
    // Note: Category is usually not updatable in this specific backend implementation based on DTO, 
    // but if it were, we would map it here.
  };

  try {
    const response = await api.put(url, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating listing ${id}:`, error);
    throw new Error("Failed to update listing.");
  }
}

/**
 * Marks a listing as sold.
 * @param id The ID of the listing to mark as sold.
 * @returns The updated Listing object.
 */
export async function markAsSold(id: string): Promise<Listing> {
  const url = `/listings/${id}/mark-sold`;
  try {
    const response = await api.put(url);
    return response.data;
  } catch (error) {
    console.error(`Error marking listing ${id} as sold:`, error);
    throw new Error("Failed to mark listing as sold.");
  }
}

// --- Search & Filter API Functions ---

export async function searchListings(params: SearchRequest): Promise<SearchResponse> {
  const url = "/search/listings";
  try {
    const response: AxiosResponse<SearchResponse> = await api.get(url, { params });
    
    const rawResponse = response.data as unknown as { products: ProductDTOResponse[], totalElements: number, totalPages: number, currentPage: number, pageSize: number, hasNext: boolean, hasPrevious: boolean };
    
    const mappedProducts: Listing[] = rawResponse.products.map((item: ProductDTOResponse) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price, 
      category: item.category as Listing['category'], 
      universityName: item.universityName,
      images: item.images || [],
      imageUrl: item.imageUrl || "/placeholder.svg", 
      created_by: item.universityName || 'Unknown Seller',
      favouriteCount: item.favouriteCount,
      visitCount: item.visitCount,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      status: (item.status as 'ACTIVE' | 'SOLD') || 'ACTIVE',
      isFavourite: item.isFavourite,
    }));

    return {
        ...rawResponse,
        products: mappedProducts
    };

  } catch (error) {
    console.error("Error searching listings:", error);
    throw new Error("Failed to search listings.");
  }
}

export async function filterListings(params: SearchRequest): Promise<SearchResponse> {
    const url = "/search/filter";
    try {
      const response: AxiosResponse<SearchResponse> = await api.get(url, { params });
      
      const rawResponse = response.data as unknown as { products: ProductDTOResponse[], totalElements: number, totalPages: number, currentPage: number, pageSize: number, hasNext: boolean, hasPrevious: boolean };
      
      const mappedProducts: Listing[] = rawResponse.products.map((item: ProductDTOResponse) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price, 
        category: item.category as Listing['category'], 
        universityName: item.universityName,
        images: item.images || [],
        imageUrl: item.imageUrl || "/placeholder.svg", 
        created_by: item.universityName || 'Unknown Seller',
        favouriteCount: item.favouriteCount,
        visitCount: item.visitCount,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        status: (item.status as 'ACTIVE' | 'SOLD') || 'ACTIVE',
      isFavourite: item.isFavourite,
    }));
  
    return {
        ...rawResponse,
        products: mappedProducts
    };
  
  } catch (error) {
    console.error("Error filtering listings:", error);
    throw new Error("Failed to filter listings.");
  }
}

export async function getCategories(): Promise<CategoryResponse[]> {
  const url = "/search/categories";
  try {
    const response = await api.get<CategoryResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories.");
  }
}

export async function getCampuses(): Promise<CampusResponse[]> {
  const url = "/search/campuses";
  try {
    const response = await api.get<CampusResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching campuses:", error);
    throw new Error("Failed to fetch campuses.");
  }
}

export async function getUniversities(): Promise<UniversityNameResponse[]> {
  const url = "/universities";
  try {
    const response = await api.get<UniversityNameResponse[]>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching universities:", error);
    throw new Error("Failed to fetch universities.");
  }
}

export interface FavouriteDTO {
    id: number;
    userId: number;
    productId: number;
}

export async function addToFavorites(productId: number): Promise<void> {
  await api.post("/favourites/add", { productId });
}

export async function removeFromFavorites(productId: number): Promise<void> {
  await api.delete(`/favourites/${productId}`);
}


export async function getUserFavorites(): Promise<FavouriteDTO[]> {
  const response = await api.get("/favourites/getAll");
  return response.data;
}