
package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.request.CreativeSpaceAttributes;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.Consumable;
import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;
import com.lentd6190art.fpp.resource.dto.request.EquipmentAttributes;
import com.lentd6190art.fpp.resource.dto.request.ConsumableAttributes;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ResourceServiceUpdateTest {

    private ResourceService resourceService;
    private CreativeSpaceRepository creativeSpaceRepository;
    private EquipmentRepository equipmentRepository;
    private ConsumableRepository consumableRepository;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        creativeSpaceRepository = mock(CreativeSpaceRepository.class);
        equipmentRepository = mock(EquipmentRepository.class);
        consumableRepository = mock(ConsumableRepository.class);
        objectMapper = mock(ObjectMapper.class);

        resourceService = new ResourceService(
                creativeSpaceRepository,
                equipmentRepository,
                consumableRepository,
                objectMapper);
    }

    @Test
    void updateResource_shouldUpdateCreativeSpaceSuccessfully() {
        // Arrange
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");

        CreativeSpace existing = new CreativeSpace();
        ReflectionTestUtils.setField(existing, "id", resourceId);
        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);
        existing.setProviderId(providerId);
        existing.setName("Old Studio");
        existing.setDescription("Old description");
        existing.setAddress("Old Address");
        existing.setCapacity(5);
        existing.setHourlyPrice(new BigDecimal("100000"));
        existing.setStatus("ACTIVE");

        when(creativeSpaceRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        CreativeSpaceAttributes attributes = new CreativeSpaceAttributes(
                "123 Updated Street",
                new BigDecimal("10.762622"),
                new BigDecimal("106.660172"),
                10,
                new BigDecimal("80.00"),
                new BigDecimal("200000"),
                "ACTIVE");

        when(objectMapper.convertValue(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(CreativeSpaceAttributes.class))).thenReturn(attributes);

        ResourceRequest request = new ResourceRequest(
                ResourceType.CREATIVE_SPACE,
                providerId,
                "Darkroom Studio Updated",
                "Updated description",
                Map.of("address", "123 Updated Street"));

        when(creativeSpaceRepository.save(existing))
                .thenReturn(existing);

        // Act
        ResourceResponse response = resourceService.updateResource(
                ResourceType.CREATIVE_SPACE,
                resourceId,
                request);

        // Assert
        assertEquals("Darkroom Studio Updated", response.name());
        assertEquals("Updated description", response.description());
        assertEquals(providerId, response.providerId());

        assertEquals(
                "123 Updated Street",
                response.attributes().get("address"));

        assertEquals(
                10,
                response.attributes().get("capacity"));

        assertEquals(
                new BigDecimal("200000"),
                response.attributes().get("hourlyPrice"));

        verify(creativeSpaceRepository).save(existing);
    }

    @Test
    void updateResource_shouldRejectProviderIdChange() {
        UUID resourceId = UUID.randomUUID();
        UUID originalProviderId = UUID.randomUUID();
        UUID newProviderId = UUID.randomUUID();

        CreativeSpace existing = new CreativeSpace();
        existing.setProviderId(originalProviderId);
        existing.setName("Old Studio");
        existing.setAddress("Old Address");
        existing.setCapacity(5);
        existing.setHourlyPrice(new BigDecimal("100000"));

        when(creativeSpaceRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CREATIVE_SPACE,
                newProviderId,
                "Updated Studio",
                "Updated description",
                Map.of(
                        "address", "Updated Address",
                        "capacity", 10,
                        "hourlyPrice", 200000));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CREATIVE_SPACE,
                        resourceId,
                        request));
    }

    @Test
    void updateResource_shouldRejectResourceTypeMismatch() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Camera",
                "Film camera",
                Map.of("category", "CAMERA"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CREATIVE_SPACE,
                        resourceId,
                        request));
    }

    @Test
    void updateResource_shouldThrowNotFoundWhenResourceDoesNotExist() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        when(creativeSpaceRepository.findById(resourceId))
                .thenReturn(Optional.empty());

        ResourceRequest request = new ResourceRequest(
                ResourceType.CREATIVE_SPACE,
                providerId,
                "Updated Studio",
                "Updated description",
                Map.of(
                        "address", "Updated Address",
                        "capacity", 10,
                        "hourlyPrice", 200000));

        assertThrows(
                ResourceNotFoundException.class,
                () -> resourceService.updateResource(
                        ResourceType.CREATIVE_SPACE,
                        resourceId,
                        request));
    }

    @Test
    void updateResource_shouldRejectInvalidCapacity() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        CreativeSpace existing = new CreativeSpace();
        existing.setProviderId(providerId);
        existing.setName("Old Studio");
        existing.setAddress("Old Address");
        existing.setCapacity(5);
        existing.setHourlyPrice(new BigDecimal("100000"));

        when(creativeSpaceRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        CreativeSpaceAttributes attributes = new CreativeSpaceAttributes(
                "Updated Address",
                null,
                null,
                0,
                null,
                new BigDecimal("200000"),
                "ACTIVE");

        when(objectMapper.convertValue(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(CreativeSpaceAttributes.class))).thenReturn(attributes);

        ResourceRequest request = new ResourceRequest(
                ResourceType.CREATIVE_SPACE,
                providerId,
                "Updated Studio",
                "Updated description",
                Map.of("address", "Updated Address"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CREATIVE_SPACE,
                        resourceId,
                        request));
    }

    @Test
    void updateResource_shouldKeepExistingHourlyPriceWhenNotProvided() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        CreativeSpace existing = new CreativeSpace();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");

        ReflectionTestUtils.setField(existing, "id", resourceId);
        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);
        existing.setProviderId(providerId);
        existing.setName("Old Studio");
        existing.setDescription("Old description");
        existing.setAddress("Old Address");
        existing.setCapacity(5);
        existing.setHourlyPrice(new BigDecimal("150000"));

        when(creativeSpaceRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));
        when(creativeSpaceRepository.save(existing))
                .thenReturn(existing);

        CreativeSpaceAttributes attributes = new CreativeSpaceAttributes(
                "Updated Address",
                null,
                null,
                10,
                null,
                null, // Keep existing hourly price
                "ACTIVE");

        when(objectMapper.convertValue(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(CreativeSpaceAttributes.class))).thenReturn(attributes);

        ResourceRequest request = new ResourceRequest(
                ResourceType.CREATIVE_SPACE,
                providerId,
                "Updated Studio",
                "Updated description",
                Map.of("address", "Updated Address"));

        ResourceResponse response = resourceService.updateResource(
                ResourceType.CREATIVE_SPACE,
                resourceId,
                request);

        assertEquals(
                new BigDecimal("150000"),
                response.attributes().get("hourlyPrice"));
    }

    @Test
    void updateResource_shouldUpdateEquipmentSuccessfully() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Equipment existing = new Equipment();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");

        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);

        existing.setProviderId(providerId);
        existing.setName("Old Camera");
        existing.setDescription("Old camera description");
        existing.setCategory("CAMERA");
        existing.setBrand("Canon");
        existing.setModel("AE-1");
        existing.setEquipmentCondition("GOOD");
        existing.setStatus("AVAILABLE");
        existing.setRentalPrice(new BigDecimal("100000"));

        when(equipmentRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        EquipmentAttributes attributes = new EquipmentAttributes(
                "CAMERA",
                "Nikon",
                "FM2",
                "EXCELLENT",
                "AVAILABLE",
                new BigDecimal("150000"));

        when(objectMapper.convertValue(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq(EquipmentAttributes.class)))
                .thenReturn(attributes);

        when(equipmentRepository.save(existing))
                .thenReturn(existing);

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Updated Camera",
                "Updated camera description",
                Map.of("category", "CAMERA"));

        ResourceResponse response = resourceService.updateResource(
                ResourceType.EQUIPMENT,
                resourceId,
                request);

        assertEquals("Updated Camera", response.name());
        assertEquals("Updated camera description", response.description());
        assertEquals(providerId, response.providerId());

        assertEquals("CAMERA", response.attributes().get("category"));
        assertEquals("Nikon", response.attributes().get("brand"));
        assertEquals("FM2", response.attributes().get("model"));
        assertEquals("EXCELLENT", response.attributes().get("equipmentCondition"));
        assertEquals("AVAILABLE", response.status());
        assertEquals(
                new BigDecimal("150000"),
                response.attributes().get("rentalPrice"));

        verify(equipmentRepository).save(existing);
    }

    @Test
    void updateResource_shouldKeepExistingEquipmentValuesWhenAttributesAreOmitted() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Equipment existing = new Equipment();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");
        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);

        existing.setProviderId(providerId);
        existing.setName("Canon Camera");
        existing.setDescription("Film camera");
        existing.setCategory("CAMERA");
        existing.setBrand("Canon");
        existing.setModel("AE-1");
        existing.setEquipmentCondition("GOOD");
        existing.setStatus("AVAILABLE");
        existing.setRentalPrice(new BigDecimal("100000"));

        when(equipmentRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));
        when(equipmentRepository.save(existing)).thenReturn(existing);

        when(objectMapper.convertValue(
                any(),
                eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "CAMERA",
                        null,
                        null,
                        null,
                        null,
                        null));

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Updated Canon Camera",
                "Updated description",
                Map.of("category", "CAMERA"));

        ResourceResponse response = resourceService.updateResource(
                ResourceType.EQUIPMENT,
                resourceId,
                request);

        assertEquals("GOOD", response.attributes().get("equipmentCondition"));
        assertEquals("AVAILABLE", response.status());
        assertEquals(
                new BigDecimal("100000"),
                response.attributes().get("rentalPrice"));

        verify(equipmentRepository).save(existing);
    }

    @Test
    void updateResource_shouldRejectNegativeEquipmentRentalPrice() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Equipment existing = new Equipment();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        existing.setProviderId(providerId);
        existing.setName("Canon Camera");
        existing.setCategory("CAMERA");
        existing.setEquipmentCondition("GOOD");
        existing.setStatus("AVAILABLE");
        existing.setRentalPrice(new BigDecimal("100000"));

        when(equipmentRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "CAMERA",
                        "Canon",
                        "AE-1",
                        "GOOD",
                        "AVAILABLE",
                        new BigDecimal("-1000")));

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Canon Camera",
                "Film camera",
                Map.of("category", "CAMERA"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.EQUIPMENT,
                        resourceId,
                        request));

        assertEquals(
                "Rental price must not be negative",
                exception.getMessage());

        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void updateResource_shouldRejectInvalidEquipmentCondition() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Equipment existing = new Equipment();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        existing.setProviderId(providerId);
        existing.setName("Canon Camera");
        existing.setCategory("CAMERA");
        existing.setEquipmentCondition("GOOD");
        existing.setStatus("AVAILABLE");
        existing.setRentalPrice(new BigDecimal("100000"));

        when(equipmentRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "CAMERA",
                        "Canon",
                        "AE-1",
                        "BROKEN",
                        "AVAILABLE",
                        new BigDecimal("100000")));

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Canon Camera",
                "Film camera",
                Map.of("category", "CAMERA"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.EQUIPMENT,
                        resourceId,
                        request));

        assertEquals("Invalid equipment condition", exception.getMessage());

        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void updateResource_shouldRejectInvalidEquipmentStatus() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Equipment existing = new Equipment();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        existing.setProviderId(providerId);
        existing.setName("Canon Camera");
        existing.setCategory("CAMERA");
        existing.setEquipmentCondition("GOOD");
        existing.setStatus("AVAILABLE");
        existing.setRentalPrice(new BigDecimal("100000"));

        when(equipmentRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "CAMERA",
                        "Canon",
                        "AE-1",
                        "GOOD",
                        "BROKEN",
                        new BigDecimal("100000")));

        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                providerId,
                "Canon Camera",
                "Film camera",
                Map.of("category", "CAMERA"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.EQUIPMENT,
                        resourceId,
                        request));

        assertEquals("Invalid equipment status", exception.getMessage());

        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void updateResource_shouldUpdateConsumableSuccessfully() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Consumable existing = new Consumable();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");
        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);

        existing.setProviderId(providerId);
        existing.setName("Old Film");
        existing.setDescription("Old film description");
        existing.setStockQuantity(10);
        existing.setReorderLevel(2);
        existing.setUnitPrice(new BigDecimal("50000"));
        existing.setUnit("roll");
        existing.setExpiryDate(LocalDate.of(2027, 1, 1));
        existing.setStatus("ACTIVE");

        when(consumableRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));
        when(consumableRepository.save(existing)).thenReturn(existing);

        when(objectMapper.convertValue(
                any(),
                eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        50,
                        10,
                        new BigDecimal("75000"),
                        "box",
                        LocalDate.of(2028, 1, 1),
                        "ACTIVE"));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                providerId,
                "Updated Film",
                "Updated film description",
                Map.of("stockQuantity", 50));

        ResourceResponse response = resourceService.updateResource(
                ResourceType.CONSUMABLE,
                resourceId,
                request);

        assertEquals("Updated Film", response.name());
        assertEquals("Updated film description", response.description());
        assertEquals(providerId, response.providerId());

        assertEquals(50, response.attributes().get("stockQuantity"));
        assertEquals(10, response.attributes().get("reorderLevel"));
        assertEquals(
                new BigDecimal("75000"),
                response.attributes().get("unitPrice"));
        assertEquals("box", response.attributes().get("unit"));
        assertEquals(
                LocalDate.of(2028, 1, 1),
                response.attributes().get("expiryDate"));
        assertEquals("ACTIVE", response.status());

        verify(consumableRepository).save(existing);
    }

    @Test
    void updateResource_shouldKeepExistingConsumableValuesWhenAttributesAreOmitted() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Consumable existing = new Consumable();
        ReflectionTestUtils.setField(existing, "id", resourceId);

        OffsetDateTime createdAt = OffsetDateTime.parse("2026-01-01T10:00:00+07:00");
        ReflectionTestUtils.setField(existing, "createdAt", createdAt);
        ReflectionTestUtils.setField(existing, "updatedAt", createdAt);

        existing.setProviderId(providerId);
        existing.setName("Kodak Film");
        existing.setDescription("35mm film");
        existing.setStockQuantity(20);
        existing.setReorderLevel(5);
        existing.setUnitPrice(new BigDecimal("80000"));
        existing.setUnit("roll");
        existing.setExpiryDate(LocalDate.of(2027, 6, 1));
        existing.setStatus("ACTIVE");

        when(consumableRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));
        when(consumableRepository.save(existing)).thenReturn(existing);

        when(objectMapper.convertValue(
                any(),
                eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                providerId,
                "Updated Kodak Film",
                "Updated description",
                Map.of());

        ResourceResponse response = resourceService.updateResource(
                ResourceType.CONSUMABLE,
                resourceId,
                request);

        assertEquals(20, response.attributes().get("stockQuantity"));
        assertEquals(5, response.attributes().get("reorderLevel"));
        assertEquals(
                new BigDecimal("80000"),
                response.attributes().get("unitPrice"));
        assertEquals("roll", response.attributes().get("unit"));
        assertEquals("ACTIVE", response.status());

        verify(consumableRepository).save(existing);
    }

    @Test
    void updateResource_shouldRejectNegativeConsumableStockQuantity() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Consumable existing = new Consumable();
        existing.setProviderId(providerId);
        existing.setName("Kodak Film");
        existing.setDescription("35mm film");
        existing.setStockQuantity(20);
        existing.setReorderLevel(5);
        existing.setUnitPrice(new BigDecimal("80000"));
        existing.setUnit("roll");
        existing.setStatus("ACTIVE");

        when(consumableRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        -1,
                        null,
                        null,
                        null,
                        null,
                        null));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                providerId,
                "Kodak Film",
                "35mm film",
                Map.of());

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CONSUMABLE,
                        resourceId,
                        request));

        verify(consumableRepository, never()).save(any());
    }

    @Test
    void updateResource_shouldRejectNegativeConsumableReorderLevel() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Consumable existing = new Consumable();
        existing.setProviderId(providerId);
        existing.setName("Kodak Film");
        existing.setDescription("35mm film");
        existing.setStockQuantity(20);
        existing.setReorderLevel(5);
        existing.setUnitPrice(new BigDecimal("80000"));
        existing.setUnit("roll");
        existing.setStatus("ACTIVE");

        when(consumableRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        null,
                        -1,
                        null,
                        null,
                        null,
                        null));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                providerId,
                "Kodak Film",
                "35mm film",
                Map.of());

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CONSUMABLE,
                        resourceId,
                        request));

        verify(consumableRepository, never()).save(any());
    }

    @Test
    void updateResource_shouldRejectNegativeConsumableUnitPrice() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        Consumable existing = new Consumable();
        existing.setProviderId(providerId);
        existing.setName("Kodak Film");
        existing.setDescription("35mm film");
        existing.setStockQuantity(20);
        existing.setReorderLevel(5);
        existing.setUnitPrice(new BigDecimal("80000"));
        existing.setUnit("roll");
        existing.setStatus("ACTIVE");

        when(consumableRepository.findById(resourceId))
                .thenReturn(Optional.of(existing));

        when(objectMapper.convertValue(
                any(),
                eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        null,
                        null,
                        new BigDecimal("-1000"),
                        null,
                        null,
                        null));

        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                providerId,
                "Kodak Film",
                "35mm film",
                Map.of());

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.updateResource(
                        ResourceType.CONSUMABLE,
                        resourceId,
                        request));

        verify(consumableRepository, never()).save(any());
    }
}
