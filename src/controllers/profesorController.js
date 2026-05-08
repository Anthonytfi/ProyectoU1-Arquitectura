const Tuberia = require('../architecture/Tuberia');
const { 
    FiltroVerificarEstudiante, 
    FiltroValidacion, 
    FiltroPromedio, 
    FiltroEstado, 
    FiltroGuardarNotasBDD 
} = require('../filters/profesor/filtrosProfesor');

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
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: "Error interno", detalles: error.message });
    }
};

module.exports = { procesarNotas };