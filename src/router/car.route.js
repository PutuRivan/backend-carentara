const express = require('express');
const { getCars, getCarsById, createCar, updateCarById, deleteCarById } = require('../controllers/car.controller');
const router = express.Router();


router.get('/', getCars);
router.get('/:id', getCarsById);
router.post('/', createCar);
router.put('/:id', updateCarById);
router.delete('/:id', deleteCarById);

module.exports = router;