package com.lentd6190art.fpp.resource.controller;

import tools.jackson.databind.ObjectMapper;
import com.lentd6190art.fpp.resource.dto.CreativeSpaceRequest;
import com.lentd6190art.fpp.resource.dto.CreativeSpaceResponse;
import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;

import com.lentd6190art.fpp.resource.service.CreativeSpaceService;
import com.lentd6190art.fpp.resource.service.ResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.mockito.Mockito.verifyNoInteractions;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
                "app.jwt.secret=VGhpc0lzQVNlY3JldEtleUZvclRlc3RpbmdQdXJwb3Nlc09ubHk=",
                "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration,org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration,org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration"
})
class CreativeSpaceControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private CreativeSpaceService creativeSpaceService;

        @MockitoBean
        private ResourceService resourceService;

        private CreativeSpaceRequest createValidRequest() {
                return new CreativeSpaceRequest(
                                "My Darkroom",
                                "A professional darkroom",
                                "123 Photography Street",
                                new BigDecimal("10.123456"),
                                new BigDecimal("106.123456"),
                                10,
                                new BigDecimal("50.00"),
                                new BigDecimal("150000.00"),
                                CreativeSpaceType.DARKROOM,
                                "10m x 5m x 3m",
                                "Vintage",
                                "Warm lighting",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Enlarger", "Film developing equipment"),
                                Map.of("monday", "09:00-18:00"),
                                "No smoking",
                                List.of("https://example.com/darkroom.jpg"),
                                AvailabilityStatus.AVAILABLE);
        }

        private CreativeSpaceResponse createValidResponse() {
                UUID id = UUID.randomUUID();
                UUID providerId = UUID.randomUUID();
                OffsetDateTime now = OffsetDateTime.now();

                return new CreativeSpaceResponse(
                                id,
                                providerId,
                                "My Darkroom",
                                "A professional darkroom",
                                "123 Photography Street",
                                new BigDecimal("10.123456"),
                                new BigDecimal("106.123456"),
                                10,
                                new BigDecimal("50.00"),
                                new BigDecimal("150000.00"),
                                "ACTIVE",
                                CreativeSpaceType.DARKROOM,
                                "10m x 5m x 3m",
                                "Vintage",
                                "Warm lighting",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Enlarger", "Film developing equipment"),
                                Map.of("monday", "09:00-18:00"),
                                "No smoking",
                                List.of("https://example.com/darkroom.jpg"),
                                AvailabilityStatus.AVAILABLE,
                                now,
                                now);
        }

        @Test
        void getMyCreativeSpaces_withoutAuthentication_shouldReturn401() throws Exception {
                mockMvc.perform(get("/api/creative-spaces"))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void getMyCreativeSpaces_withWrongRole_shouldReturn403() throws Exception {
                mockMvc.perform(
                                get("/api/creative-spaces")
                                                .with(SecurityMockMvcRequestPostProcessors.user("test-user")
                                                                .roles("USER")))
                                .andExpect(status().isForbidden());
        }

        @Test
        void create_withValidRequest_shouldReturn201Created() throws Exception {
                CreativeSpaceRequest request = createValidRequest();
                CreativeSpaceResponse response = createValidResponse();

                when(creativeSpaceService.create(
                                any(CreativeSpaceRequest.class),
                                any())).thenReturn(response);

                mockMvc.perform(
                                post("/api/creative-spaces")
                                                .with(user("test-provider").roles("SERVICE_PROVIDER"))
                                                .contentType(APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(response.id().toString()))
                                .andExpect(jsonPath("$.name").value("My Darkroom"))
                                .andExpect(jsonPath("$.providerId").value(response.providerId().toString()))
                                .andExpect(jsonPath("$.spaceType").value("DARKROOM"))
                                .andExpect(jsonPath("$.capacity").value(10))
                                .andExpect(jsonPath("$.availabilityStatus").value("AVAILABLE"));
        }

        @Test
        void create_withInvalidRequest_shouldReturn400BadRequest() throws Exception {
                CreativeSpaceRequest request = new CreativeSpaceRequest(
                                "",
                                "A professional darkroom",
                                "123 Photography Street",
                                new BigDecimal("10.123456"),
                                new BigDecimal("106.123456"),
                                10,
                                new BigDecimal("50.00"),
                                new BigDecimal("150000.00"),
                                CreativeSpaceType.DARKROOM,
                                "10m x 5m x 3m",
                                "Vintage",
                                "Warm lighting",
                                "Good ventilation",
                                "Soundproof",
                                List.of("Enlarger"),
                                Map.of("monday", "09:00-18:00"),
                                "No smoking",
                                List.of("https://example.com/darkroom.jpg"),
                                AvailabilityStatus.AVAILABLE);

                mockMvc.perform(
                                post("/api/creative-spaces")
                                                .with(user("test-provider").roles("SERVICE_PROVIDER"))
                                                .contentType(APPLICATION_JSON)
                                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());

                verifyNoInteractions(creativeSpaceService);
        }
}