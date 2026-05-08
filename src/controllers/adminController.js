// src/controllers/adminController.js
const Tuberia = require('../architecture/Tuberia');
const { FiltroLimpieza, FiltroValidacionExistencia, FiltroGenerarPassword, FiltroGuardarUsuarioBDD } = require('../filters/admin/filtrosAdmin');

const procesarUsuarios = async (req, res) => {
    try {
        const datosUsuarios = req.body.usuarios;
        const tuberiaAdmin = new Tuberia();

        tuberiaAdmin
            .agregarFiltro(new FiltroLimpieza())
            .agregarFiltro(new FiltroValidacionExistencia())
            .agregarFiltro(new FiltroGenerarPassword())
            .agregarFiltro(new FiltroGuardarUsuarioBDD());

        const resultadoFinal = await tuberiaAdmin.ejecutar(datosUsuarios);
        res.status(200).json({ mensaje: "Proceso completado", resultados: resultadoFinal });
    } catch (error) {
        console.error("Error en Controlador Admin:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

module.exports = { procesarUsuarios };