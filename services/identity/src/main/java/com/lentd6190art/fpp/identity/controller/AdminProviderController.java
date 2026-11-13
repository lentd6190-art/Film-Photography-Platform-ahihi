
package com.lentd6190art.fpp.identity.controller;

import com.lentd6190art.fpp.identity.dto.ProviderReviewResponse;
import com.lentd6190art.fpp.identity.service.ProviderReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/admin/providers")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminProviderController {

    private final ProviderReviewService providerReviewService;

    public AdminProviderController(
            ProviderReviewService providerReviewService
    ) {
        this.providerReviewService = providerReviewService;
    }

    @GetMapping("/pending")
    public Page<ProviderReviewResponse> getPendingProviders(
            @PageableDefault(
                    size = 10,
                    sort = "createdAt"
            ) Pageable pageable
    ) {
        return providerReviewService.getPendingProviders(pageable);
    }

    @GetMapping("/{id}")
    public ProviderReviewResponse getProviderDetail(
            @PathVariable UUID id
    ) {
        return providerReviewService.getProviderDetail(id);
    }

    @PatchMapping("/{id}/approve")
    public ProviderReviewResponse approveProvider(
            @PathVariable UUID id
    ) {
        return providerReviewService.approveProvider(id);
    }

    @PatchMapping("/{id}/reject")
    public ProviderReviewResponse rejectProvider(
            @PathVariable UUID id
    ) {
        return providerReviewService.rejectProvider(id);
    }
}
