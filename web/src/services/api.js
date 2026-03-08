const API_BASE = 'http://localhost:5000/api';

// Batch Endpoints
export const fetchBatches = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/batches${query ? `?${query}` : ''}`);
    return res.json();
};

export const fetchActiveBatch = async () => {
    const res = await fetch(`${API_BASE}/batches/active`);
    return res.json();
};

export const createBatch = async (plan) => {
    const res = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
    });
    return res.json();
};

export const completeBatch = async (batchId, result) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
    });
    return res.json();
};

export const deleteBatch = async (id) => {
    return fetch(`${API_BASE}/batches/${id}`, { method: 'DELETE' });
};

// Readings Endpoints
export const addRawMaterial = async (batchId, data) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const addRoastingReading = async (batchId, data) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/roasting-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const addJaggeryReading = async (batchId, data) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/jaggery-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

// Dashboard Endpoints
export const fetchDashboardStats = async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return res.json();
};

export const fetchDashboardInsights = async () => {
    const res = await fetch(`${API_BASE}/dashboard/insights`);
    return res.json();
};

export const fetchDashboardScatterData = async () => {
    const res = await fetch(`${API_BASE}/dashboard/scatter-data`);
    return res.json();
};
