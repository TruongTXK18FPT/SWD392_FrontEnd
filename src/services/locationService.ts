import axios from "axios";
import { getToken } from "./localStorageService";

// Cấu hình base URL cho API backend của bạn
const api = axios.create({
    baseURL: "http://localhost:8072/swd391/user/api/locations",
});

const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types cho dữ liệu vị trí
interface LocationData {
    code: number;
    name: string;
}

// Interface cho response từ Vietnam Provinces API
interface ProvinceWithDistricts extends LocationData {
    districts: LocationData[];
}

// Lấy danh sách tỉnh/thành từ backend
export const fetchProvincesFromAPI = async (): Promise<LocationData[]> => {
    const response = await api.get<LocationData[]>("/provinces", {
        headers: getAuthHeaders(),
    });
    return response.data;
};

// Lấy danh sách quận/huyện từ backend
export const fetchDistrictsFromAPI = async (provinceCode: string): Promise<LocationData[]> => {
    try {
        const response = await api.get<ProvinceWithDistricts>(`/provinces/${provinceCode}/districts`, {
            headers: getAuthHeaders(),
        });

        // Kiểm tra xem response có districts property không
        if (response.data && response.data.districts && Array.isArray(response.data.districts)) {
            return response.data.districts;
        } else {
            // Nếu không có districts property hoặc không phải array, trả về empty array
            console.warn("Districts data structure is different than expected:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching districts for province code", provinceCode, ":", error);
        // Trả về empty array thay vì throw error để không crash UI
        return [];
    }
};

// Hàm này không còn cần thiết nữa vì frontend sẽ có toàn bộ danh sách
// và có thể tự tìm tên, nhưng bạn có thể giữ lại nếu muốn
export const formatLocationName = (fullName: string): string => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : fullName;
};