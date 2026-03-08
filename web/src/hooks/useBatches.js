import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export function useBatches() {
    const [batches, setBatches] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, open: 0, avgQuality: 0, avgTemperature: 0 });
    const [loading, setLoading] = useState(true);

    const fetchBatches = useCallback(async () => {
        try {
            // Fetch some recent completed batches for dashboard & active ones
            const data = await api.fetchBatches({ limit: 10 });
            const activeBatch = await api.fetchActiveBatch();
            const statsData = await api.fetchDashboardStats();

            let allBatches = data.batches || [];
            if (activeBatch && !allBatches.find(b => b.id === activeBatch.id)) {
                allBatches = [activeBatch, ...allBatches];
            }

            setBatches(allBatches);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    const createBatch = useCallback(async (plan) => {
        try {
            const newBatch = await api.createBatch(plan);
            setBatches(prev => [newBatch, ...prev]);
            fetchBatches(); // Refresh stats
            return newBatch;
        } catch (error) {
            console.error(error);
        }
    }, [fetchBatches]);

    const addRawMaterial = useCallback(async (batchId, data) => {
        try {
            const updated = await api.addRawMaterial(batchId, data);
            setBatches(prev => prev.map(b => b.id === batchId ? updated : b));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const addRoastingReading = useCallback(async (batchId, data) => {
        try {
            const updated = await api.addRoastingReading(batchId, data);
            setBatches(prev => prev.map(b => b.id === batchId ? updated : b));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const addJaggeryReading = useCallback(async (batchId, data) => {
        try {
            const updated = await api.addJaggeryReading(batchId, data);
            setBatches(prev => prev.map(b => b.id === batchId ? updated : b));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const completeBatch = useCallback(async (batchId, result) => {
        try {
            const updated = await api.completeBatch(batchId, result);
            setBatches(prev => prev.map(b => b.id === batchId ? updated : b));
            fetchBatches();
        } catch (error) {
            console.error(error);
        }
    }, [fetchBatches]);

    const deleteBatch = useCallback(async (id) => {
        try {
            await api.deleteBatch(id);
            setBatches(prev => prev.filter(b => b.id !== id));
            fetchBatches();
        } catch (error) {
            console.error(error);
        }
    }, [fetchBatches]);

    const getActiveBatch = useCallback(() => {
        return batches.find(b => b.status === 'open') || null;
    }, [batches]);

    const getBatchAverages = (batch) => {
        const avgArr = (arr, key) =>
            arr && arr.length > 0
                ? arr.reduce((s, r) => s + Number(r[key]), 0) / arr.length
                : 0;

        return {
            avgHumidity: avgArr(batch.rawMaterials, 'humidity'),
            totalWeightKg: (batch.rawMaterials || []).reduce((s, r) => s + Number(r.weightKg), 0),
            avgTemperature: avgArr(batch.roastingReadings, 'temperature'),
            avgDensity: avgArr(batch.jaggeryReadings, 'density'),
            avgViscosity: avgArr(batch.jaggeryReadings, 'viscosity'),
            totalJaggeryLiters: (batch.jaggeryReadings || []).reduce((s, r) => s + Number(r.volumeLiters), 0),
        };
    };

    return {
        batches,
        loading,
        createBatch,
        addRawMaterial,
        addRoastingReading,
        addJaggeryReading,
        completeBatch,
        deleteBatch,
        getActiveBatch,
        getBatchAverages,
        stats,
    };
}
