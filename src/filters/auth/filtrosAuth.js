const { pool } = require('../../config/db');
const bcrypt = require('bcrypt'); 

class FiltroVerificarCredenciales {
    async ejecutar(datos) {
        console.log("-> Verificando credenciales...");
        
        try {
            const { correo, password } = datos;
            
            const query = 'SELECT id, nombre, correo, rol, password FROM usuarios WHERE correo = $1';
            const result = await pool.query(query, [correo]);
            
            if (result.rows.length === 0) {
                return { 
                    ...datos, 
                    error: "Correo no registrado",
                    errorCritico: true 
                };
            }
            
            const usuario = result.rows[0];
            
            // 👈 Usar bcrypt.compare
            const passwordValida = await bcrypt.compare(password, usuario.password);
            
            if (!passwordValida) {
                return { 
                    ...datos, 
                    error: "Contraseña incorrecta",
                    errorCritico: true 
                };
            }
            
            const primerLogin = password.startsWith('temp_');
            
            return {
                ...datos,
                autenticado: true,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                },
                primerLogin
            };
            
        } catch (error) {
            console.error("Error en FiltroVerificarCredenciales:", error);
            return { ...datos, error: "Error en el servidor", errorCritico: true };
        }
    }
}

class FiltroGenerarToken {
    ejecutar(datos) {
        console.log("-> Generando token de sesión...");
        
        if (datos.error) return datos;
        
        const token = Buffer.from(JSON.stringify({
            id: datos.usuario.id,
            rol: datos.usuario.rol,
            exp: Date.now() + 24 * 60 * 60 * 1000
        })).toString('base64');
        
        return { ...datos, token };
    }
}

module.exports = { FiltroVerificarCredenciales, FiltroGenerarToken };