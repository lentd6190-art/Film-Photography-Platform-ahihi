ALTER TABLE creative_spaces
    ADD COLUMN space_type VARCHAR(20),
    ADD COLUMN dimensions VARCHAR(100),
    ADD COLUMN artistic_style VARCHAR(150),
    ADD COLUMN lighting TEXT,
    ADD COLUMN ventilation TEXT,
    ADD COLUMN acoustics TEXT,
    ADD COLUMN amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN operating_hours JSONB,
    ADD COLUMN policies TEXT,
    ADD COLUMN images JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE';

ALTER TABLE creative_spaces
    ADD CONSTRAINT chk_creative_spaces_type
        CHECK (space_type IS NULL OR space_type IN ('DARKROOM', 'STUDIO')),
    ADD CONSTRAINT chk_creative_spaces_availability
        CHECK (availability_status IN ('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'));