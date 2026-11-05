
package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.dto.ProviderReviewResponse;
import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.ProviderStatus;
import com.lentd6190art.fpp.identity.repository.ProviderProfileRepository;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.repository.RoleRepository;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProviderReviewService {

        private final ProviderProfileRepository providerProfileRepository;
        private final RoleRepository roleRepository;
        private final UserRepository userRepository;

        public ProviderReviewService(
                        ProviderProfileRepository providerProfileRepository,
                        RoleRepository roleRepository,
                        UserRepository userRepository) {
                this.providerProfileRepository = providerProfileRepository;
                this.roleRepository = roleRepository;
                this.userRepository = userRepository;
        }

        @Transactional(readOnly = true)
        public Page<ProviderReviewResponse> getPendingProviders(
                        Pageable pageable) {
                return providerProfileRepository
                                .findByStatusOrderByCreatedAtAsc(
                                                ProviderStatus.PENDING,
                                                pageable)
                                .map(this::toResponse);
        }

        @Transactional(readOnly = true)
        public ProviderReviewResponse getProviderDetail(UUID id) {
                ProviderProfile profile = providerProfileRepository
                                .findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Provider profile not found"));

                return toResponse(profile);
        }

        @Transactional
        public ProviderReviewResponse approveProvider(UUID id) {
                ProviderProfile profile = providerProfileRepository
                                .findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Provider profile not found"));

                if (profile.getStatus() != ProviderStatus.PENDING) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Provider profile has already been reviewed");
                }

                Role providerRole = roleRepository
                                .findByName("SERVICE_PROVIDER")
                                .orElseThrow(() -> new IllegalStateException(
                                                "SERVICE_PROVIDER role not found"));

                profile.getUser().getRoles().add(providerRole);

                userRepository.save(profile.getUser());

                profile.setStatus(ProviderStatus.APPROVED);

                providerProfileRepository.save(profile);

                return toResponse(profile);
        }

        @Transactional
        public ProviderReviewResponse rejectProvider(UUID id) {
                ProviderProfile profile = providerProfileRepository
                                .findById(id)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Provider profile not found"));

                if (profile.getStatus() != ProviderStatus.PENDING) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Provider profile has already been reviewed");
                }

                profile.setStatus(ProviderStatus.REJECTED);

                providerProfileRepository.save(profile);

                return toResponse(profile);
        }

        private ProviderReviewResponse toResponse(
                        ProviderProfile profile) {
                return new ProviderReviewResponse(
                                profile.getId(),
                                profile.getUser().getId(),
                                profile.getUser().getEmail(),
                                profile.getUser().getFullName(),
                                profile.getBusinessName(),
                                profile.getPhone(),
                                profile.getAddress(),
                                profile.getServiceType(),
                                profile.getStatus(),
                                profile.getCreatedAt());
        }
}
