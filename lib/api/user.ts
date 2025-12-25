import api from './index';

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
