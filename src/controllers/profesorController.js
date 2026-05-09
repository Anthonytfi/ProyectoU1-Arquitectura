const Tuberia = require('../architecture/Tuberia');
const { pool } = require('../config/db'); 
const { 
    FiltroVerificarEstudiante, 
    FiltroValidacion, 
    FiltroPromedio, 
    FiltroEstado, 
    FiltroGuardarNotasBDD
} = require('../filters/profesor/filtrosProfesor');

// 1. Lógica para GUARDAR notas 
const procesarNotas = async (req, res) => {
    try {
        const datosEstudiantes = req.body.estudiantes;
        const tuberiaProfesor = new Tuberia();

        tuberiaProfesor
            .agregarFiltro(new FiltroVerificarEstudiante()) 
            .agregarFiltro(new FiltroValidacion())          
            .agregarFiltro(new FiltroPromedio())           
            .agregarFiltro(new FiltroEstado())             
            .agregarFiltro(new FiltroGuardarNotasBDD());    

        const resultadoFinal = await tuberiaProfesor.ejecutar(datosEstudiantes);

        res.status(200).json({ mensaje: "Notas procesadas", resultados: resultadoFinal });
    } catch (error) {
        console.error("Error en procesarNotas:", error.message);
        res.status(500).json({ error: "Error interno", detalles: error.message });
    }
};

const consultarEstudiante = async (req, res) => {
    try {
        const { idUsuario } = req.body;

        if (!idUsuario) {
            return res.status(400).json({ error: "Falta el idUsuario en la petición" });
        }

        const query = `
            SELECT u.nombre, u.correo, n.materia, n.nota1, n.nota2, n.nota3, n.promedio, n.estado
            FROM usuarios u
            LEFT JOIN notas n ON u.id = n.usuario_id
            WHERE u.id = $1 AND u.rol = 'ESTUDIANTE'
        `;

        const resultado = await pool.query(query, [idUsuario]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: "No se encontró un estudiante con ese ID" });
        }

        const reporte = {
            nombre: resultado.rows[0].nombre,
            correo: resultado.rows[0].correo,
            historial: resultado.rows[0].materia ? resultado.rows.map(row => ({
                materia: row.materia,
                nota1: row.nota1,
                nota2: row.nota2,
                nota3: row.nota3,
                promedio: row.promedio,
                estado: row.estado
            })) : [] 
        };

        res.status(200).json(reporte);

    } catch (error) {
        console.error("Error en consultarEstudiante:", error.message);
        res.status(500).json({ error: "Error al obtener los datos del estudiante" });
    }
};


module.exports = { 
    procesarNotas, 
    consultarEstudiante
};