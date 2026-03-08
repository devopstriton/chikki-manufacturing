const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
    weightKg: { type: Number, required: true },
    humidity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const roastingReadingSchema = new mongoose.Schema({
    temperature: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const jaggeryReadingSchema = new mongoose.Schema({
    volumeLiters: { type: Number, required: true },
    density: { type: Number, required: true },
    viscosity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const batchSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    status: { type: String, enum: ['open', 'completed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
    plan: {
        expectedQuality: { type: Number, min: 1, max: 10, required: true },
        expectedQuantityKg: { type: Number, required: true }
    },
    rawMaterials: [rawMaterialSchema],
    roastingReadings: [roastingReadingSchema],
    jaggeryReadings: [jaggeryReadingSchema],
    result: {
        actualQuantityKg: Number,
        wastageKg: Number,
        actualQuality: { type: Number, min: 1, max: 10 },
        notes: String
    }
});

// Indexes for optimized querying
batchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Batch', batchSchema);
