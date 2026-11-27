
package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.request.EquipmentAttributes;
import com.lentd6190art.fpp.resource.dto.request.ConsumableAttributes;
import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.model.Consumable;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.config.ProviderAuthenticationDetails;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.exc.InvalidFormatException;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResourceServiceCreateTest {

    private ResourceService resourceService;
    private CreativeSpaceRepository creativeSpaceRepository;
    private EquipmentRepository equipmentRepository;
    private ConsumableRepository consumableRepository;
    private ObjectMapper objectMapper;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        creativeSpaceRepository = mock(CreativeSpaceRepository.class);
        equipmentRepository = mock(EquipmentRepository.class);
        consumableRepository = mock(ConsumableRepository.class);
        objectMapper = mock(ObjectMapper.class);
        authentication = mock(Authentication.class);

        resourceService = new ResourceService(
                creativeSpaceRepository,
                equipmentRepository,
                consumableRepository,
                objectMapper);

        UUID providerId = UUID.randomUUID();

        when(authentication.getDetails())
                .thenReturn(new ProviderAuthenticationDetails(providerId));
    }

    // Shared request validation

    @Test
    void createResource_shouldRejectBlankName() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                " ",
                "Description",
                Map.of("category", "Camera"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    @Test
    void createResource_shouldRejectNameExceeding200Characters() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                "a".repeat(201),
                "Description",
                Map.of("category", "Camera"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    @Test
    void createResource_shouldRejectMissingAttributes() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                "Camera",
                "Description",
                null);

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    // Equipment validation

    @Test
    void createEquipment_shouldRejectBlankCategory() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                "Camera",
                "Description",
                Map.of());

        when(objectMapper.convertValue(any(), eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        " ",
                        null,
                        null,
                        "GOOD",
                        "AVAILABLE",
                        BigDecimal.ZERO));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    @Test
    void createEquipment_shouldRejectNegativeRentalPrice() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                "Camera",
                "Description",
                Map.of());

        when(objectMapper.convertValue(any(), eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "Camera",
                        null,
                        null,
                        "GOOD",
                        "AVAILABLE",
                        new BigDecimal("-1")));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    @Test
    void createEquipment_shouldRejectInvalidCondition() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.EQUIPMENT,
                "Camera",
                "Description",
                Map.of());

        when(objectMapper.convertValue(any(), eq(EquipmentAttributes.class)))
                .thenReturn(new EquipmentAttributes(
                        "Camera",
                        null,
                        null,
                        "INVALID",
                        "AVAILABLE",
                        BigDecimal.ZERO));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(equipmentRepository, never()).save(any(Equipment.class));
    }

    // Consumable validation

    @Test
    void createConsumable_shouldRejectNegativeStockQuantity() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                "Film",
                "Film roll",
                Map.of());

        when(objectMapper.convertValue(any(), eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        -1,
                        0,
                        BigDecimal.ZERO,
                        "roll",
                        null,
                        "ACTIVE",
                        "Film"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(consumableRepository, never()).save(any(Consumable.class));
    }

    @Test
    void createConsumable_shouldRejectNegativeUnitPrice() {
        ResourceRequest request = new ResourceRequest(
                ResourceType.CONSUMABLE,
                "Film",
                "Film roll",
                Map.of());

        when(objectMapper.convertValue(any(), eq(ConsumableAttributes.class)))
                .thenReturn(new ConsumableAttributes(
                        10,
                        0,
                        new BigDecimal("-1"),
                        "roll",
                        null,
                        "ACTIVE",
                        "Film"));

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.createResource(request, authentication));

        verify(consumableRepository, never()).save(any(Consumable.class));
    }
    @Test
    void objectMapper_shouldThrowInvalidFormatExceptionForInvalidNumericValue() {
        ObjectMapper realObjectMapper = JsonMapper.builder().build();

        Map<String, Object> attributes = Map.of(
                "stockQuantity", "not-a-number");

        assertThrows(
                InvalidFormatException.class,
                () -> realObjectMapper.convertValue(
                        attributes,
                        ConsumableAttributes.class));
        }
}
