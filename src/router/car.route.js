const express = require('express');
const { getCars, getCarsById, createCar, updateCarById, deleteCarById } = require('../controllers/car.controller');
const multer = require('multer');
const authorization = require('../middlewares/Authorization');
const router = express.Router();

const maxSize = 50 * 1024 * 1024;
const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limits: { fileSize: maxSize } });

router.get('/', getCars);
router.get('/:id', getCarsById);
router.post('/', authorization(['OWNER', 'ADMIN']), upload.array('car_image'), createCar);
router.put('/:id', updateCarById);
router.delete('/:id', deleteCarById);

module.exports = router;