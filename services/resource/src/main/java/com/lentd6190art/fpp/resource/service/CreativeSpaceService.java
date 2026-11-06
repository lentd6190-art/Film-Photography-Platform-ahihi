package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.dto.CreativeSpaceRequest;
import com.lentd6190art.fpp.resource.dto.CreativeSpaceResponse;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class CreativeSpaceService {

    private final CreativeSpaceRepository creativeSpaceRepository;

    public CreativeSpaceService(CreativeSpaceRepository creativeSpaceRepository) {
        this.creativeSpaceRepository = creativeSpaceRepository;
    }

    public CreativeSpaceResponse create(
            CreativeSpaceRequest request,
            Authentication authentication) {
        UUID providerId = getProviderId(authentication);

        CreativeSpace creativeSpace = new CreativeSpace();
        creativeSpace.setProviderId(providerId);

        applyRequest(creativeSpace, request);

        creativeSpace.setStatus("ACTIVE");

        if (request.availabilityStatus() == null) {
            creativeSpace.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        }

        return toResponse(creativeSpaceRepository.save(creativeSpace));
    }

    @Transactional(readOnly = true)
    public Page<CreativeSpaceResponse> getMyCreativeSpaces(
            Authentication authentication,
            int page,
            int size) {
        UUID providerId = getProviderId(authentication);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        return creativeSpaceRepository
                .findAllByProviderId(providerId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CreativeSpaceResponse getById(
            UUID id,
            Authentication authentication) {
        UUID providerId = getProviderId(authentication);

        CreativeSpace creativeSpace = findOwnedCreativeSpace(id, providerId);

        return toResponse(creativeSpace);
    }

    public CreativeSpaceResponse update(
            UUID id,
            CreativeSpaceRequest request,
            Authentication authentication) {
        UUID providerId = getProviderId(authentication);

        CreativeSpace creativeSpace = findOwnedCreativeSpace(id, providerId);

        applyRequest(creativeSpace, request);

        return toResponse(creativeSpaceRepository.save(creativeSpace));
    }

    public void delete(UUID id, Authentication authentication) {
        UUID providerId = getProviderId(authentication);

        CreativeSpace creativeSpace = findOwnedCreativeSpace(id, providerId);

        creativeSpaceRepository.delete(creativeSpace);
    }

    private UUID getProviderId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication is required");
        }

        try {
            return UUID.fromString(authentication.getPrincipal().toString());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid provider identity");
        }
    }

    private CreativeSpace findOwnedCreativeSpace(UUID id, UUID providerId) {
        return creativeSpaceRepository
                .findByIdAndProviderId(id, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Creative space not found"));
    }

    private void applyRequest(
            CreativeSpace creativeSpace,
            CreativeSpaceRequest request) {
        creativeSpace.setName(request.name());
        creativeSpace.setDescription(request.description());
        creativeSpace.setAddress(request.address());
        creativeSpace.setLatitude(request.latitude());
        creativeSpace.setLongitude(request.longitude());
        creativeSpace.setCapacity(request.capacity());
        creativeSpace.setAreaSqm(request.areaSqm());
        creativeSpace.setHourlyPrice(request.hourlyPrice());
        creativeSpace.setSpaceType(request.spaceType());
        creativeSpace.setDimensions(request.dimensions());
        creativeSpace.setArtisticStyle(request.artisticStyle());
        creativeSpace.setLighting(request.lighting());
        creativeSpace.setVentilation(request.ventilation());
        creativeSpace.setAcoustics(request.acoustics());
        creativeSpace.setAmenities(request.amenities());
        creativeSpace.setOperatingHours(request.operatingHours());
        creativeSpace.setPolicies(request.policies());
        creativeSpace.setImages(request.images());

        if (request.availabilityStatus() != null) {
            creativeSpace.setAvailabilityStatus(request.availabilityStatus());
        }
    }

    private CreativeSpaceResponse toResponse(CreativeSpace creativeSpace) {
        return new CreativeSpaceResponse(
                creativeSpace.getId(),
                creativeSpace.getProviderId(),
                creativeSpace.getName(),
                creativeSpace.getDescription(),
                creativeSpace.getAddress(),
                creativeSpace.getLatitude(),
                creativeSpace.getLongitude(),
                creativeSpace.getCapacity(),
                creativeSpace.getAreaSqm(),
                creativeSpace.getHourlyPrice(),
                creativeSpace.getStatus(),
                creativeSpace.getSpaceType(),
                creativeSpace.getDimensions(),
                creativeSpace.getArtisticStyle(),
                creativeSpace.getLighting(),
                creativeSpace.getVentilation(),
                creativeSpace.getAcoustics(),
                creativeSpace.getAmenities(),
                creativeSpace.getOperatingHours(),
                creativeSpace.getPolicies(),
                creativeSpace.getImages(),
                creativeSpace.getAvailabilityStatus(),
                creativeSpace.getCreatedAt(),
                creativeSpace.getUpdatedAt());
    }
}