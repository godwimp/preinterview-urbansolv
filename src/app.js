const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gisRoutes = require('./routes/gisRoutes');
const { updateProperties } = require('./controllers/gisController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => { 
    res.json({
        message: 'Pre-Interview Urbansolv GIS Backend API',
        version: '1.0.0',
        endpoints: {
            upload: 'POST /api/gis/upload',
            getAll: 'GET /api/gis/features',
            updateProperties: 'PUT /api/gis/features/:id/properties',
            updateGeometry: 'PUT /api/gis/features/:id/geometry',
            deleteOne: 'DELETE /api/gis/features/:id',
            deleteAll: 'DELETE /api/gis/features'
        }
    });
});

app.use('/api/gis', gisRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
});