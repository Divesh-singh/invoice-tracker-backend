const express = require('express');
const router = express.Router();
const { billController } = require('../controllers/billController');
const authenticationMiddleware = require('../middleware/authentication');
const authorize = require('../middleware/authorization');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.split(' ').join('_')); // append timestamp to the original filename snake cased
    }
});

const upload = multer({ storage: storage });

// Get all bills (protected, admin only)
router.get('/', authenticationMiddleware, authorize(2), billController.getAllBills);

// Adding bill report here as its not a seprate entity yet
router.get('/report', authenticationMiddleware, authorize(2), billController.getBillReport);

// Get single bill by id (with payments)
router.get('/:id', authenticationMiddleware, authorize(2), billController.getBillById);

// Create bill 
router.post('/', authenticationMiddleware, upload.single('image'), billController.createBill);

// // Update bill (protected, admin only)
router.put('/:id/payment', authenticationMiddleware, authorize(2), upload.single('image'), billController.updateBill);


module.exports = router;
