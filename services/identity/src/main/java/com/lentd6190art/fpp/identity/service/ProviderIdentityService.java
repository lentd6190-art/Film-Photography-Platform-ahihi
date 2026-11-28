package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.ProviderStatus;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.ProviderProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProviderIdentityService {

    private static final String SERVICE_PROVIDER_ROLE = "SERVICE_PROVIDER";

    private final ProviderProfileRepository providerProfileRepository;

    public ProviderIdentityService(
            ProviderProfileRepository providerProfileRepository
    ) {
        this.providerProfileRepository = providerProfileRepository;
    }

    @Transactional(readOnly = true)
    public UUID resolveProviderId(User user) {
        boolean isServiceProvider = user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(SERVICE_PROVIDER_ROLE::equals);

        if (!isServiceProvider) {
            return null;
        }

        ProviderProfile profile = providerProfileRepository
                .findByUser_Id(user.getId())
                .orElse(null);

        if (profile == null || profile.getStatus() != ProviderStatus.APPROVED) {
            return null;
        }

        return profile.getId();
    }
}