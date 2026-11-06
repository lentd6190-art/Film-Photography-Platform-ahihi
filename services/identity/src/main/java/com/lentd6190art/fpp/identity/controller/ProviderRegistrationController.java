package com.lentd6190art.fpp.identity.controller;

import com.lentd6190art.fpp.identity.dto.ProviderRegisterRequest;
import com.lentd6190art.fpp.identity.dto.ProviderRegisterResponse;
import com.lentd6190art.fpp.identity.service.ProviderRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/register")
public class ProviderRegistrationController {

    private final ProviderRegistrationService providerRegistrationService;

    public ProviderRegistrationController(
            ProviderRegistrationService providerRegistrationService
    ) {
        this.providerRegistrationService = providerRegistrationService;
    }

    @PostMapping("/provider")
    public ResponseEntity<ProviderRegisterResponse> registerProvider(
            @Valid @RequestBody ProviderRegisterRequest request
    ) {
        ProviderRegisterResponse response =
                providerRegistrationService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}