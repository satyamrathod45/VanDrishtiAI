-- ==========================================================================
-- VanDrishti AI — SQLite Relational & Vector Database Schema
-- ==========================================================================

PRAGMA foreign_keys = ON;

-- 1. Tiger Master Catalogue
CREATE TABLE IF NOT EXISTS tigers (
    tiger_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    sex TEXT CHECK(sex IN ('Male', 'Female', 'Unknown')) DEFAULT 'Unknown',
    age_class TEXT CHECK(age_class IN ('Cub', 'Sub-adult', 'Adult', 'Old')) DEFAULT 'Adult',
    status TEXT CHECK(status IN ('active', 'missing', 'deceased')) DEFAULT 'active',
    primary_zone TEXT NOT NULL,
    profile_image TEXT DEFAULT '',
    distinctive_marks TEXT DEFAULT '',
    total_sightings INTEGER DEFAULT 0,
    first_seen DATETIME NOT NULL,
    last_seen DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Camera Stations
CREATE TABLE IF NOT EXISTS cameras (
    camera_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone TEXT CHECK(zone IN ('Core', 'Buffer', 'Corridor')) NOT NULL,
    range TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT CHECK(status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    last_active DATETIME NOT NULL,
    total_photos INTEGER DEFAULT 0
);

-- 3. Tiger Embeddings & Sightings Layer (Vector Store)
CREATE TABLE IF NOT EXISTS tiger_embeddings (
    id TEXT PRIMARY KEY,
    tiger_id TEXT NOT NULL,
    crop_path TEXT NOT NULL,
    source_image TEXT NOT NULL,
    camera_id TEXT NOT NULL,
    station_name TEXT NOT NULL,
    zone TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timestamp DATETIME NOT NULL,
    reid_confidence REAL NOT NULL,
    review_status TEXT CHECK(review_status IN ('verified', 'pending_review', 'rejected')) DEFAULT 'pending_review',
    verified_by TEXT,
    vector BLOB NOT NULL, -- 2048-dim Float32Array (8,192 bytes)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tiger_id) REFERENCES tigers(tiger_id) ON DELETE CASCADE,
    FOREIGN KEY (camera_id) REFERENCES cameras(camera_id)
);

-- 4. Spatial & Movement Alerts
CREATE TABLE IF NOT EXISTS alerts (
    alert_id TEXT PRIMARY KEY,
    tiger_id TEXT NOT NULL,
    sighting_id TEXT NOT NULL,
    alert_type TEXT CHECK(alert_type IN ('territory_shift', 'corridor_crossing', 'long_absence', 'unknown_cluster')) NOT NULL,
    severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'info')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_crop_path TEXT DEFAULT '',
    timestamp DATETIME NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tiger_id) REFERENCES tigers(tiger_id) ON DELETE CASCADE,
    FOREIGN KEY (sighting_id) REFERENCES tiger_embeddings(id) ON DELETE CASCADE
);

-- Indexes for sub-millisecond query performance
CREATE INDEX IF NOT EXISTS idx_embeddings_tiger_id ON tiger_embeddings(tiger_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_camera_id ON tiger_embeddings(camera_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_timestamp ON tiger_embeddings(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_tiger_id ON alerts(tiger_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);
