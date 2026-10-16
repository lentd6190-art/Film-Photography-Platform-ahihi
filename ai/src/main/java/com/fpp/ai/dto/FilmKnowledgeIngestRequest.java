package com.fpp.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.Map;

public record FilmKnowledgeIngestRequest(
    @NotBlank(message = "document_id không được để trống") String documentId,
    @NotBlank(message = "category không được để trống") String category,
    @NotBlank(message = "title không được để trống") String title,
    @NotBlank(message = "content không được để trống") String content,
    Map<String, Object> metadata,
    LocalDateTime ingestedAt
) {}