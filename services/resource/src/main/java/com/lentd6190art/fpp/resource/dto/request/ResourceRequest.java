package com.lentd6190art.fpp.resource.dto.request;

import com.lentd6190art.fpp.resource.model.enums.ResourceType;

import java.util.Map;

public record ResourceRequest(
        ResourceType resourceType,
        String name,
        String description,
        Map<String, Object> attributes
) {
}