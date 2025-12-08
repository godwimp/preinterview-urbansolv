const path = require('path');
const fs = require('fs');
const shapefileProcessor = require('../utils/shapefileProcessor');
const gisService = require('../services/gisService');

class GISController {
    async uploadShapefile(req, res) {
        let extractPath;
        let zipPath;
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            zipPath = req.file.path;
            extractPath = path.join('uploads', 'extracted_' + Date.now());

            console.log('Processing ZIP file:', zipPath);

            await shapefileProcessor.extractZip(zipPath, extractPath);
            
            const shapefiles = await shapefileProcessor.findShapefiles(extractPath);
            
            const features = await shapefileProcessor.convertToGeoJSON(
                shapefiles.shp,
                shapefiles.dbf
            );

            if (features.length === 0) {
                throw new Error('No features found in shapefile');
            }

            const insertedIds = await gisService.saveFeatures(features);

            // Cleanup
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }
            shapefileProcessor.cleanupFiles(extractPath);

            res.status(201).json({
                success: true,
                message: 'Shapefile uploaded and processed successfully',
                data: {
                    featuresCount: insertedIds.length,
                    featureIds: insertedIds
                }
            });

        } catch (error) {
            // Cleanup on error
            if (zipPath && fs.existsSync(zipPath)) {
                try {
                    fs.unlinkSync(zipPath);
                } catch (e) {
                    console.error('Failed to delete zip file:', e.message);
                }
            }
            if (extractPath) {
                shapefileProcessor.cleanupFiles(extractPath);
            }
            
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllFeatures(req, res) {
        try {
            const featureCollection = await gisService.getAllFeatures();

            res.status(200).json({
                success: true,
                data: featureCollection
            });

        } catch (error) {
            console.error('Get features error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateProperties(req, res) {
        try {
            const { id } = req.params;
            const { properties } = req.body;

            if (!properties) {
                return res.status(400).json({
                    success: false,
                    message: 'Properties object is required'
                });
            }

            const updatedFeature = await gisService.updateFeatureProperties(
                parseInt(id),
                properties
            );

            if (!updatedFeature) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Properties updated successfully',
                data: updatedFeature
            });

        } catch (error) {
            console.error('Update properties error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateGeometry(req, res) {
        try {
            const { id } = req.params;
            const { geometry } = req.body;

            if (!geometry) {
                return res.status(400).json({
                    success: false,
                    message: 'Geometry object is required'
                });
            }

            const updatedFeature = await gisService.updateFeatureGeometry(
                parseInt(id),
                geometry
            );

            if (!updatedFeature) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Geometry updated successfully',
                data: updatedFeature
            });

        } catch (error) {
            console.error('Update geometry error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteFeature(req, res) {
        try {
            const { id } = req.params;

            const deleted = await gisService.deleteFeature(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Feature not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Feature deleted successfully'
            });

        } catch (error) {
            console.error('Delete feature error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteAllFeatures(req, res) {
        try {
            const deletedCount = await gisService.deleteAllFeatures();

            res.status(200).json({
                success: true,
                message: 'All features deleted successfully',
                data: {
                    deletedCount
                }
            });

        } catch (error) {
            console.error('Delete all features error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new GISController();