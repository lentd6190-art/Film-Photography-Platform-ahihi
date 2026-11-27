
package com.lentd6190art.fpp.resource.service;

import com.lentd6190art.fpp.resource.config.ProviderAuthenticationDetails;
import com.lentd6190art.fpp.resource.dto.request.ConsumableAttributes;
import com.lentd6190art.fpp.resource.dto.request.CreativeSpaceAttributes;
import com.lentd6190art.fpp.resource.dto.request.EquipmentAttributes;
import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.response.PageResponse;
import com.lentd6190art.fpp.resource.dto.response.PaginationMetadata;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;
import com.lentd6190art.fpp.resource.model.Consumable;
import com.lentd6190art.fpp.resource.model.CreativeSpace;
import com.lentd6190art.fpp.resource.model.Equipment;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.repository.ConsumableRepository;
import com.lentd6190art.fpp.resource.repository.CreativeSpaceRepository;
import com.lentd6190art.fpp.resource.repository.EquipmentRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        ObjectMapper objectMapper) {
                this.creativeSpaceRepository = creativeSpaceRepository;
                this.equipmentRepository = equipmentRepository;
                this.consumableRepository = consumableRepository;
                this.objectMapper = objectMapper;
        }

        // ==================== CREATE RESOURCE ====================

        @Transactional
        public ResourceResponse createResource(
                        ResourceRequest request,
                        Authentication authentication) {
                validateRequest(request);

                UUID providerId = getProviderId(authentication);

                return switch (request.resourceType()) {
                        case CREATIVE_SPACE -> createCreativeSpace(request, providerId);
                        case EQUIPMENT -> createEquipment(request, providerId);
                        case CONSUMABLE -> createConsumable(request, providerId);
                };
        }

        private ResourceResponse createCreativeSpace(ResourceRequest request, UUID providerId) {
                CreativeSpaceAttributes attributes = objectMapper.convertValue(
                                request.attributes(),
                                CreativeSpaceAttributes.class);

                if (attributes.address() == null || attributes.address().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Creative space address is required");
                }

                if (attributes.capacity() == null || attributes.capacity() <= 0) {
                        throw new IllegalArgumentException(
                                        "Capacity must be greater than zero");
                }

                CreativeSpace entity = new CreativeSpace();
                entity.setProviderId(providerId);
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
                                                : BigDecimal.ZERO);
                entity.setStatus(
                                attributes.status() != null
                                                ? attributes.status()
                                                : "ACTIVE");

                CreativeSpace saved = creativeSpaceRepository.save(entity);

                return toResourceResponse(saved);
        }

        private ResourceResponse createEquipment(ResourceRequest request, UUID providerId) {
                EquipmentAttributes attributes = objectMapper.convertValue(
                        request.attributes(), EquipmentAttributes.class);

                // Validate category
                if (attributes.category() == null || attributes.category().isBlank()) {
                        throw new IllegalArgumentException("Equipment category is required");
                }
                if (attributes.category().length() > 100) {
                        throw new IllegalArgumentException("Equipment category must not exceed 100 characters");
                }

                // Validate brand and model
                if (attributes.brand() != null && attributes.brand().length() > 100) {
                        throw new IllegalArgumentException("Equipment brand must not exceed 100 characters");
                }
                if (attributes.model() != null && attributes.model().length() > 100) {
                        throw new IllegalArgumentException("Equipment model must not exceed 100 characters");
                }

                // Apply defaults and validate equipment condition
                String condition = attributes.equipmentCondition() != null
                        ? attributes.equipmentCondition() : "GOOD";

                if (!java.util.Set.of(
                        "NEW", "EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"
                ).contains(condition)) {
                        throw new IllegalArgumentException("Invalid equipment condition");
                }

                // Apply defaults and validate availability status
                String status = attributes.status() != null
                        ? attributes.status() : "AVAILABLE";

                if (!java.util.Set.of(
                        "AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"
                ).contains(status)) {
                        throw new IllegalArgumentException("Invalid equipment status");
                }

                // Apply default rental price and reject negative values
                BigDecimal rentalPrice = attributes.rentalPrice() != null
                        ? attributes.rentalPrice() : BigDecimal.ZERO;

                if (rentalPrice.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("Rental price must not be negative");
                }

                // Build and persist equipment
                Equipment entity = new Equipment();
                entity.setProviderId(providerId);
                entity.setName(request.name());
                entity.setDescription(request.description());
                entity.setCategory(attributes.category());
                entity.setBrand(attributes.brand());
                entity.setModel(attributes.model());
                entity.setEquipmentCondition(condition);
                entity.setStatus(status);
                entity.setRentalPrice(rentalPrice);

                Equipment saved = equipmentRepository.save(entity);
                return toResourceResponse(saved);
        }

        private ResourceResponse createConsumable(
                        ResourceRequest request,
                        UUID providerId) {

                ConsumableAttributes attributes = objectMapper.convertValue(
                        request.attributes(),
                        ConsumableAttributes.class);

                // Validate category
                String category = attributes.category() != null
                        ? attributes.category().trim()
                        : null;

                if (category == null || category.isBlank()) {
                        throw new IllegalArgumentException("Consumable category is required");
                }
                if (category.length() > 100) {
                        throw new IllegalArgumentException(
                                "Consumable category must not exceed 100 characters");
                }

                // Apply defaults and validate stock quantity
                Integer stockQuantity = attributes.stockQuantity() != null
                        ? attributes.stockQuantity() : 0;

                if (stockQuantity < 0) {
                        throw new IllegalArgumentException("Stock quantity must not be negative");
                }

                // Apply defaults and validate reorder level
                Integer reorderLevel = attributes.reorderLevel() != null
                        ? attributes.reorderLevel() : 0;

                if (reorderLevel < 0) {
                        throw new IllegalArgumentException("Reorder level must not be negative");
                }

                // Apply defaults and validate unit price
                BigDecimal unitPrice = attributes.unitPrice() != null
                        ? attributes.unitPrice() : BigDecimal.ZERO;

                if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException("Unit price must not be negative");
                }

                // Apply defaults and validate unit
                String unit = attributes.unit() != null
                        ? attributes.unit().trim() : "unit";

                if (unit.isBlank()) {
                        throw new IllegalArgumentException("Consumable unit is required");
                }
                if (unit.length() > 50) {
                        throw new IllegalArgumentException(
                                "Consumable unit must not exceed 50 characters");
                }

                // Apply defaults and validate status
                String status = attributes.status() != null
                        ? attributes.status() : "ACTIVE";

                if (!java.util.Set.of("ACTIVE", "INACTIVE").contains(status)) {
                        throw new IllegalArgumentException("Invalid consumable status");
                }

                // Build and persist consumable
                Consumable entity = new Consumable();
                entity.setProviderId(providerId);
                entity.setName(request.name());
                entity.setDescription(request.description());
                entity.setCategory(category);
                entity.setStockQuantity(stockQuantity);
                entity.setReorderLevel(reorderLevel);
                entity.setUnitPrice(unitPrice);
                entity.setUnit(unit);
                entity.setExpiryDate(attributes.expiryDate());
                entity.setStatus(status);

                Consumable saved = consumableRepository.save(entity);

                return toResourceResponse(saved);
        }

        // ==================== UPDATE RESOURCE ====================

        @Transactional
        public ResourceResponse updateResource(
                        ResourceType resourceType,
                        UUID id,
                        ResourceRequest request,
                        Authentication authentication) {
                if (resourceType == null) {
                        throw new IllegalArgumentException(
                                        "Resource type is required");
                }

                if (id == null) {
                        throw new IllegalArgumentException(
                                        "Resource ID is required");
                }

                validateRequest(request);
                UUID providerId = getProviderId(authentication);

                if (request.resourceType() != resourceType) {
                        throw new IllegalArgumentException(
                                        "Resource type in request does not match URL");
                }

                return switch (resourceType) {
                        case CREATIVE_SPACE ->
                                updateCreativeSpace(id, request, providerId);

                        case EQUIPMENT ->
                                updateEquipment(id, request, providerId);

                        case CONSUMABLE ->
                                updateConsumable(id, request, providerId);
                };
        }

        private ResourceResponse updateCreativeSpace(
                        UUID id,
                        ResourceRequest request,
                        UUID providerId) {
                CreativeSpace entity = creativeSpaceRepository.findByIdAndProviderId(id, providerId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                        "Creative space not found: " + id));

                CreativeSpaceAttributes attributes = objectMapper.convertValue(
                                request.attributes(),
                                 CreativeSpaceAttributes.class);

                if (attributes.address() == null || attributes.address().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Creative space address is required");
                }

                if (attributes.capacity() == null || attributes.capacity() <= 0) {
                        throw new IllegalArgumentException(
                                        "Capacity must be greater than zero");
                }

                if (attributes.areaSqm() != null
                                && attributes.areaSqm().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException(
                                        "Area must be greater than zero");
                }

                if (attributes.latitude() != null
                                && (attributes.latitude().compareTo(new BigDecimal("-90")) < 0
                                                || attributes.latitude().compareTo(new BigDecimal("90")) > 0)) {
                        throw new IllegalArgumentException(
                                        "Latitude must be between -90 and 90");
                }

                if (attributes.longitude() != null
                                && (attributes.longitude().compareTo(new BigDecimal("-180")) < 0
                                                || attributes.longitude().compareTo(new BigDecimal("180")) > 0)) {
                        throw new IllegalArgumentException(
                                        "Longitude must be between -180 and 180");
                }

                BigDecimal hourlyPrice = attributes.hourlyPrice() != null
                                ? attributes.hourlyPrice()
                                : entity.getHourlyPrice();

                if (hourlyPrice.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException(
                                        "Hourly price must not be negative");
                }

                entity.setName(request.name());
                entity.setDescription(request.description());
                entity.setAddress(attributes.address());
                entity.setLatitude(attributes.latitude());
                entity.setLongitude(attributes.longitude());
                entity.setCapacity(attributes.capacity());
                entity.setAreaSqm(attributes.areaSqm());
                entity.setHourlyPrice(hourlyPrice);
                entity.setStatus(
                                attributes.status() != null
                                                ? attributes.status()
                                                : entity.getStatus());

                CreativeSpace updated = creativeSpaceRepository.save(entity);

                return toResourceResponse(updated);
        }

        private ResourceResponse updateEquipment(
                        UUID id,
                        ResourceRequest request,
                UUID providerId) {
                Equipment entity = equipmentRepository.findByIdAndProviderId(id, providerId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                        "Equipment not found: " + id));

                EquipmentAttributes attributes = objectMapper.convertValue(
                                request.attributes(),
                                EquipmentAttributes.class);

                if (attributes.category() == null
                                || attributes.category().isBlank()) {
                        throw new IllegalArgumentException(
                                        "Equipment category is required");
                }

                if (attributes.category().length() > 100) {
                        throw new IllegalArgumentException(
                                        "Equipment category must not exceed 100 characters");
                }

                if (attributes.brand() != null && attributes.brand().length() > 100) {
                        throw new IllegalArgumentException(
                                        "Equipment brand must not exceed 100 characters");
                }

                if (attributes.model() != null && attributes.model().length() > 100) {
                        throw new IllegalArgumentException(
                                        "Equipment model must not exceed 100 characters");
                }

                String equipmentCondition = attributes.equipmentCondition() != null
                                ? attributes.equipmentCondition()
                                : entity.getEquipmentCondition();

                if (!java.util.Set.of(
                                "NEW", "EXCELLENT", "GOOD",
                                "FAIR", "POOR", "DAMAGED")
                                .contains(equipmentCondition)) {
                        throw new IllegalArgumentException(
                                        "Invalid equipment condition");
                }

                String status = attributes.status() != null
                                ? attributes.status()
                                : entity.getStatus();

                if (!java.util.Set.of(
                                "AVAILABLE", "RENTED",
                                "MAINTENANCE", "INACTIVE")
                                .contains(status)) {
                        throw new IllegalArgumentException(
                                        "Invalid equipment status");
                }

                BigDecimal rentalPrice = attributes.rentalPrice() != null
                                ? attributes.rentalPrice()
                                : entity.getRentalPrice();

                if (rentalPrice.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException(
                                        "Rental price must not be negative");
                }

                entity.setName(request.name());
                entity.setDescription(request.description());
                entity.setCategory(attributes.category());
                if (attributes.brand() != null) {
                        entity.setBrand(attributes.brand());
                }

                if (attributes.model() != null) {
                        entity.setModel(attributes.model());
                }
                entity.setEquipmentCondition(equipmentCondition);
                entity.setStatus(status);
                entity.setRentalPrice(rentalPrice);

                Equipment updated = equipmentRepository.save(entity);

                return toResourceResponse(updated);
        }

        private ResourceResponse updateConsumable(
                        UUID id,
                        ResourceRequest request,
                        UUID providerId) {
                Consumable entity = consumableRepository.findByIdAndProviderId(id, providerId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                        "Consumable not found: " + id));

                ConsumableAttributes attributes = objectMapper.convertValue(
                                request.attributes(),
                                ConsumableAttributes.class);

                String category = attributes.category() != null
                        ? attributes.category().trim()
                        : entity.getCategory();

                if (category == null || category.isBlank()) {
                        throw new IllegalArgumentException(
                                "Consumable category is required");
                }

                String status = attributes.status() != null
                        ? attributes.status()
                        : entity.getStatus();

                if (!java.util.Set.of("ACTIVE", "INACTIVE").contains(status)) {
                        throw new IllegalArgumentException("Invalid consumable status");
                }

                entity.setStatus(status);

                if (category.length() > 100) {
                        throw new IllegalArgumentException(
                                        "Consumable category must not exceed 100 characters");
                }

                Integer stockQuantity = attributes.stockQuantity() != null
                                ? attributes.stockQuantity()
                                : entity.getStockQuantity();

                if (stockQuantity < 0) {
                        throw new IllegalArgumentException(
                                        "Stock quantity must not be negative");
                }

                Integer reorderLevel = attributes.reorderLevel() != null
                                ? attributes.reorderLevel()
                                : entity.getReorderLevel();

                if (reorderLevel < 0) {
                        throw new IllegalArgumentException(
                                        "Reorder level must not be negative");
                }

                BigDecimal unitPrice = attributes.unitPrice() != null
                                ? attributes.unitPrice()
                                : entity.getUnitPrice();

                if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                        throw new IllegalArgumentException(
                                        "Unit price must not be negative");
                }

                String unit = attributes.unit() != null
                        ? attributes.unit().trim()
                        : entity.getUnit();

                if (unit.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Consumable unit is required");
                }

                if (unit.length() > 50) {
                        throw new IllegalArgumentException(
                                        "Consumable unit must not exceed 50 characters");
                }

                entity.setName(request.name());
                entity.setDescription(request.description());
                entity.setCategory(category);
                entity.setStockQuantity(stockQuantity);
                entity.setReorderLevel(reorderLevel);
                entity.setUnitPrice(unitPrice);
                entity.setUnit(unit);
                if (attributes.expiryDate() != null) {
                        entity.setExpiryDate(attributes.expiryDate());
                }

                Consumable updated = consumableRepository.save(entity);

                return toResourceResponse(updated);
        }

        // ==================== GET RESOURCE DETAIL ====================

        @Transactional(readOnly = true)
        public PageResponse<ResourceResponse> getResources(
                        ResourceType resourceType,
                        int page,
                        int size,
                        Authentication authentication) {

                if (resourceType == null) {
                        throw new IllegalArgumentException(
                                        "Resource type is required");
                }

                if (page < 0) {
                        throw new IllegalArgumentException(
                                        "Page index must not be negative");
                }

                if (size < 1 || size > 100) {
                        throw new IllegalArgumentException(
                                        "Page size must be between 1 and 100");
                }

                UUID providerId = getProviderId(authentication);
                Pageable pageable = PageRequest.of(page, size);

                return switch (resourceType) {
                        case CREATIVE_SPACE -> toPageResponse(
                                        creativeSpaceRepository
                                                        .findAllByProviderId(providerId, pageable)
                                                        .map(this::toResourceResponse));

                        case EQUIPMENT -> toPageResponse(
                                        equipmentRepository
                                                        .findAllByProviderId(providerId, pageable)
                                                        .map(this::toResourceResponse));

                        case CONSUMABLE -> toPageResponse(
                                        consumableRepository
                                                        .findAllByProviderId(providerId, pageable)
                                                        .map(this::toResourceResponse));
                };
        }

        // ==================== PAGINATION RESPONSE MAPPING ====================

        private PageResponse<ResourceResponse> toPageResponse(
                        Page<ResourceResponse> resourcePage) {

                PaginationMetadata metadata = new PaginationMetadata(
                                resourcePage.getNumber(),
                                resourcePage.getSize(),
                                resourcePage.getTotalElements(),
                                resourcePage.getTotalPages(),
                                resourcePage.hasNext(),
                                resourcePage.hasPrevious());

                return new PageResponse<>(
                                resourcePage.getContent(),
                                metadata);
        }

        // ==================== GET RESOURCE BY ID ====================

        @Transactional(readOnly = true)
        public ResourceResponse getResource(
                        ResourceType resourceType,
                        UUID id,
                        Authentication authentication) {

                if (resourceType == null) {
                        throw new IllegalArgumentException(
                                        "Resource type is required");
                }

                if (id == null) {
                        throw new IllegalArgumentException(
                                        "Resource ID is required");
                }

                UUID providerId = getProviderId(authentication);

                return switch (resourceType) {
                        case CREATIVE_SPACE -> toResourceResponse(
                                        creativeSpaceRepository.findByIdAndProviderId(id, providerId)
                                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                                        "Creative space not found: " + id)));

                        case EQUIPMENT -> toResourceResponse(
                                        equipmentRepository.findByIdAndProviderId(id, providerId)
                                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                                        "Equipment not found: " + id)));

                        case CONSUMABLE -> toResourceResponse(
                                        consumableRepository.findByIdAndProviderId(id, providerId)
                                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                                        "Consumable not found: " + id)));
                };
        }

        // ==================== DELETE RESOURCE ====================
        @Transactional
        public void deleteResource(
                ResourceType resourceType,
                UUID id,
                Authentication authentication) {

                if (resourceType == null) {
                        throw new IllegalArgumentException(
                                "Resource type is required");
                }

                if (id == null) {
                        throw new IllegalArgumentException(
                                "Resource ID is required");
                }

                UUID providerId = getProviderId(authentication);

                switch (resourceType) {
                        case CREATIVE_SPACE -> {
                        CreativeSpace entity = creativeSpaceRepository
                                .findByIdAndProviderId(id, providerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Creative space not found: " + id));

                        creativeSpaceRepository.delete(entity);
                        }

                        case EQUIPMENT -> {
                        Equipment entity = equipmentRepository
                                .findByIdAndProviderId(id, providerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Equipment not found: " + id));

                        equipmentRepository.delete(entity);
                        }

                        case CONSUMABLE -> {
                        Consumable entity = consumableRepository
                                .findByIdAndProviderId(id, providerId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Consumable not found: " + id));

                        consumableRepository.delete(entity);
                        }
                }
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
                                entity.getUpdatedAt().toInstant());
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
                                entity.getUpdatedAt().toInstant());
        }

        private ResourceResponse toResourceResponse(Consumable entity) {
                Map<String, Object> attributes = new LinkedHashMap<>();

                attributes.put("category", entity.getCategory());
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
                                entity.getUpdatedAt().toInstant());
        }

        private UUID getProviderId(Authentication authentication) {
                if (authentication == null) {
                        throw new AccessDeniedException(
                                "Authenticated provider access is required");
                }

                if (!(authentication.getDetails()
                        instanceof ProviderAuthenticationDetails details)
                        || details.providerId() == null) {
                        throw new AccessDeniedException(
                                "Approved provider identity is required");
                }

                return details.providerId();
        }

        // ==================== VALIDATION ====================

        private void validateRequest(ResourceRequest request) {
                if (request == null) {
                        throw new IllegalArgumentException("Request must not be null");
                }

                if (request.resourceType() == null) {
                        throw new IllegalArgumentException("Resource type is required");
                }

                if (request.name() == null || request.name().isBlank()) {
                        throw new IllegalArgumentException("Resource name is required");
                }

                if (request.name().length() > 200) {
                        throw new IllegalArgumentException(
                                "Resource name must not exceed 200 characters");
                }

                if (request.attributes() == null) {
                        throw new IllegalArgumentException("Resource attributes are required");
                }
        }
}
