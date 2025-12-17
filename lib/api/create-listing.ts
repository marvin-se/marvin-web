// lib/api/listings.ts
import api from './index';
import { Listing } from '../types'; 

// Yeni DTO Tipi (Backend'e gönderilecek format)
interface CreateListingRequest {
    title: string;
    description: string;
    price: number; // Frontend'den number olarak gönderiyoruz
    category: string;
    images: string[];
}

/**
 * Yeni bir ilan oluşturur.
 * @param data İlan detaylarını içeren CreateListingRequest DTO'su.
 * @returns Oluşturulan ilanın DTO yanıtı.
 */
export async function createNewListing(data: CreateListingRequest): Promise<Listing> {
    const url = "/listings"; // POST /listings endpoint'ine gönderilecek
    
    // NOT: Backend'de category adları büyük harflerle (BOOKS, ELECTRONICS) tutulduğu için
    // frontend'den gelen 'Books'/'Electronics' gibi değerleri büyük harfe çevirelim.
    const mappedData = {
        ...data,
        category: data.category.toUpperCase().replace(/\s/g, '_'),
    };

    const response = await api.post<Listing>(url, mappedData);
    
    // Backend'den dönen yanıtı doğrudan Listing türüne eşleyebiliriz.
    return response.data;
}