const AdmZip = require('adm-zip');
const shapefile = require('shapefile');
const fs = require('fs');
const path = require('path');

class ShapefileProcessor {
    async extractZip(zipPath, extractPath) {
        try {
            if (!fs.existsSync(extractPath)) {
                fs.mkdirSync(extractPath, { recursive: true });
            }

            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);
            
            console.log('ZIP extracted successfully to:', extractPath);
            return extractPath;
        } catch (error) {
            throw new Error('Failed to extract ZIP: ' + error.message);
        }
    }

    async findShapefiles(directory) {
        try {
            const findFiles = (dir, fileList = { shp: null, shx: null, dbf: null, prj: null }) => {
                const files = fs.readdirSync(dir);
                
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        findFiles(fullPath, fileList);
                    } else {
                        const ext = path.extname(file).toLowerCase();
                        if (ext === '.shp' && !fileList.shp) {
                            fileList.shp = fullPath;
                        } else if (ext === '.shx' && !fileList.shx) {
                            fileList.shx = fullPath;
                        } else if (ext === '.dbf' && !fileList.dbf) {
                            fileList.dbf = fullPath;
                        } else if (ext === '.prj' && !fileList.prj) {
                            fileList.prj = fullPath;
                        }
                    }
                    
                    if (fileList.shp && fileList.shx && fileList.dbf) {
                        break;
                    }
                }
                
                return fileList;
            };
            
            const result = findFiles(directory);
            
            if (!result.shp) {
                throw new Error('Shapefile (.shp) not found in ZIP');
            }
            if (!result.dbf) {
                throw new Error('DBF file (.dbf) not found in ZIP');
            }
            
            console.log('Found shapefile components:');
            console.log('  SHP:', result.shp);
            console.log('  SHX:', result.shx || 'Not found (optional)');
            console.log('  DBF:', result.dbf);
            console.log('  PRJ:', result.prj || 'Not found (optional)');
            
            return result;
        } catch (error) {
            throw new Error('Failed to find shapefiles: ' + error.message);
        }
    }

    async convertToGeoJSON(shpPath, dbfPath) {
        try {
            const features = [];
            
            const source = await shapefile.open(shpPath, dbfPath);
            
            let result = await source.read();
            let count = 0;
            
            while (!result.done) {
                if (result.value) {
                    features.push(result.value);
                    count++;
                }
                result = await source.read();
            }
            
            console.log(`Converted ${count} features to GeoJSON`);
            
            if (count === 0) {
                throw new Error('No features found in shapefile');
            }
            
            return features;
        } catch (error) {
            throw new Error('Failed to convert shapefile: ' + error.message);
        }
    }

    cleanupFiles(directory) {
        try {
            if (fs.existsSync(directory)) {
                fs.rmSync(directory, { recursive: true, force: true });
                console.log('Cleanup completed:', directory);
            }
        } catch (error) {
            console.error('Cleanup error:', error.message);
        }
    }
}

module.exports = new ShapefileProcessor();