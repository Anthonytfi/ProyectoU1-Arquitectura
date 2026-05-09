const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

router.post('/procesar-notas', profesorController.procesarNotas);
router.post('/consultar-estudiante', profesorController.consultarEstudiante);

module.exports = router;