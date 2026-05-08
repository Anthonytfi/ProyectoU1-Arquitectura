const express = require('express');
const router = express.Router();

const profesorController = require('../controllers/profesorController');

router.post('/procesar-notas', profesorController.procesarNotas);

module.exports = router;