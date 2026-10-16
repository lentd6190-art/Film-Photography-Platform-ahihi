package com.fpp.ai.dto;

public record IngestResponse(
    String status,
    String documentId,
    String message
) {}