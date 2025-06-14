const express = require('express');
const { getAllCars, getCarsById, createCar, updateCarStatus, deleteCarById, getSearchCars, getOwnCars } = require('../controllers/car.controller');
const multer = require('multer');
const authorization = require('../middlewares/Authorization');
const router = express.Router();

const maxSize = 50 * 1024 * 1024;
const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limits: { fileSize: maxSize } });

router.get('/', authorization(['GUEST', 'USER', 'OWNER', 'ADMIN']), getAllCars);
router.get('/search', authorization(['GUEST', 'USER', 'OWNER', 'ADMIN']), getSearchCars);
router.get('/:id', authorization(['GUEST', 'USER', 'OWNER', 'ADMIN']), getCarsById);
router.post('/', authorization(['OWNER', 'ADMIN']), upload.array('car_image'), createCar);
router.put('/', authorization(['OWNER', 'ADMIN']), updateCarStatus);
router.delete('/:id', authorization(['OWNER', 'ADMIN']), deleteCarById);
router.get('/owner/cars', authorization(['OWNER']), getOwnCars);

module.exports = router;