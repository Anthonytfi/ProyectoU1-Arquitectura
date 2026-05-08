require('./src/config/db.js');

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor backend encendido y escuchando en el puerto ${PORT}`);
    console.log(`Ruta del profesor: http://localhost:${PORT}/api/profesor/procesar-notas`);
});