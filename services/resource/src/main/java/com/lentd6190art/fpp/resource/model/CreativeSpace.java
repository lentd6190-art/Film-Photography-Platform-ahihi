package com.lentd6190art.fpp.resource.model;

import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "creative_spaces")
public class CreativeSpace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider_id", nullable = false)
    private UUID providerId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "area_sqm", precision = 10, scale = 2)
    private BigDecimal areaSqm;

    @Column(name = "hourly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal hourlyPrice;

    @Column(nullable = false, length = 30)
    private String status;

    @Enumerated(EnumType.STRING)
    @Column(name = "space_type", length = 20)
    private CreativeSpaceType spaceType;

    @Column(length = 100)
    private String dimensions;

    @Column(name = "artistic_style", length = 150)
    private String artisticStyle;

    @Column(columnDefinition = "TEXT")
    private String lighting;

    @Column(columnDefinition = "TEXT")
    private String ventilation;

    @Column(columnDefinition = "TEXT")
    private String acoustics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<String> amenities = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "operating_hours", columnDefinition = "jsonb")
    private Map<String, Object> operatingHours = new HashMap<>();

    @Column(columnDefinition = "TEXT")
    private String policies;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<String> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false, length = 30)
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public CreativeSpace() {
    }

    public UUID getId() { return id; }
    public UUID getProviderId() { return providerId; }
    public void setProviderId(UUID providerId) { this.providerId = providerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public BigDecimal getAreaSqm() { return areaSqm; }
    public void setAreaSqm(BigDecimal areaSqm) { this.areaSqm = areaSqm; }

    public BigDecimal getHourlyPrice() { return hourlyPrice; }
    public void setHourlyPrice(BigDecimal hourlyPrice) { this.hourlyPrice = hourlyPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public CreativeSpaceType getSpaceType() { return spaceType; }
    public void setSpaceType(CreativeSpaceType spaceType) { this.spaceType = spaceType; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getArtisticStyle() { return artisticStyle; }
    public void setArtisticStyle(String artisticStyle) { this.artisticStyle = artisticStyle; }

    public String getLighting() { return lighting; }
    public void setLighting(String lighting) { this.lighting = lighting; }

    public String getVentilation() { return ventilation; }
    public void setVentilation(String ventilation) { this.ventilation = ventilation; }

    public String getAcoustics() { return acoustics; }
    public void setAcoustics(String acoustics) { this.acoustics = acoustics; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities == null ? new ArrayList<>() : amenities;
    }

    public Map<String, Object> getOperatingHours() { return operatingHours; }
    public void setOperatingHours(Map<String, Object> operatingHours) {
        this.operatingHours = operatingHours == null ? new HashMap<>() : operatingHours;
    }

    public String getPolicies() { return policies; }
    public void setPolicies(String policies) { this.policies = policies; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) {
        this.images = images == null ? new ArrayList<>() : images;
    }

    public AvailabilityStatus getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}