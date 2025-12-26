import api from './index';
import { BlockListResponse, SalesResponse, PurchaseResponse } from '../types';

export interface PresignResponse {
    key: string;
    uploadUrl: string;
}

export interface ViewResponse {
    url: string;
}

export async function presignProfilePicture(contentType: string): Promise<PresignResponse> {
    const response = await api.post<PresignResponse>('/user/profile-picture/presign', { contentType });
    return response.data;
}

export async function saveProfilePicture(key: string): Promise<void> {
    await api.put('/user/profile-picture', { key });
}

export async function getMyProfilePicture(): Promise<string> {
    const response = await api.get<ViewResponse>('/user/profile-picture/me');
    return response.data.url;
}

export async function getUserProfilePicture(userId: number): Promise<string> {
    const response = await api.get<ViewResponse>(`/user/${userId}/profile-picture`);
    return response.data.url;
}

export async function getBlockedUsers(): Promise<BlockListResponse> {
    const response = await api.get<BlockListResponse>('/user/blocked');
    return response.data;
}

export async function unblockUser(userId: number | string): Promise<void> {
    await api.delete(`/user/${userId}/unblock`);
}

/**
 * Fetches sales history for the current user.
 * Returns empty array if no sales found (backend throws exception for empty).
 */
export async function getSalesHistory(): Promise<SalesResponse> {
    try {
        const response = await api.get<SalesResponse>('/user/sales');
        return response.data;
    } catch (error: any) {
        // Backend throws RuntimeException "You did not sold any item!" when empty
        if (error.response?.status === 500 || error.response?.data?.message?.includes('did not sold')) {
            return { transactions: [] };
        }
        throw error;
    }
}

/**
 * Fetches purchase history for the current user.
 * Returns empty array if no purchases found (backend throws exception for empty).
 */
export async function getPurchasesHistory(): Promise<PurchaseResponse> {
    try {
        const response = await api.get<PurchaseResponse>('/user/purchases');
        return response.data;
    } catch (error: any) {
        // Backend throws RuntimeException "You did not purchase any item!" when empty
        if (error.response?.status === 500 || error.response?.data?.message?.includes('did not purchase')) {
            return { transactions: [] };
        }
        throw error;
    }
}
