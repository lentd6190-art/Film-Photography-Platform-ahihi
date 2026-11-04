
package com.lentd6190art.fpp.resource.controller;

import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.response.PageResponse;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.service.ResourceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Create resource
    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(
            @RequestBody ResourceRequest request
    ) {
        ResourceResponse response = resourceService.createResource(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get resources with pagination
    @GetMapping("/{type}")
    public ResponseEntity<PageResponse<ResourceResponse>> getResources(
            @PathVariable ResourceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ResourceResponse> response =
                resourceService.getResources(type, page, size);

        return ResponseEntity.ok(response);
    }

    // Get resource detail
    @GetMapping("/{type}/{id}")
    public ResponseEntity<ResourceResponse> getResource(
            @PathVariable ResourceType type,
            @PathVariable UUID id
    ) {
        ResourceResponse response = resourceService.getResource(type, id);

        return ResponseEntity.ok(response);
    }
}
