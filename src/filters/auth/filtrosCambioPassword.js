const { pool } = require('../../config/db');

class FiltroValidarUsuarioExistente {
    async ejecutar(datos) {
        console.log("-> Validando existencia del usuario...");
        
        try {
            const { idUsuario } = datos;
            
            const query = 'SELECT id, nombre, password FROM usuarios WHERE id = $1';
            const result = await pool.query(query, [idUsuario]);
            
            if (result.rows.length === 0) {
                return { 
                    ...datos, 
                    error: "Usuario no encontrado",
                    errorCritico: true 
                };
            }
            
            return {
                ...datos,
                usuarioExistente: true,
                passwordActualBDD: result.rows[0].password
            };
            
        } catch (error) {
            return { ...datos, error: "Error en el servidor", errorCritico: true };
        }
    }
}

class FiltroValidarPasswordActual {
    ejecutar(datos) {
        console.log("-> Validando contraseña actual...");
        
        if (datos.error) return datos;
        
        const { password_actual, passwordActualBDD } = datos;
        
        if (password_actual !== passwordActualBDD) {
            return { 
                ...datos, 
                error: "Contraseña actual incorrecta",
                errorCritico: true 
            };
        }
        
        return datos;
    }
}

class FiltroValidarNuevaPassword {
    ejecutar(datos) {
        console.log("-> Validando nueva contraseña...");
        
        if (datos.error) return datos;
        
        const { password_nueva } = datos;

        if (password_nueva.length < 8) {
            return { ...datos, error: "La contraseña debe tener al menos 8 caracteres", errorCritico: true };
        }
        
        if (!/[A-Z]/.test(password_nueva)) {
            return { ...datos, error: "La contraseña debe tener al menos una mayúscula", errorCritico: true };
        }
        
        if (!/[0-9]/.test(password_nueva)) {
            return { ...datos, error: "La contraseña debe tener al menos un número", errorCritico: true };
        }
        
        if (!/[!@#$%^&*]/.test(password_nueva)) {
            return { ...datos, error: "La contraseña debe tener al menos un carácter especial (!@#$%^&*)", errorCritico: true };
        }
        
        if (password_nueva === datos.password_actual) {
            return { ...datos, error: "La nueva contraseña debe ser diferente a la actual", errorCritico: true };
        }
        
        return datos;
    }
}

class FiltroActualizarPassword {
    async ejecutar(datos) {
        console.log("-> Actualizando contraseña en base de datos...");
        
        if (datos.error) return datos;
        
        try {
            const { idUsuario, password_nueva } = datos;
            
            const query = 'UPDATE usuarios SET password = $1 WHERE id = $2 RETURNING id';
            const result = await pool.query(query, [password_nueva, idUsuario]);
            
            if (result.rows.length === 0) {
                return { ...datos, error: "Error al actualizar contraseña", errorCritico: true };
            }
            
            return {
                ...datos,
                actualizado: true,
                mensaje: "Contraseña actualizada correctamente"
            };
            
        } catch (error) {
            return { ...datos, error: "Error en el servidor", errorCritico: true };
        }
    }
}

module.exports = {
    FiltroValidarUsuarioExistente,
    FiltroValidarPasswordActual,
    FiltroValidarNuevaPassword,
    FiltroActualizarPassword
};