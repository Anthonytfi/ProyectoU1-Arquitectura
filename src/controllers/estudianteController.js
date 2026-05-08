const Tuberia = require('../architecture/Tuberia');
const { FiltroExtraerNotas, FiltroAnalizarRendimiento } = require('../filters/estudiante/filtrosEstudiante');

const consultarRendimiento = async (req, res) => {
    try {
        const datosBusqueda = req.body; 

        const tuberiaEstudiante = new Tuberia();
        tuberiaEstudiante
            .agregarFiltro(new FiltroExtraerNotas())
            .agregarFiltro(new FiltroAnalizarRendimiento());

        const resultadoFinal = await tuberiaEstudiante.ejecutar(datosBusqueda);

        res.status(200).json({
            mensaje: "Consulta realizada con éxito",
            resultado: resultadoFinal
        });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = { consultarRendimiento };