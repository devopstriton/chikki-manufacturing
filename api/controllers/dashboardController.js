const Batch = require('../models/Batch');
const analysisService = require('../services/analysisService');

exports.getStats = async (req, res) => {
    try {
        const total = await Batch.countDocuments();
        const completed = await Batch.countDocuments({ status: 'completed' });
        const open = await Batch.countDocuments({ status: 'open' });

        // Calculate averages across all completed batches
        const completedBatches = await Batch.find({ status: 'completed' });

        let totalQuality = 0;
        let totalTemp = 0;
        let tempReadingsCount = 0;

        completedBatches.forEach(b => {
            if (b.result && b.result.actualQuality) {
                totalQuality += b.result.actualQuality;
            }
            if (b.roastingReadings && b.roastingReadings.length > 0) {
                let batchTempSum = b.roastingReadings.reduce((s, r) => s + r.temperature, 0);
                totalTemp += (batchTempSum / b.roastingReadings.length);
                tempReadingsCount++;
            }
        });

        const avgQuality = completed > 0 ? (totalQuality / completed).toFixed(1) : 0;
        const avgTemperature = tempReadingsCount > 0 ? (totalTemp / tempReadingsCount).toFixed(1) : 0;

        res.status(200).json({
            total,
            completed,
            open,
            avgQuality,
            avgTemperature
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getInsights = async (req, res) => {
    try {
        const batches = await Batch.find({ status: 'completed' });
        const insights = analysisService.getCorrelationInsights(batches);
        res.status(200).json(insights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getScatterData = async (req, res) => {
    try {
        const batches = await Batch.find({ status: 'completed' });
        const scatterData = batches.map(b => {
            // safe calculate avgs
            const avg = (arr, key) => arr && arr.length > 0 ? arr.reduce((s, r) => s + Number(r[key]), 0) / arr.length : 0;
            return {
                id: b.id,
                humidity: avg(b.rawMaterials, 'humidity'),
                temperature: avg(b.roastingReadings, 'temperature'),
                quality: b.result?.actualQuality || 0,
            };
        });
        res.status(200).json(scatterData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
