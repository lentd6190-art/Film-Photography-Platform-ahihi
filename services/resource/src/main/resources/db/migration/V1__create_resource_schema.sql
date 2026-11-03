-- FPP-57: Resource database schema
-- External Identity IDs are UUIDs without cross-database foreign keys.
-- package_resources.resource_id is polymorphic; existence is validated by the application.

CREATE TABLE creative_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    capacity INTEGER NOT NULL,
    area_sqm NUMERIC(10, 2),
    hourly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_creative_spaces_capacity CHECK (capacity > 0),
    CONSTRAINT ck_creative_spaces_area CHECK (area_sqm IS NULL OR area_sqm > 0),
    CONSTRAINT ck_creative_spaces_latitude CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_creative_spaces_longitude CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CONSTRAINT ck_creative_spaces_hourly_price CHECK (hourly_price >= 0)
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    equipment_condition VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    rental_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_equipment_rental_price CHECK (rental_price >= 0),
    CONSTRAINT ck_equipment_condition CHECK (
        equipment_condition IN ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED')
    ),
    CONSTRAINT ck_equipment_status CHECK (
        status IN ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE')
    )
);

CREATE TABLE consumables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'unit',
    expiry_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_consumables_stock CHECK (stock_quantity >= 0),
    CONSTRAINT ck_consumables_reorder CHECK (reorder_level >= 0),
    CONSTRAINT ck_consumables_unit_price CHECK (unit_price >= 0)
);

CREATE TABLE resource_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_space_id UUID REFERENCES creative_spaces(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_resource_availability_one_resource CHECK (
        (creative_space_id IS NOT NULL AND equipment_id IS NULL)
        OR
        (creative_space_id IS NULL AND equipment_id IS NOT NULL)
    ),
    CONSTRAINT ck_resource_availability_time CHECK (end_time > start_time)
);

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_maintenance_cost CHECK (cost >= 0),
    CONSTRAINT ck_maintenance_completion CHECK (
        completed_at IS NULL OR completed_at >= scheduled_at
    )
);

CREATE TABLE service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_service_packages_price CHECK (base_price >= 0),
    CONSTRAINT ck_service_packages_duration CHECK (duration_minutes > 0)
);

CREATE TABLE package_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
    resource_type VARCHAR(30) NOT NULL,
    resource_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_package_resources_type CHECK (
        resource_type IN ('CREATIVE_SPACE', 'EQUIPMENT', 'CONSUMABLE')
    ),
    CONSTRAINT ck_package_resources_quantity CHECK (quantity > 0),
    CONSTRAINT uq_package_resources_identity UNIQUE (package_id, resource_type, resource_id)
);

CREATE INDEX idx_creative_spaces_provider_status
    ON creative_spaces(provider_id, status);

CREATE INDEX idx_creative_spaces_location
    ON creative_spaces(latitude, longitude);

CREATE INDEX idx_equipment_provider_status
    ON equipment(provider_id, status);

CREATE INDEX idx_consumables_provider_status_expiry
    ON consumables(provider_id, status, expiry_date);

CREATE INDEX idx_resource_availability_space_time
    ON resource_availability(creative_space_id, start_time, end_time);

CREATE INDEX idx_resource_availability_equipment_time
    ON resource_availability(equipment_id, start_time, end_time);

CREATE INDEX idx_maintenance_equipment_schedule
    ON maintenance_records(equipment_id, scheduled_at);

CREATE INDEX idx_service_packages_provider_status
    ON service_packages(provider_id, status);

CREATE INDEX idx_package_resources_resource
    ON package_resources(resource_type, resource_id);
