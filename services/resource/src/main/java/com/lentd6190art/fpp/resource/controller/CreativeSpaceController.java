package com.lentd6190art.fpp.resource.controller;

import com.lentd6190art.fpp.resource.dto.CreativeSpaceRequest;
import com.lentd6190art.fpp.resource.dto.CreativeSpaceResponse;
import com.lentd6190art.fpp.resource.service.CreativeSpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/creative-spaces")
@Validated
@Tag(name = "Creative Spaces", description = "Provider creative space management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CreativeSpaceController {

    private final CreativeSpaceService creativeSpaceService;

    public CreativeSpaceController(CreativeSpaceService creativeSpaceService) {
        this.creativeSpaceService = creativeSpaceService;
    }

    @PostMapping
    @Operation(summary = "Create a creative space")
    public ResponseEntity<CreativeSpaceResponse> create(
            @Valid @RequestBody CreativeSpaceRequest request,
            Authentication authentication
    ) {
        CreativeSpaceResponse response =
                creativeSpaceService.create(request, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    @Operation(summary = "Get current provider's creative spaces")
    public ResponseEntity<Page<CreativeSpaceResponse>> getMyCreativeSpaces(
            Authentication authentication,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        Page<CreativeSpaceResponse> response =
                creativeSpaceService.getMyCreativeSpaces(
                        authentication,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get creative space details")
    public ResponseEntity<CreativeSpaceResponse> getById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        CreativeSpaceResponse response =
                creativeSpaceService.getById(id, authentication);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a creative space")
    public ResponseEntity<CreativeSpaceResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreativeSpaceRequest request,
            Authentication authentication
    ) {
        CreativeSpaceResponse response =
                creativeSpaceService.update(id, request, authentication);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a creative space")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        creativeSpaceService.delete(id, authentication);

        return ResponseEntity.noContent().build();
    }
}