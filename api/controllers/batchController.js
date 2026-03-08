const Batch = require('../models/Batch');

// CREATE a new batch
exports.createBatch = async (req, res) => {
    try {
        const { expectedQuality, expectedQuantityKg } = req.body;

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // yyyyMMdd
        const prefix = `BATCH-${dateStr}-`;

        // Count existing batches for today to generate next sequence
        const todayCount = await Batch.countDocuments({ id: { $regex: `^${prefix}` } });
        const seq = String(todayCount + 1).padStart(3, '0');
        const batchId = `${prefix}${seq}`;

        console.log('batchId', batchId);

        const newBatch = new Batch({
            id: batchId,
            plan: { expectedQuality, expectedQuantityKg }
        });
        await newBatch.save();
        res.status(201).json(newBatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET active batch
exports.getActiveBatch = async (req, res) => {
    try {
        const batch = await Batch.findOne({ status: 'open' }).sort({ createdAt: -1 });
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET all batches with pagination and filtering
exports.getBatches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'all';
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = {};
        if (status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.id = { $regex: search, $options: 'i' };
        }

        const batches = await Batch.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Batch.countDocuments(query);

        res.status(200).json({
            batches,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBatches: total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH complete batch
exports.completeBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { actualQuantityKg, wastageKg, actualQuality, notes } = req.body;

        const batch = await Batch.findOneAndUpdate(
            { id },
            {
                status: 'completed',
                result: { actualQuantityKg, wastageKg, actualQuality, notes }
            },
            { new: true }
        );
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE batch
exports.deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await Batch.findOneAndDelete({ id });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ADD Readings
exports.addRawMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findOneAndUpdate(
            { id },
            { $push: { rawMaterials: req.body } },
            { new: true }
        );
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addRoastingReading = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findOneAndUpdate(
            { id },
            { $push: { roastingReadings: req.body } },
            { new: true }
        );
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addJaggeryReading = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findOneAndUpdate(
            { id },
            { $push: { jaggeryReadings: req.body } },
            { new: true }
        );
        res.status(200).json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
