const { pool } = require('../../config/db');

// Filtro 1: Extrae notas reales de la tabla 'notas' en PostgreSQL
class FiltroExtraerNotas {
    async ejecutar(datos) {
        console.log(`-> Buscando notas en BDD para: ${datos.nombreEstudiante}...`);
        
        try {
            const query = `
                SELECT u.nombre, n.materia, n.nota1, n.nota2, n.nota3, n.promedio, n.estado 
                FROM notas n
                JOIN usuarios u ON n.usuario_id = u.id
                WHERE u.id = $1`;
            const resBDD = await pool.query(query, [datos.idUsuario]);

            if (resBDD.rows.length === 0) {
                return { ...datos, error: "No se encontró historial académico para este estudiante." };
            }

            return { ...datos, historial: resBDD.rows };
            
        } catch (error) {
            console.error("Error SQL:", error.message);
            return { ...datos, error: "Error de conexión con la base de datos." };
        }
    }
}

// Filtro 2: Analiza el historial recuperado
class FiltroAnalizarRendimiento {
    ejecutar(datos) {
        console.log("-> Analizando rendimiento académico...");
        if (datos.error) return datos;

        const notas = datos.historial;
        const sumaPromedios = notas.reduce((acc, curr) => acc + parseFloat(curr.promedio), 0);
        const promedioGeneral = sumaPromedios / notas.length;

        let recomendacion = promedioGeneral >= 7 
            ? "Felicidades, tu rendimiento es satisfactorio." 
            : "Atención: Tu promedio general es bajo. Sugerimos tutorías.";

        return {
            ...datos,
            promedioGeneral: promedioGeneral.toFixed(2),
            totalMaterias: notas.length,
            recomendacion
        };
    }
}

module.exports = { FiltroExtraerNotas, FiltroAnalizarRendimiento };