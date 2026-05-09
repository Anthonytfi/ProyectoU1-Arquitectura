const { pool } = require('../../config/db');

// Filtro 1: Verifica que el estudiante exista y tenga rol ESTUDIANTE
class FiltroVerificarEstudiante {
    async ejecutar(datos) {
        console.log("-> Verificando ID de estudiante...");
        const resultados = await Promise.all(datos.map(async (est) => {
            if (est.error) return est;
            try {
                const query = 'SELECT nombre, rol FROM usuarios WHERE id = $1';
                const resBDD = await pool.query(query, [est.idUsuario]);

                if (resBDD.rows.length === 0) {
                    return { ...est, error: `El ID ${est.idUsuario} no existe` };
                }
                if (resBDD.rows[0].rol !== 'ESTUDIANTE') {
                    return { ...est, error: `El ID ${est.idUsuario} (${resBDD.rows[0].nombre}) no es estudiante` };
                }
                
                return { ...est, nombreReal: resBDD.rows[0].nombre };
            } catch (error) {
                return { ...est, error: "Error de conexión" };
            }
        }));
        return resultados;
    }
}

// Filtro 2: Valida que las tres notas estén entre 0 y 10
class FiltroValidacion {
    ejecutar(datos) {
        console.log("-> Validando notas...");
        const resultados = datos.map((est) => {
            if (est.error) return est;
            
            const { nota1, nota2, nota3 } = est;
            
            // Validar que todas las notas existan
            if (nota1 === undefined || nota2 === undefined || nota3 === undefined) {
                return { ...est, error: "Falta una o más notas (nota1, nota2, nota3)" };
            }
            
            // Validar rango 0-10
            if (nota1 < 0 || nota1 > 10) {
                return { ...est, error: `nota1 debe estar entre 0 y 10, recibió: ${nota1}` };
            }
            if (nota2 < 0 || nota2 > 10) {
                return { ...est, error: `nota2 debe estar entre 0 y 10, recibió: ${nota2}` };
            }
            if (nota3 < 0 || nota3 > 10) {
                return { ...est, error: `nota3 debe estar entre 0 y 10, recibió: ${nota3}` };
            }
            
            return { ...est, notasValidas: true };
        });
        
        return resultados;
    }
}

// Filtro 3: Calcula el promedio de los 3 parciales
class FiltroPromedio {
    ejecutar(datos) {
        console.log("-> Calculando promedios...");
        const resultados = datos.map((est) => {
            if (est.error) return est;
            
            const { nota1, nota2, nota3 } = est;
            const promedio = (nota1 + nota2 + nota3) / 3;
            
            return { ...est, promedio: parseFloat(promedio.toFixed(2)) };
        });
        
        return resultados;
    }
}

// Filtro 4: Define el estado (Aprobado/Reprobado) basado en el promedio
class FiltroEstado {
    ejecutar(datos) {
        console.log("-> Determinando estado...");
        const resultados = datos.map((est) => {
            if (est.error) return est;
            
            const { promedio } = est;
            const estado = promedio >= 6 ? 'Aprobado' : 'Reprobado';
            
            return { ...est, estado };
        });
        
        return resultados;
    }
}

// Filtro 5: Guarda las notas en la base de datos
class FiltroGuardarNotasBDD {
    async ejecutar(datos) {
        console.log("-> Guardando notas en base de datos...");
        const resultados = await Promise.all(datos.map(async (est) => {
            if (est.error) return est;
            
            try {
                const { idUsuario, materia, nota1, nota2, nota3, promedio, estado } = est;
                
                const query = `
                    INSERT INTO notas (usuario_id, materia, nota1, nota2, nota3, promedio, estado)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id, usuario_id, materia, promedio, estado
                `;
                
                const result = await pool.query(query, [
                    idUsuario,
                    materia,
                    nota1,
                    nota2,
                    nota3,
                    promedio,
                    estado
                ]);
                
                if (result.rows.length === 0) {
                    return { ...est, error: "No se pudo guardar el registro" };
                }
                
                return {
                    ...est,
                    guardado: true,
                    registro: result.rows[0],
                    mensaje: `Notas guardadas exitosamente para ${est.nombreReal}`
                };
                
            } catch (error) {
                console.error("Error al guardar en BDD:", error.message);
                
                // Verificar si es error de FK (usuario_id no existe)
                if (error.code === '23503') {
                    return { 
                        ...est, 
                        error: `El usuario_id ${est.idUsuario} no existe en la tabla usuarios`,
                        errorCritico: true 
                    };
                }
                
                return { 
                    ...est, 
                    error: `Error de base de datos: ${error.message}`,
                    errorCritico: true 
                };
            }
        }));
        
        return resultados;
    }
}

module.exports = { 
    FiltroVerificarEstudiante, 
    FiltroValidacion, 
    FiltroPromedio, 
    FiltroEstado, 
    FiltroGuardarNotasBDD
};
