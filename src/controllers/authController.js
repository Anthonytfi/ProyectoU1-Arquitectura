const Tuberia = require('../architecture/Tuberia');
const { FiltroVerificarCredenciales, FiltroGenerarToken } = require('../filters/auth/filtrosAuth');

const login = async (req, res) => {
    try {
        const credenciales = req.body;
        const tuberiaAuth = new Tuberia();

        tuberiaAuth
            .agregarFiltro(new FiltroVerificarCredenciales())
            .agregarFiltro(new FiltroGenerarToken());

        const resultado = await tuberiaAuth.ejecutar(credenciales);

        if (resultado.error) {
            return res.status(401).json({ success: false, error: resultado.error });
        }

        res.status(200).json({
            success: true,
            usuario: resultado.usuario,
            token: resultado.token,
            primerLogin: resultado.primerLogin
        });
        
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
};
const { 
    FiltroValidarUsuarioExistente,
    FiltroValidarPasswordActual,
    FiltroValidarNuevaPassword,
    FiltroActualizarPassword
} = require('../filters/auth/filtrosCambioPassword');

const cambiarPassword = async (req, res) => {
    try {
        const datos = req.body;
        const tuberiaCambio = new Tuberia();

        tuberiaCambio
            .agregarFiltro(new FiltroValidarUsuarioExistente())
            .agregarFiltro(new FiltroValidarPasswordActual())
            .agregarFiltro(new FiltroValidarNuevaPassword())
            .agregarFiltro(new FiltroActualizarPassword());

        const resultado = await tuberiaCambio.ejecutar(datos);

        if (resultado.error) {
            return res.status(400).json({ success: false, error: resultado.error });
        }

        res.status(200).json({
            success: true,
            message: resultado.mensaje
        });
        
    } catch (error) {
        console.error("Error en cambiarPassword:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
};

module.exports = { login, cambiarPassword };