package com.lentd6190art.fpp.resource.dto.response;

import java.util.List;

public record PageResponse<T>(
        List<T> data,
        PaginationMetadata pagination
) {}