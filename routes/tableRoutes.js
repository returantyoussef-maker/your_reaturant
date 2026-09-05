const express = require('express');
const router = express.Router();
const { getAvailableTables, getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, staffOrAdminOnly } = require('../middleware/authMiddleware');

router.get('/available', getAvailableTables);
router.get('/', protect, staffOrAdminOnly, getTables);
router.post('/', protect, staffOrAdminOnly, createTable);
router.put('/:id', protect, staffOrAdminOnly, updateTable);
router.delete('/:id', protect, staffOrAdminOnly, deleteTable);

module.exports = router;
