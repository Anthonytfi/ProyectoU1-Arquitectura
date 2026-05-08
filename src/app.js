const express = require('express');
const cors = require('cors');

const profesorRoutes = require('./routes/profesorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');


const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use('/api/profesor', profesorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/estudiante', estudianteRoutes);

module.exports = app;