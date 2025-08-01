// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : '/api'; // 프로덕션에서는 같은 도메인 사용

// API Headers
const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// API Helper Functions
const apiRequest = async (endpoint, options = {}) => {
    try {
        console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {})
            }
        });
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Export API functions
window.API = {
    // Auth endpoints
    register: (data) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    login: (data) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    adminLogin: (data) => apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    // Enterprise endpoints
    getPrograms: () => apiRequest('/enterprise/programs'),
    
    submitRequest: (data) => apiRequest('/enterprise/request', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    submitDates: (requestId, dates) => apiRequest(`/enterprise/request/${requestId}/dates`, {
        method: 'POST',
        body: JSON.stringify({ dates })
    }),
    
    getRequests: () => apiRequest('/enterprise/requests'),
    
    getRequest: (requestId) => apiRequest(`/enterprise/requests/${requestId}`),
    
    acceptSchedule: (requestId) => apiRequest(`/enterprise/requests/${requestId}/accept`, {
        method: 'POST'
    }),
    
    // Admin endpoints
    getAdminRequests: (status) => {
        let endpoint = '/admin/requests';
        if (status) endpoint += `?status=${status}`;
        return apiRequest(endpoint);
    },
    
    updateRequestStatus: (requestId, status) => apiRequest(`/admin/requests/${requestId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    }),
    
    confirmSchedule: (requestId, data) => apiRequest(`/admin/requests/${requestId}/confirm`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    // File upload
    uploadFile: async (endpoint, file, additionalData = {}) => {
        console.log(`File Upload: ${endpoint}`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        
        const data = await response.json();
        console.log('Upload Response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        return data;
    }
};