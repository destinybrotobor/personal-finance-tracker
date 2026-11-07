// src/lib/axios.ts
import axios from 'axios';

const httpClient = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // 'Content-Type': 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true
});

export default httpClient;