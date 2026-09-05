const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true
    },
    tableNumber: {
        type: String,
        required: [true, 'Table number is required'],
        trim: true
    },
    seats: {
        type: Number,
        required: [true, 'Seats are required'],
        min: [1, 'Seats must be at least 1'],
        validate: { validator: Number.isInteger, message: 'Seats must be a whole number' }
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'occupied'],
        default: 'available',
        index: true
    },
    notes: { type: String, default: '', trim: true }
}, { timestamps: true });

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
