
package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.dto.response.PageResponse;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ResourceServicePaginationTest {

    private ResourceService resourceService;
    private EquipmentRepository equipmentRepository;

    @BeforeEach
    void setUp() {
        equipmentRepository = mock(EquipmentRepository.class);

        resourceService = new ResourceService(
                mock(CreativeSpaceRepository.class),
                equipmentRepository,
                mock(ConsumableRepository.class),
                mock(ObjectMapper.class)
        );
    }

    @Test
    void getResources_shouldRejectNegativePage() {
        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.getResources(
                        ResourceType.EQUIPMENT, -1, 10
                )
        );
    }

    @Test
    void getResources_shouldRejectZeroSize() {
        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.getResources(
                        ResourceType.EQUIPMENT, 0, 0
                )
        );
    }

    @Test
    void getResources_shouldRejectSizeGreaterThan100() {
        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.getResources(
                        ResourceType.EQUIPMENT, 0, 101
                )
        );
    }

    @Test
    void getResources_shouldReturnPaginatedEquipment() {
        // Arrange: Create mock equipment
        Equipment equipment1 = mock(Equipment.class);
        Equipment equipment2 = mock(Equipment.class);

        UUID id1 = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        OffsetDateTime now = OffsetDateTime.now();

        when(equipment1.getId()).thenReturn(id1);
        when(equipment1.getProviderId()).thenReturn(providerId);
        when(equipment1.getName()).thenReturn("Film Camera");
        when(equipment1.getDescription()).thenReturn("35mm film camera");
        when(equipment1.getCategory()).thenReturn("Camera");
        when(equipment1.getBrand()).thenReturn("Canon");
        when(equipment1.getModel()).thenReturn("AE-1");
        when(equipment1.getEquipmentCondition()).thenReturn("GOOD");
        when(equipment1.getStatus()).thenReturn("AVAILABLE");
        when(equipment1.getRentalPrice()).thenReturn(new BigDecimal("150000"));
        when(equipment1.getCreatedAt()).thenReturn(now);
        when(equipment1.getUpdatedAt()).thenReturn(now);

        when(equipment2.getId()).thenReturn(UUID.randomUUID());
        when(equipment2.getProviderId()).thenReturn(providerId);
        when(equipment2.getName()).thenReturn("Film Lens");
        when(equipment2.getDescription()).thenReturn("50mm lens");
        when(equipment2.getCategory()).thenReturn("Lens");
        when(equipment2.getBrand()).thenReturn("Nikon");
        when(equipment2.getModel()).thenReturn("50mm f/1.8");
        when(equipment2.getEquipmentCondition()).thenReturn("GOOD");
        when(equipment2.getStatus()).thenReturn("AVAILABLE");
        when(equipment2.getRentalPrice()).thenReturn(new BigDecimal("100000"));
        when(equipment2.getCreatedAt()).thenReturn(now);
        when(equipment2.getUpdatedAt()).thenReturn(now);

        Page<Equipment> equipmentPage = new PageImpl<>(
                List.of(equipment1, equipment2),
                PageRequest.of(0, 2),
                5
        );

        when(equipmentRepository.findAll(any(Pageable.class)))
                .thenReturn(equipmentPage);

        // Act: Call service
        PageResponse<ResourceResponse> response =
                resourceService.getResources(ResourceType.EQUIPMENT, 0, 2);

        // Assert: Pagination metadata
        assertEquals(0, response.pagination().page());
        assertEquals(2, response.pagination().size());
        assertEquals(5, response.pagination().totalElements());
        assertEquals(3, response.pagination().totalPages());
        assertTrue(response.pagination().hasNext());
        assertFalse(response.pagination().hasPrevious());

        // Assert: Returned data
        assertEquals(2, response.data().size());

        ResourceResponse first = response.data().get(0);

        assertEquals(id1, first.id());
        assertEquals(providerId, first.providerId());
        assertEquals("Film Camera", first.name());
        assertEquals("35mm film camera", first.description());
        assertEquals(ResourceType.EQUIPMENT, first.resourceType());
        assertEquals("AVAILABLE", first.status());

        // Assert: Equipment attributes
        assertEquals("Camera", first.attributes().get("category"));
        assertEquals("Canon", first.attributes().get("brand"));
        assertEquals("AE-1", first.attributes().get("model"));
        assertEquals("GOOD", first.attributes().get("equipmentCondition"));
        assertEquals(new BigDecimal("150000"), first.attributes().get("rentalPrice"));

        // Assert: Timestamp conversion
        assertEquals(now.toInstant(), first.createdAt());
        assertEquals(now.toInstant(), first.updatedAt());
    }

    @Test
    void getResources_shouldReturnLastPageWithoutNextPage() {
        // Arrange
        Equipment equipment = mock(Equipment.class);

        OffsetDateTime now = OffsetDateTime.now();

        when(equipment.getId()).thenReturn(UUID.randomUUID());
        when(equipment.getProviderId()).thenReturn(UUID.randomUUID());
        when(equipment.getName()).thenReturn("Film Camera");
        when(equipment.getDescription()).thenReturn("35mm camera");
        when(equipment.getCategory()).thenReturn("Camera");
        when(equipment.getBrand()).thenReturn("Canon");
        when(equipment.getModel()).thenReturn("AE-1");
        when(equipment.getEquipmentCondition()).thenReturn("GOOD");
        when(equipment.getStatus()).thenReturn("AVAILABLE");
        when(equipment.getRentalPrice()).thenReturn(new BigDecimal("150000"));
        when(equipment.getCreatedAt()).thenReturn(now);
        when(equipment.getUpdatedAt()).thenReturn(now);

        Page<Equipment> equipmentPage = new PageImpl<>(
                List.of(equipment),
                PageRequest.of(2, 2),
                5
        );

        when(equipmentRepository.findAll(any(Pageable.class)))
                .thenReturn(equipmentPage);

        // Act
        PageResponse<ResourceResponse> response =
                resourceService.getResources(ResourceType.EQUIPMENT, 2, 2);

        // Assert
        assertEquals(2, response.pagination().page());
        assertEquals(2, response.pagination().size());
        assertEquals(5, response.pagination().totalElements());
        assertEquals(3, response.pagination().totalPages());

        assertFalse(response.pagination().hasNext());
        assertTrue(response.pagination().hasPrevious());

        assertEquals(1, response.data().size());
    }

    @Test
    void getResources_shouldReturnEmptyPage() {
        // Arrange
        Page<Equipment> emptyPage = new PageImpl<>(
                List.of(),
                PageRequest.of(0, 10),
                0
        );

        when(equipmentRepository.findAll(any(Pageable.class)))
                .thenReturn(emptyPage);

        // Act
        PageResponse<ResourceResponse> response =
                resourceService.getResources(ResourceType.EQUIPMENT, 0, 10);

        // Assert
        assertTrue(response.data().isEmpty());

        assertEquals(0, response.pagination().page());
        assertEquals(10, response.pagination().size());
        assertEquals(0, response.pagination().totalElements());
        assertEquals(0, response.pagination().totalPages());

        assertFalse(response.pagination().hasNext());
        assertFalse(response.pagination().hasPrevious());
    }
}
