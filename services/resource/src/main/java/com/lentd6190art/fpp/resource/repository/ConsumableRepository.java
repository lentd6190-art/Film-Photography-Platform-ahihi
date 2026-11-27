package com.lentd6190art.fpp.resource.repository;

import com.lentd6190art.fpp.resource.model.Consumable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConsumableRepository extends JpaRepository<Consumable, UUID> {

    Page<Consumable> findAllByProviderId(UUID providerId, Pageable pageable);

    Optional<Consumable> findByIdAndProviderId(UUID id, UUID providerId);
}
