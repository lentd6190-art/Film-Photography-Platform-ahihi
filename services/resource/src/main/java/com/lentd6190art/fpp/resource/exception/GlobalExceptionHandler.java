package com.lentd6190art.fpp.resource.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(
                ResourceNotFoundException exception
        ) {
                return buildResponse(
                        HttpStatus.NOT_FOUND,
                        exception.getMessage()
                );
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(
                IllegalArgumentException exception
        ) {
                return buildResponse(
                        HttpStatus.BAD_REQUEST,
                        exception.getMessage()
                );
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<Map<String, Object>> handleResourceNotFound(
                NoResourceFoundException exception
        ) {
                return buildResponse(
                        HttpStatus.NOT_FOUND,
                        "The requested endpoint was not found"
                );
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGeneralException(
                Exception exception
        ) {
                return buildResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "An unexpected error occurred"
                );
        }

        private ResponseEntity<Map<String, Object>> buildResponse(
                HttpStatus status,
                String message
        ) {
                Map<String, Object> body = Map.of(
                        "timestamp", Instant.now(),
                        "status", status.value(),
                        "error", status.getReasonPhrase(),
                        "message", message
                );

                return ResponseEntity.status(status).body(body);
        }
}