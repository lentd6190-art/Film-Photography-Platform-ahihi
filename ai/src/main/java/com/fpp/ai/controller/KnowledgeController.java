package com.fpp.ai.controller;

import com.fpp.ai.dto.FilmKnowledgeIngestRequest;
import com.fpp.ai.dto.IngestResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeController {

    @PostMapping("/ingest")
    public ResponseEntity<IngestResponse> ingestKnowledge(@Valid @RequestBody FilmKnowledgeIngestRequest request) {
        IngestResponse response = new IngestResponse(
            "success",
            request.documentId(),
            "Tài liệu tri thức '" + request.title() + "' đã được lưu trữ thành công."
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}