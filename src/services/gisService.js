const pool = require('../config/database');

class GISService { 
    async saveFeatures(features) { 
        const client = await pool.connect();
        try { 
            await client.query('BEGIN');
            const insertedIds = [];

            for (const feature of features) { 
                const properties = feature.properties || {};
                const geometry = JSON.stringify(feature.geometry);

                const query = `
                    INSERT INTO gis_features (properties, geometry)
                    VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
                    RETURNING id
                `;

                const result = await client.query(query, [properties, geometry]);
                insertedIds.push(result.rows[0].id);
            }

            await client.query('COMMIT');
            console.log(`Saved ${insertedIds.length} features to database`);
            return insertedIds;
        } catch (error) { 
            await client.query('ROLLBACK');
            throw new Error('Failed to save features: ' + error.message);
        } finally {
            client.release();
        }
    }

    async getAllFeatures() { 
        try {
            const query = `
                SELECT 
                    id,
                    properties,
                    ST_AsGeoJSON(geometry)::json as geometry
                FROM gis_features
                ORDER BY id
            `;

            const result = await pool.query(query);
            
            const featureCollection = {
                type: 'FeatureCollection',
                features: result.rows.map(row => ({
                    type: 'Feature',
                    id: row.id,
                    properties: row.properties,
                    geometry: row.geometry
                }))
            };

            return featureCollection;
        } catch (error) { 
            throw new Error('Failed to retrieve features: ' + error.message);
        }
    }

    async updateFeatureProperties(id, properties) { 
        try { 
            const query = `
                UPDATE gis_features
                SET properties = $1
                WHERE id = $2
                RETURNING id, properties, ST_AsGeoJSON(geometry)::json as geometry
            `;

            const result = await pool.query(query, [properties, id]);

            if (result.rows.length === 0) { 
                return null;
            }

            return { 
                type: 'Feature',
                id: result.rows[0].id,
                properties: result.rows[0].properties,
                geometry: result.rows[0].geometry
            };
        } catch (error) { 
            throw new Error('Failed to update properties: ' + error.message);
        }
    }

    async updateFeatureGeometry(id, geometry) {
        try {
            const geometryJSON = JSON.stringify(geometry);
            
            const query = `
                UPDATE gis_features
                SET geometry = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
                WHERE id = $2
                RETURNING id, properties, ST_AsGeoJSON(geometry)::json as geometry
            `;
            
            const result = await pool.query(query, [geometryJSON, id]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return {
                type: 'Feature',
                id: result.rows[0].id,
                properties: result.rows[0].properties,
                geometry: result.rows[0].geometry
            };
        } catch (error) {
            throw new Error('Failed to update geometry: ' + error.message);
        }
    }

    async deleteFeature(id) { 
        try { 
            const query = 'DELETE FROM gis_features WHERE id = $1 RETURNING id';
            const result = await pool.query(query, [id]);

            return result.rows.length > 0;
        } catch (error) { 
            throw new Error('Failed to delete feature: ' + error.message);
        }
    }

    async deleteAllFeatures() {
        try {
            const query = 'DELETE FROM gis_features RETURNING id';
            const result = await pool.query(query);
            
            return result.rows.length;
        } catch (error) {
            throw new Error('Failed to delete all features: ' + error.message);
        }
    }
}

module.exports = new GISService();