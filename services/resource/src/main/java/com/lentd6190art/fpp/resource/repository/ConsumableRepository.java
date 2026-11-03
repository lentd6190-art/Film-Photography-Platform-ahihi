package com.lentd6190art.fpp.resource.repository;

import com.lentd6190art.fpp.resource.model.Consumable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConsumableRepository extends JpaRepository<Consumable, UUID> {
}
