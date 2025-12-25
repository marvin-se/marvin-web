import api from './index';
import { Listing } from '../types'; 
import axios from 'axios';
import { presignImages, attachImages, publishListing } from './listings';

// Frontend Request DTO
interface CreateListingRequest {
    title: string;
    description: string;
    price: number;
    category: string;
    files: File[]; 
}

/**
 * Creates a new listing with images.
 * Handles the multi-step process: Create -> Presign -> Upload -> Attach -> Publish.
 */
export async function createNewListing(data: CreateListingRequest): Promise<Listing> {
    // 1. Create Listing (Metadata)
    const createUrl = "/listings"; 
    const mappedData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category.toUpperCase().replace(/\s/g, '_'),
    };

    const createResponse = await api.post<Listing>(createUrl, mappedData);
    const listingId = createResponse.data.id;

    // 2. Presign Images
    if (data.files.length > 0) {
        const presignRequests = data.files.map(file => ({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream' // Ensure content type is never empty
        }));

        const presignedImages = await presignImages(listingId, presignRequests);

        // 3. Upload Images to S3/MinIO
        // We use a Next.js API proxy to bypass browser CORS restrictions
        const uploadPromises = presignedImages.map(async (img, index) => {
            const file = data.files[index];
            
            // Verify content type matches what we signed
            const contentType = file.type || 'application/octet-stream';
            
            const response = await fetch('/api/s3-proxy', {
                method: 'PUT',
                headers: {
                    'Content-Type': contentType,
                    'X-Upload-Url': img.uploadUrl
                },
                body: file
            });

            if (!response.ok) {
                throw new Error(`Failed to upload image via proxy. Status: ${response.status}`);
            }

            return img.key;
        });

        const uploadedKeys = await Promise.all(uploadPromises);

        // 4. Attach Images to Listing
        await attachImages(listingId, uploadedKeys);
    }

    // 5. Publish Listing
    await publishListing(listingId);

    return createResponse.data;
}