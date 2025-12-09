# UrbanSolv GIS Backend Service (Tugas Pre-Interview)

Backend service untuk mengelola data GIS berbasis shapefile, menggunakan Node.js, Express, PostgreSQL, dan PostGIS oleh Fadhillah Maulana.

## Teknologi yang Digunakan

- Node.js
- Express.js
- PostgreSQL + PostGIS
- Multer (file upload)
- Shapefile library (konversi shapefile)
- ADM-ZIP (extract ZIP files)

## Persyaratan Sistem

- Node.js v14 atau lebih tinggi
- PostgreSQL v12 atau lebih tinggi dengan ekstensi PostGIS
- npm atau yarn

## Setup Environment

### 1. Install PostgreSQL dan PostGIS

Pastikan PostgreSQL dan PostGIS sudah terinstall di sistem.

### 2. Setup Database

Jalankan perintah SQL berikut:

```sql
CREATE DATABASE urbansolv_gis;
\c urbansolv_gis
CREATE EXTENSION postgis;

CREATE TABLE gis_features (
    id SERIAL PRIMARY KEY,
    properties JSONB,
    geometry GEOMETRY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
atau kamu bisa set up database langsung pada bagian GUI (DBeaver/pgAdmin)

### 3. Clone Repository

```bash
git clone <https://github.com/godwimp/preinterview-urbansolv>
cd preinterview-urbansolv
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Konfigurasi Environment

Buat file `.env` di root project berdasarkan file .env.example yang sudah ada, atau juga bisa dengan me-rename `.env.example` menjadi `.env`.

Sesuaikan tiap parameter dengan konfigurasi PostgreSQL kamu.

### 6. Jalankan Server

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### 1. Upload Shapefile

Upload file ZIP yang berisi shapefile (.shp, .shx, .dbf, .prj)

**Endpoint:** `POST /api/gis/upload`

**Content-Type:** `multipart/form-data`

**Body:**
- `shapefile`: File ZIP yang berisi shapefile

**Response Success:**
```json
{
  "success": true,
  "message": "Shapefile uploaded and processed successfully",
  "data": {
    "featuresCount": 10,
    "featureIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
}
```

### 2. Get All Features

Mendapatkan semua data GIS dalam format GeoJSON FeatureCollection

**Endpoint:** `GET /api/gis/features`

**Response Success:**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": 1,
        "properties": {
          "name": "Feature 1",
          "description": "Description"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [106.8456, -6.2088]
        }
      }
    ]
  }
}
```

### 3. Update Feature Properties

Update properties dari sebuah feature

**Endpoint:** `PUT /api/gis/features/:id/properties`

**Body:**
```json
{
  "properties": {
    "name": "Updated Name",
    "description": "Updated Description",
    "customField": "Custom Value"
  }
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Properties updated successfully",
  "data": {
    "type": "Feature",
    "id": 1,
    "properties": {
      "name": "Updated Name",
      "description": "Updated Description",
      "customField": "Custom Value"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [106.8456, -6.2088]
    }
  }
}
```

### 4. Update Feature Geometry (Bonus)

Update geometry dari sebuah feature

**Endpoint:** `PUT /api/gis/features/:id/geometry`

**Body:**
```json
{
  "geometry": {
    "type": "Point",
    "coordinates": [107.6191, -6.9175]
  }
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Geometry updated successfully",
  "data": {
    "type": "Feature",
    "id": 1,
    "properties": {...},
    "geometry": {
      "type": "Point",
      "coordinates": [107.6191, -6.9175]
    }
  }
}
```

### 5. Delete Single Feature

Hapus satu feature berdasarkan ID

**Endpoint:** `DELETE /api/gis/features/:id`

**Response Success:**
```json
{
  "success": true,
  "message": "Feature deleted successfully"
}
```

### 6. Delete All Features (Bonus)

Hapus semua features dari database

**Endpoint:** `DELETE /api/gis/features`

**Response Success:**
```json
{
  "success": true,
  "message": "All features deleted successfully",
  "data": {
    "deletedCount": 10
  }
}
```

## Struktur Project

```
preinterview-urbansolv/
├── src/
│   ├── config/
│   │   └── database.js          # Konfigurasi database PostgreSQL
│   ├── controllers/
│   │   └── gisController.js     # Controller untuk handle request
│   ├── routes/
│   │   └── gisRoutes.js         # Definisi routes API
│   ├── services/
│   │   └── gisService.js        # Business logic untuk GIS operations
│   ├── utils/
│   │   └── shapefileProcessor.js # Utility untuk proses shapefile
│   └── app.js                   # Main application file
├── uploads/                     # Folder untuk temporary file uploads
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # NPM dependencies
└── README.md                    # Dokumentasi
```


## Testing dengan Postman

1. Import Postman collection yang disediakan
2. Set environment variable `base_url` ke `http://localhost:3000`
3. Test setiap endpoint sesuai dengan dokumentasi di atas

## Catatan

- Maksimal ukuran file upload: 50MB
- File upload harus dalam format ZIP
- ZIP harus berisi minimal file .shp DAN .dbf (tidak bisa salah satu)
- Semua geometry disimpan dengan SRID 4326 (WGS84)
- Response format GeoJSON kompatibel dengan semua map library modern

## Troubleshooting

### Error: "Failed to connect to database"
- Pastikan PostgreSQL sudah running
- Check kredensial database di file .env
- Pastikan database sudah dibuat

### Error: "PostGIS extension not found"
- Jalankan `CREATE EXTENSION postgis;` di interface database PostgreSQL kamu.

### Error: "Required shapefile components not found"
- Pastikan ZIP file berisi .shp DAN .dbf
- Check struktur folder dalam ZIP file
