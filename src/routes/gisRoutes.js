const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const gisController = require('../controllers/gisController');

const router = express.Router();

if (!fs.existsSync('uploads')){ 
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'shapefile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        path.extname(file.originalname).toLowerCase() === '.zip') {
            cb(null, true);
    } else { 
        cb(new Error('Only ZIP files are allowed'), false);
    }
};

const upload = multer({
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        filesize: 50 * 1024 * 1024
    }
});

router.post('/upload', upload.single('shapefile'), gisController.uploadShapefile);

router.get('/features', gisController.getAllFeatures);

router.put('/features/:id/properties', gisController.updateProperties);

router.put('/features/:id/geometry', gisController.updateGeometry);

router.delete('/features/:id', gisController.deleteFeature);

router.delete('/features', gisController.deleteAllFeatures);

module.exports = router;