
package com.lentd6190art.fpp.resource.repository;

import com.lentd6190art.fpp.resource.model.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    Page<Equipment> findAllByProviderId(UUID providerId, Pageable pageable);

    Optional<Equipment> findByIdAndProviderId(UUID id, UUID providerId);
}
