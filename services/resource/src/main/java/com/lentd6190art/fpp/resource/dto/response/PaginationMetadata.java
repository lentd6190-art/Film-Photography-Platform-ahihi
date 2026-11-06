package com.lentd6190art.fpp.resource.dto.response;

public record PaginationMetadata(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {}