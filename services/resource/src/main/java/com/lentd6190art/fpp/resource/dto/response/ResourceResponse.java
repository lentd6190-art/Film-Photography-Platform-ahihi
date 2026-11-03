package com.lentd6190art.fpp.resource.dto.response;

import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ResourceResponse(
    UUID id,
    ResourceType resourceType,
    UUID providerId,
    String name,
    String description,
    String status,
    Map<String, Object> attributes,
    Instant createdAt,
    Instant updatedAt
) {
}
