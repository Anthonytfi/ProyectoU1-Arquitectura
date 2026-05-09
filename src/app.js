const express = require('express');
const cors = require('cors');

const profesorRoutes = require('./routes/profesorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const estudianteRoutes = require('./routes/estudianteRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json()); 

app.use('/api/profesor', profesorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/estudiante', estudianteRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;