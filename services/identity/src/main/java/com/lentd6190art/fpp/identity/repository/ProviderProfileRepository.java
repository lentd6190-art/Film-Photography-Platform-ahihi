
package com.lentd6190art.fpp.identity.repository;

import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.ProviderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProviderProfileRepository
        extends JpaRepository<ProviderProfile, UUID> {

    boolean existsByUser_Email(String email);

    Page<ProviderProfile> findByStatusOrderByCreatedAtAsc(
            ProviderStatus status,
            Pageable pageable
    );
}
