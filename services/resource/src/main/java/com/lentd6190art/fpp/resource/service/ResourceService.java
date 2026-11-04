
package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.dto.request.ConsumableAttributes;
import com.lentd6190art.fpp.resource.dto.request.CreativeSpaceAttributes;
import com.lentd6190art.fpp.resource.dto.request.EquipmentAttributes;
import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;
import com.lentd6190art.fpp.resource.model.Consumable;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;
import com.lentd6190art.fpp.resource.dto.response.PageResponse;
import com.lentd6190art.fpp.resource.dto.response.PaginationMetadata;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ResourceService {

    private final CreativeSpaceRepository creativeSpaceRepository;
    private final EquipmentRepository equipmentRepository;
    private final ConsumableRepository consumableRepository;
    private final ObjectMapper objectMapper;

    public ResourceService(
            CreativeSpaceRepository creativeSpaceRepository,
            EquipmentRepository equipmentRepository,
            ConsumableRepository consumableRepository,
            ObjectMapper objectMapper
    ) {
        this.creativeSpaceRepository = creativeSpaceRepository;
        this.equipmentRepository = equipmentRepository;
        this.consumableRepository = consumableRepository;
        this.objectMapper = objectMapper;
    }

    // ==================== CREATE RESOURCE ====================

    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        validateRequest(request);

        return switch (request.resourceType()) {
            case CREATIVE_SPACE -> createCreativeSpace(request);
            case EQUIPMENT -> createEquipment(request);
            case CONSUMABLE -> createConsumable(request);
        };
    }

    private ResourceResponse createCreativeSpace(ResourceRequest request) {
        CreativeSpaceAttributes attributes = objectMapper.convertValue(
                request.attributes(),
                CreativeSpaceAttributes.class
        );

        if (attributes.address() == null || attributes.address().isBlank()) {
            throw new IllegalArgumentException(
                    "Creative space address is required"
            );
        }

        if (attributes.capacity() == null || attributes.capacity() <= 0) {
            throw new IllegalArgumentException(
                    "Capacity must be greater than zero"
            );
        }

        CreativeSpace entity = new CreativeSpace();
        entity.setProviderId(request.providerId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setAddress(attributes.address());
        entity.setLatitude(attributes.latitude());
        entity.setLongitude(attributes.longitude());
        entity.setCapacity(attributes.capacity());
        entity.setAreaSqm(attributes.areaSqm());
        entity.setHourlyPrice(
                attributes.hourlyPrice() != null
                        ? attributes.hourlyPrice()
                        : BigDecimal.ZERO
        );
        entity.setStatus(
                attributes.status() != null
                        ? attributes.status()
                        : "ACTIVE"
        );

        CreativeSpace saved = creativeSpaceRepository.save(entity);

        return toResourceResponse(saved);
    }

    private ResourceResponse createEquipment(ResourceRequest request) {
        EquipmentAttributes attributes = objectMapper.convertValue(
                request.attributes(),
                EquipmentAttributes.class
        );

        if (attributes.category() == null || attributes.category().isBlank()) {
            throw new IllegalArgumentException(
                    "Equipment category is required"
            );
        }

        Equipment entity = new Equipment();
        entity.setProviderId(request.providerId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setCategory(attributes.category());
        entity.setBrand(attributes.brand());
        entity.setModel(attributes.model());
        entity.setEquipmentCondition(
                attributes.equipmentCondition() != null
                        ? attributes.equipmentCondition()
                        : "GOOD"
        );
        entity.setStatus(
                attributes.status() != null
                        ? attributes.status()
                        : "AVAILABLE"
        );
        entity.setRentalPrice(
                attributes.rentalPrice() != null
                        ? attributes.rentalPrice()
                        : BigDecimal.ZERO
        );

        Equipment saved = equipmentRepository.save(entity);

        return toResourceResponse(saved);
    }

    private ResourceResponse createConsumable(ResourceRequest request) {
        ConsumableAttributes attributes = objectMapper.convertValue(
                request.attributes(),
                ConsumableAttributes.class
        );

        Consumable entity = new Consumable();
        entity.setProviderId(request.providerId());
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setStockQuantity(
                attributes.stockQuantity() != null
                        ? attributes.stockQuantity()
                        : 0
        );
        entity.setReorderLevel(
                attributes.reorderLevel() != null
                        ? attributes.reorderLevel()
                        : 0
        );
        entity.setUnitPrice(
                attributes.unitPrice() != null
                        ? attributes.unitPrice()
                        : BigDecimal.ZERO
        );
        entity.setUnit(
                attributes.unit() != null
                        ? attributes.unit()
                        : "unit"
        );
        entity.setExpiryDate(attributes.expiryDate());
        entity.setStatus(
                attributes.status() != null
                        ? attributes.status()
                        : "ACTIVE"
        );

        Consumable saved = consumableRepository.save(entity);

        return toResourceResponse(saved);
    }

    // ==================== GET RESOURCE DETAIL ====================

    @Transactional(readOnly = true)
    public ResourceResponse getResource(ResourceType resourceType, UUID id) {
        if (resourceType == null) {
            throw new IllegalArgumentException(
                    "Resource type is required"
            );
        }

        if (id == null) {
            throw new IllegalArgumentException(
                    "Resource ID is required"
            );
        }

        return switch (resourceType) {
            case CREATIVE_SPACE -> creativeSpaceRepository.findById(id)
                    .map(this::toResourceResponse)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Creative space not found: " + id
                    ));

            case EQUIPMENT -> equipmentRepository.findById(id)
                    .map(this::toResourceResponse)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Equipment not found: " + id
                    ));

            case CONSUMABLE -> consumableRepository.findById(id)
                    .map(this::toResourceResponse)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Consumable not found: " + id
                    ));
        };
    }

    // ==================== GET RESOURCES WITH PAGINATION ====================

    @Transactional(readOnly = true)
    public PageResponse<ResourceResponse> getResources(
            ResourceType resourceType,
            int page,
            int size
    ) {
        if (resourceType == null) {
            throw new IllegalArgumentException(
                    "Resource type is required"
            );
        }

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page index must not be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }

        Pageable pageable = PageRequest.of(page, size);

        return switch (resourceType) {
            case CREATIVE_SPACE -> toPageResponse(
                    creativeSpaceRepository.findAll(pageable)
                            .map(this::toResourceResponse)
            );

            case EQUIPMENT -> toPageResponse(
                    equipmentRepository.findAll(pageable)
                            .map(this::toResourceResponse)
            );

            case CONSUMABLE -> toPageResponse(
                    consumableRepository.findAll(pageable)
                            .map(this::toResourceResponse)
            );
        };
    }

    private PageResponse<ResourceResponse> toPageResponse(
            Page<ResourceResponse> resourcePage
    ) {
        PaginationMetadata metadata = new PaginationMetadata(
                resourcePage.getNumber(),
                resourcePage.getSize(),
                resourcePage.getTotalElements(),
                resourcePage.getTotalPages(),
                resourcePage.hasNext(),
                resourcePage.hasPrevious()
        );

        return new PageResponse<>(
                resourcePage.getContent(),
                metadata
        );
    }

    // ==================== ENTITY TO RESPONSE MAPPING ====================

    private ResourceResponse toResourceResponse(CreativeSpace entity) {
        Map<String, Object> attributes = new LinkedHashMap<>();

        attributes.put("address", entity.getAddress());
        attributes.put("latitude", entity.getLatitude());
        attributes.put("longitude", entity.getLongitude());
        attributes.put("capacity", entity.getCapacity());
        attributes.put("areaSqm", entity.getAreaSqm());
        attributes.put("hourlyPrice", entity.getHourlyPrice());

        return new ResourceResponse(
                entity.getId(),
                ResourceType.CREATIVE_SPACE,
                entity.getProviderId(),
                entity.getName(),
                entity.getDescription(),
                entity.getStatus(),
                attributes,
                entity.getCreatedAt().toInstant(),
                entity.getUpdatedAt().toInstant()
        );
    }

    private ResourceResponse toResourceResponse(Equipment entity) {
        Map<String, Object> attributes = new LinkedHashMap<>();

        attributes.put("category", entity.getCategory());
        attributes.put("brand", entity.getBrand());
        attributes.put("model", entity.getModel());
        attributes.put("equipmentCondition", entity.getEquipmentCondition());
        attributes.put("rentalPrice", entity.getRentalPrice());

        return new ResourceResponse(
                entity.getId(),
                ResourceType.EQUIPMENT,
                entity.getProviderId(),
                entity.getName(),
                entity.getDescription(),
                entity.getStatus(),
                attributes,
                entity.getCreatedAt().toInstant(),
                entity.getUpdatedAt().toInstant()
        );
    }

    private ResourceResponse toResourceResponse(Consumable entity) {
        Map<String, Object> attributes = new LinkedHashMap<>();

        attributes.put("stockQuantity", entity.getStockQuantity());
        attributes.put("reorderLevel", entity.getReorderLevel());
        attributes.put("unitPrice", entity.getUnitPrice());
        attributes.put("unit", entity.getUnit());
        attributes.put("expiryDate", entity.getExpiryDate());

        return new ResourceResponse(
                entity.getId(),
                ResourceType.CONSUMABLE,
                entity.getProviderId(),
                entity.getName(),
                entity.getDescription(),
                entity.getStatus(),
                attributes,
                entity.getCreatedAt().toInstant(),
                entity.getUpdatedAt().toInstant()
        );
    }

    // ==================== VALIDATION ====================

    private void validateRequest(ResourceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Request must not be null"
            );
        }

        if (request.resourceType() == null) {
            throw new IllegalArgumentException(
                    "Resource type is required"
            );
        }

        if (request.providerId() == null) {
            throw new IllegalArgumentException(
                    "Provider ID is required"
            );
        }

        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException(
                    "Resource name is required"
            );
        }

        if (request.attributes() == null) {
            throw new IllegalArgumentException(
                    "Resource attributes are required"
            );
        }
    }
}
