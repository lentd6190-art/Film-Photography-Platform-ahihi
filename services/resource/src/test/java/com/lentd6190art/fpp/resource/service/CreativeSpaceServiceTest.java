package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.dto.CreativeSpaceRequest;
import com.lentd6190art.fpp.resource.dto.CreativeSpaceResponse;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verifyNoInteractions;

class CreativeSpaceServiceTest {

        private CreativeSpaceService creativeSpaceService;
        private CreativeSpaceRepository creativeSpaceRepository;

        @BeforeEach
        void setUp() {
                creativeSpaceRepository = mock(CreativeSpaceRepository.class);
                creativeSpaceService = new CreativeSpaceService(creativeSpaceRepository);
        }

        @Test
        void create_shouldAssignProviderAndDefaultAvailability() {
                // Arrange
                UUID providerId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                CreativeSpaceRequest request = new CreativeSpaceRequest(
                                "My Darkroom",
                                "A professional film developing space",
                                "123 Nguyen Hue, Ho Chi Minh City",
                                new BigDecimal("10.762622"),
                                new BigDecimal("106.660172"),
                                5,
                                new BigDecimal("30.00"),
                                new BigDecimal("150000"),
                                CreativeSpaceType.DARKROOM,
                                "6m x 5m",
                                "Vintage",
                                "Red safelight",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Film developing tank", "Enlarger"),
                                Map.of("Monday", "08:00-17:00"),
                                "No smoking",
                                List.of("darkroom-1.jpg"),
                                null);

                when(creativeSpaceRepository.save(any(CreativeSpace.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                // Act
                CreativeSpaceResponse response = creativeSpaceService.create(request, authentication);

                // Assert
                assertEquals(providerId, response.providerId());
                assertEquals("My Darkroom", response.name());
                assertEquals(CreativeSpaceType.DARKROOM, response.spaceType());
                assertEquals(AvailabilityStatus.AVAILABLE, response.availabilityStatus());

                ArgumentCaptor<CreativeSpace> captor = ArgumentCaptor.forClass(CreativeSpace.class);

                verify(creativeSpaceRepository).save(captor.capture());

                CreativeSpace savedCreativeSpace = captor.getValue();

                assertEquals(providerId, savedCreativeSpace.getProviderId());
                assertEquals(AvailabilityStatus.AVAILABLE,
                                savedCreativeSpace.getAvailabilityStatus());
        }

        @Test
        void getById_shouldRejectCreativeSpaceOwnedByAnotherProvider() {
                // Arrange
                UUID providerA = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerA.toString());

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerA))
                                .thenReturn(java.util.Optional.empty());

                // Act & Assert
                assertThrows(
                                ResourceNotFoundException.class,
                                () -> creativeSpaceService.getById(creativeSpaceId, authentication));

                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerA);
        }

        @Test
        void update_shouldRejectCreativeSpaceOwnedByAnotherProvider() {
                // Arrange
                UUID providerId = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerId))
                                .thenReturn(java.util.Optional.empty());

                CreativeSpaceRequest request = new CreativeSpaceRequest(
                                "Updated Darkroom",
                                "Updated description",
                                "123 Nguyen Hue, Ho Chi Minh City",
                                new BigDecimal("10.762622"),
                                new BigDecimal("106.660172"),
                                5,
                                new BigDecimal("30.00"),
                                new BigDecimal("150000"),
                                CreativeSpaceType.DARKROOM,
                                "6m x 5m",
                                "Vintage",
                                "Red safelight",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Film developing tank"),
                                Map.of("Monday", "08:00-17:00"),
                                "No smoking",
                                List.of("darkroom-1.jpg"),
                                AvailabilityStatus.AVAILABLE);

                // Act & Assert
                assertThrows(
                                ResourceNotFoundException.class,
                                () -> creativeSpaceService.update(
                                                creativeSpaceId, request, authentication));

                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerId);

                verify(creativeSpaceRepository, never())
                                .save(any(CreativeSpace.class));
        }

        @Test
        void delete_shouldRejectCreativeSpaceOwnedByAnotherProvider() {
                // Arrange
                UUID providerId = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerId))
                                .thenReturn(java.util.Optional.empty());

                // Act & Assert
                assertThrows(
                                ResourceNotFoundException.class,
                                () -> creativeSpaceService.delete(creativeSpaceId, authentication));

                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerId);

                verify(creativeSpaceRepository, never())
                                .delete(any(CreativeSpace.class));
        }

        @Test
        void create_shouldRejectInvalidProviderIdentity() {
                // Arrange
                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn("invalid-provider-id");

                CreativeSpaceRequest request = null;

                // Act & Assert
                assertThrows(
                                IllegalArgumentException.class,
                                () -> creativeSpaceService.create(request, authentication));

                verifyNoInteractions(creativeSpaceRepository);
        }

        @Test
        void create_shouldRejectNullAuthentication() {
                // Act & Assert
                assertThrows(
                                IllegalArgumentException.class,
                                () -> creativeSpaceService.create(null, null));

                verifyNoInteractions(creativeSpaceRepository);
        }

        @Test
        void create_shouldRejectNullPrincipal() {
                // Arrange
                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(null);

                // Act & Assert
                assertThrows(
                                IllegalArgumentException.class,
                                () -> creativeSpaceService.create(null, authentication));

                verifyNoInteractions(creativeSpaceRepository);
        }

        @Test
        void getMyCreativeSpaces_shouldFilterByProviderAndApplyPagination() {
                // Arrange
                UUID providerId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                CreativeSpace creativeSpace = new CreativeSpace();
                creativeSpace.setProviderId(providerId);
                creativeSpace.setName("My Darkroom");
                creativeSpace.setDescription("A professional darkroom");
                creativeSpace.setAddress("123 Nguyen Hue");
                creativeSpace.setCapacity(5);
                creativeSpace.setHourlyPrice(new BigDecimal("150000"));
                creativeSpace.setStatus("ACTIVE");
                creativeSpace.setSpaceType(CreativeSpaceType.DARKROOM);
                creativeSpace.setDimensions("6m x 5m");
                creativeSpace.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

                Pageable pageable = PageRequest.of(
                                0,
                                10,
                                Sort.by(Sort.Direction.DESC, "createdAt"));

                Page<CreativeSpace> creativeSpacePage = new PageImpl<>(
                                List.of(creativeSpace),
                                pageable,
                                1);

                when(creativeSpaceRepository.findAllByProviderId(
                                providerId, pageable))
                                .thenReturn(creativeSpacePage);

                // Act
                Page<CreativeSpaceResponse> response = creativeSpaceService.getMyCreativeSpaces(authentication, 0, 10);

                // Assert
                assertEquals(1, response.getTotalElements());
                assertEquals("My Darkroom", response.getContent().get(0).name());
                assertEquals(providerId, response.getContent().get(0).providerId());

                ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);

                verify(creativeSpaceRepository).findAllByProviderId(
                                org.mockito.ArgumentMatchers.eq(providerId),
                                pageableCaptor.capture());

                Pageable actualPageable = pageableCaptor.getValue();

                assertEquals(0, actualPageable.getPageNumber());
                assertEquals(10, actualPageable.getPageSize());
                assertEquals(
                                Sort.Direction.DESC,
                                actualPageable.getSort().getOrderFor("createdAt").getDirection());
        }

        @Test
        void getById_shouldReturnCreativeSpaceOwnedByProvider() {
                // Arrange
                UUID providerId = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                CreativeSpace creativeSpace = new CreativeSpace();
                creativeSpace.setProviderId(providerId);
                creativeSpace.setName("My Darkroom");
                creativeSpace.setDescription("A professional darkroom");
                creativeSpace.setAddress("123 Nguyen Hue");
                creativeSpace.setCapacity(5);
                creativeSpace.setHourlyPrice(new BigDecimal("150000"));
                creativeSpace.setStatus("ACTIVE");
                creativeSpace.setSpaceType(CreativeSpaceType.DARKROOM);
                creativeSpace.setDimensions("6m x 5m");
                creativeSpace.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerId))
                                .thenReturn(java.util.Optional.of(creativeSpace));

                // Act
                CreativeSpaceResponse response = creativeSpaceService.getById(creativeSpaceId, authentication);

                // Assert
                assertEquals(providerId, response.providerId());
                assertEquals("My Darkroom", response.name());
                assertEquals(CreativeSpaceType.DARKROOM, response.spaceType());

                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerId);
        }

        @Test
        void update_shouldUpdateCreativeSpaceOwnedByProvider() {
                // Arrange
                UUID providerId = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                CreativeSpace creativeSpace = new CreativeSpace();
                creativeSpace.setProviderId(providerId);
                creativeSpace.setName("Old Darkroom");
                creativeSpace.setDescription("Old description");
                creativeSpace.setAddress("Old address");
                creativeSpace.setCapacity(3);
                creativeSpace.setHourlyPrice(new BigDecimal("100000"));
                creativeSpace.setStatus("ACTIVE");
                creativeSpace.setSpaceType(CreativeSpaceType.DARKROOM);
                creativeSpace.setDimensions("4m x 3m");
                creativeSpace.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

                CreativeSpaceRequest request = new CreativeSpaceRequest(
                                "New Darkroom",
                                "Updated description",
                                "123 Nguyen Hue",
                                null,
                                null,
                                5,
                                new BigDecimal("30.00"),
                                new BigDecimal("150000"),
                                CreativeSpaceType.STUDIO,
                                "6m x 5m",
                                "Modern",
                                "Natural lighting",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Lighting equipment", "Air conditioning"),
                                Map.of("monday", "08:00-18:00"),
                                "No smoking",
                                List.of("image1.jpg"),
                                AvailabilityStatus.AVAILABLE);

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerId))
                                .thenReturn(java.util.Optional.of(creativeSpace));

                when(creativeSpaceRepository.save(any(CreativeSpace.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                // Act
                CreativeSpaceResponse response = creativeSpaceService.update(creativeSpaceId, request, authentication);

                // Assert
                assertEquals(providerId, response.providerId());
                assertEquals("New Darkroom", response.name());
                assertEquals("Updated description", response.description());
                assertEquals("123 Nguyen Hue", response.address());
                assertEquals(5, response.capacity());
                assertEquals(new BigDecimal("150000"), response.hourlyPrice());
                assertEquals(CreativeSpaceType.STUDIO, response.spaceType());
                assertEquals("6m x 5m", response.dimensions());
                assertEquals(AvailabilityStatus.AVAILABLE, response.availabilityStatus());
                assertEquals("Modern", response.artisticStyle());
                assertEquals("Natural lighting", response.lighting());
                assertEquals("Good ventilation", response.ventilation());
                assertEquals("Soundproof", response.acoustics());
                assertEquals(
                                List.of("Lighting equipment", "Air conditioning"),
                                response.amenities());
                assertEquals(Map.of("monday", "08:00-18:00"), response.operatingHours());
                assertEquals("No smoking", response.policies());
                assertEquals(List.of("image1.jpg"), response.images());

                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerId);

                verify(creativeSpaceRepository).save(creativeSpace);
        }

        @Test
        void delete_shouldDeleteCreativeSpaceOwnedByProvider() {
                // Arrange
                UUID providerId = UUID.randomUUID();
                UUID creativeSpaceId = UUID.randomUUID();

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal()).thenReturn(providerId.toString());

                CreativeSpace creativeSpace = new CreativeSpace();
                creativeSpace.setProviderId(providerId);
                creativeSpace.setName("My Darkroom");
                creativeSpace.setDescription("A professional darkroom");
                creativeSpace.setAddress("123 Nguyen Hue");
                creativeSpace.setCapacity(5);
                creativeSpace.setHourlyPrice(new BigDecimal("150000"));
                creativeSpace.setStatus("ACTIVE");
                creativeSpace.setSpaceType(CreativeSpaceType.DARKROOM);
                creativeSpace.setDimensions("6m x 5m");
                creativeSpace.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);

                when(creativeSpaceRepository.findByIdAndProviderId(
                                creativeSpaceId, providerId))
                                .thenReturn(java.util.Optional.of(creativeSpace));

                // Act
                creativeSpaceService.delete(creativeSpaceId, authentication);

                // Assert
                verify(creativeSpaceRepository)
                                .findByIdAndProviderId(creativeSpaceId, providerId);

                verify(creativeSpaceRepository).delete(creativeSpace);
        }
}