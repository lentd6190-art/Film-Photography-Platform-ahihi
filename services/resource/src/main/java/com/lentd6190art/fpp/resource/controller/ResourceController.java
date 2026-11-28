package com.lentd6190art.fpp.resource.controller;

import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.response.PageResponse;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.service.ResourceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@Tag(
        name = "Resources",
        description = "Provider APIs for managing equipment and consumables"
)
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    @Operation(
            summary = "Create a resource",
            description = "Create an equipment or consumable resource for the authenticated provider."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Resource created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid resource data"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Provider access required")
    })
    public ResponseEntity<ResourceResponse> createResource(
            @RequestBody ResourceRequest request,
            Authentication authentication) {

        ResourceResponse response = resourceService.createResource(request, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{type}")
    @Operation(
            summary = "Get provider resources",
            description = "Retrieve the authenticated provider's equipment or consumables with pagination."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resources retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid resource type or pagination parameters"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Provider access required")
    })
    public ResponseEntity<PageResponse<ResourceResponse>> getResources(
            @PathVariable ResourceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        PageResponse<ResourceResponse> response =
                resourceService.getResources(type, page, size, authentication);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{type}/{id}")
    @Operation(
            summary = "Get resource details",
            description = "Retrieve the details of a specific equipment or consumable owned by the authenticated provider."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resource retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Provider access required"),
            @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<ResourceResponse> getResource(
            @PathVariable ResourceType type,
            @PathVariable UUID id,
            Authentication authentication) {

        ResourceResponse response = resourceService.getResource(type, id, authentication);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{type}/{id}")
    @Operation(
            summary = "Update a resource",
            description = "Update an existing equipment or consumable owned by the authenticated provider."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resource updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid resource data"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Provider access required"),
            @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable ResourceType type,
            @PathVariable UUID id,
            @RequestBody ResourceRequest request,
            Authentication authentication) {

        ResourceResponse response = resourceService.updateResource(
                type,
                id,
                request,
                authentication);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{type}/{id}")
    @Operation(
            summary = "Delete a resource",
            description = "Delete an existing equipment or consumable owned by the authenticated provider."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Resource deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Authentication required"),
            @ApiResponse(responseCode = "403", description = "Provider access required"),
            @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<Void> deleteResource(
            @PathVariable ResourceType type,
            @PathVariable UUID id,
            Authentication authentication) {

        resourceService.deleteResource(type, id, authentication);

        return ResponseEntity.noContent().build();
    }
}
