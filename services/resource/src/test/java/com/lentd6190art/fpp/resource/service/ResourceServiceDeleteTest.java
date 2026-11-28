package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.model.Consumable;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.config.ProviderAuthenticationDetails;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import tools.jackson.databind.ObjectMapper;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ResourceServiceDeleteTest {

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
    }

    private void mockAuthentication(UUID providerId) {
    when(authentication.getDetails())
            .thenReturn(new ProviderAuthenticationDetails(providerId));
}

    @Test
    void deleteResource_shouldDeleteCreativeSpaceSuccessfully() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        CreativeSpace entity = new CreativeSpace();

        when(creativeSpaceRepository.findByIdAndProviderId(resourceId, providerId))
                .thenReturn(Optional.of(entity));

        resourceService.deleteResource(
                ResourceType.CREATIVE_SPACE,
                resourceId,
                authentication);

        verify(creativeSpaceRepository).delete(entity);
    }

    @Test
    void deleteResource_shouldDeleteEquipmentSuccessfully() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        Equipment entity = new Equipment();

        when(equipmentRepository.findByIdAndProviderId(resourceId, providerId))
                .thenReturn(Optional.of(entity));

        resourceService.deleteResource(
                ResourceType.EQUIPMENT,
                resourceId,
                authentication);

        verify(equipmentRepository).delete(entity);
    }

    @Test
    void deleteResource_shouldDeleteConsumableSuccessfully() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        Consumable entity = new Consumable();

        when(consumableRepository.findByIdAndProviderId(resourceId, providerId))
                .thenReturn(Optional.of(entity));

        resourceService.deleteResource(
                ResourceType.CONSUMABLE,
                resourceId,
                authentication);

        verify(consumableRepository).delete(entity);
    }

    @Test
    void deleteResource_shouldRejectDeletingResourceOfAnotherProvider() {
        UUID resourceId = UUID.randomUUID();
        UUID unauthorizedProviderId = UUID.randomUUID();

        mockAuthentication(unauthorizedProviderId);

        when(equipmentRepository.findByIdAndProviderId(
                resourceId,
                unauthorizedProviderId))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> resourceService.deleteResource(
                        ResourceType.EQUIPMENT,
                        resourceId,
                        authentication));

        verify(equipmentRepository, never()).delete(any());
    }

    @Test
    void deleteResource_shouldThrowNotFoundWhenResourceDoesNotExist() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        when(consumableRepository.findByIdAndProviderId(resourceId, providerId))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> resourceService.deleteResource(
                        ResourceType.CONSUMABLE,
                        resourceId,
                        authentication));

        verify(consumableRepository, never()).delete(any());
    }

    @Test
    void deleteResource_shouldRejectNullResourceType() {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.deleteResource(
                        null,
                        resourceId,
                        authentication));

        verifyNoInteractions(
                creativeSpaceRepository,
                equipmentRepository,
                consumableRepository);
    }

    @Test
    void deleteResource_shouldRejectNullResourceId() {
        UUID providerId = UUID.randomUUID();

        mockAuthentication(providerId);

        assertThrows(
                IllegalArgumentException.class,
                () -> resourceService.deleteResource(
                        ResourceType.EQUIPMENT,
                        null,
                        authentication));

        verifyNoInteractions(
                creativeSpaceRepository,
                equipmentRepository,
                consumableRepository);
    }
}
