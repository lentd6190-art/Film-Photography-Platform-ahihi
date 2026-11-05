
package com.lentd6190art.fpp.identity.repository;

import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProviderProfileRepository
        extends JpaRepository<ProviderProfile, UUID> {

    Optional<ProviderProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
