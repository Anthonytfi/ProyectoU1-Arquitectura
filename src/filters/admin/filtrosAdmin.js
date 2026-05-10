const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

class FiltroLimpieza {
    ejecutar(datos) {
        console.log("-> Limpiando datos de usuario...");
        return datos.map(u => ({
            nombre: u.nombre.trim().toUpperCase(),
            correo: u.correo.trim().toLowerCase(),
            rol: u.rol ? u.rol.trim().toUpperCase() : 'ESTUDIANTE' 
        }));
    }
}

class FiltroValidacionExistencia {
    async ejecutar(datos) {
        console.log("-> Verificando si el correo ya existe...");
        const resultados = await Promise.all(datos.map(async (u) => {
            const res = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [u.correo]);
            if (res.rows.length > 0) {
                return { ...u, error: "El correo ya está registrado" };
            }
            return u;
        }));
        return resultados;
    }
}

class FiltroGenerarPassword {
    async ejecutar(datos) {
        console.log("-> Generando y cifrando contraseñas...");
        const saltRounds = 10; 

        return await Promise.all(datos.map(async (u) => {
            if (u.error) return u;

            const passwordTemporal = `temp_${u.nombre.split(' ')[0]}123`;
            
            const hash = await bcrypt.hash(passwordTemporal, saltRounds);

            return { ...u, password: hash, passwordPlana: passwordTemporal }; 
        }));
    }
}

class FiltroGuardarUsuarioBDD {
    async ejecutar(datos) {
        console.log("-> Guardando usuarios en PostgreSQL...");
        const resultados = await Promise.all(datos.map(async (u) => {
            if (u.error) return u;
            try {
                const query = 'INSERT INTO usuarios (nombre, correo, rol, password) VALUES ($1, $2, $3, $4) RETURNING id';
                const valores = [u.nombre, u.correo, u.rol, u.password];
                const res = await pool.query(query, valores);
                return { ...u, id: res.rows[0].id, db: "Insertado" };
            } catch (err) {
                console.error("ERROR SQL:", err.message);
                return { ...u, error: "Error al insertar en BDD" };
            }
        }));
        return resultados;
    }
}

module.exports = { FiltroLimpieza, FiltroValidacionExistencia, FiltroGenerarPassword, FiltroGuardarUsuarioBDD };