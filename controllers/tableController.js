const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const tableStatuses = ['available', 'reserved', 'occupied'];

const getRestaurant = async () => {
    let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
    if (!restaurant) {
        restaurant = await Restaurant.create({ name: 'مطعم أبو قورة الفلاحي', slug: 'abu-qoura' });
    }
    return restaurant;
};

exports.getAvailableTables = async (req, res) => {
    try {
        const restaurant = await getRestaurant();
        const tables = await Table.find({ restaurantId: restaurant._id, status: 'available' })
            .select('tableNumber seats')
            .sort({ tableNumber: 1 })
            .lean();
        res.json({ success: true, tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTables = async (req, res) => {
    try {
        const restaurant = await getRestaurant();
        const tables = await Table.find({ restaurantId: restaurant._id }).sort({ tableNumber: 1 }).lean();
        res.json({ success: true, tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const { tableNumber, seats, status = 'available', notes = '' } = req.body;
        if (!String(tableNumber || '').trim() || !Number.isInteger(Number(seats)) || Number(seats) < 1 || !tableStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Table number and a valid seat count are required.' });
        }

        const restaurant = await getRestaurant();
        const table = await Table.create({
            restaurantId: restaurant._id,
            tableNumber: String(tableNumber).trim(),
            seats: Number(seats),
            status,
            notes: String(notes || '').trim()
        });
        res.status(201).json({ success: true, table });
    } catch (error) {
        const duplicate = error && error.code === 11000;
        res.status(duplicate ? 409 : 500).json({ success: false, message: duplicate ? 'This table number already exists.' : error.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const { tableNumber, seats, status, notes } = req.body;
        const updates = {};
        if (tableNumber !== undefined) updates.tableNumber = String(tableNumber).trim();
        if (seats !== undefined) updates.seats = Number(seats);
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = String(notes || '').trim();

        const table = await Table.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });
        res.json({ success: true, table });
    } catch (error) {
        const duplicate = error && error.code === 11000;
        res.status(duplicate ? 409 : 400).json({ success: false, message: duplicate ? 'This table number already exists.' : error.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
