
package com.lentd6190art.fpp.resource.exception;

import com.lentd6190art.fpp.resource.dto.request.ConsumableAttributes;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.json.JsonMapper;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GlobalExceptionHandlerTest {

    @Test
    void handleJacksonException_shouldReturnBadRequest() {
        ObjectMapper objectMapper = JsonMapper.builder().build();

        JacksonException exception = assertThrows(
                InvalidFormatException.class,
                () -> objectMapper.convertValue(
                        Map.of("stockQuantity", "not-a-number"),
                        ConsumableAttributes.class));

        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<Map<String, Object>> response =
                handler.handleJacksonException(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().get("status"));
        assertEquals("Invalid request data", response.getBody().get("message"));
    }
}
