package com.lentd6190art.fpp.resource.repository;

import com.lentd6190art.fpp.resource.model.CreativeSpace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CreativeSpaceRepository extends JpaRepository<CreativeSpace, UUID> {
}
