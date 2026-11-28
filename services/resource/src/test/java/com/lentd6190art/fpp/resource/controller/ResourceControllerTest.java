package com.lentd6190art.fpp.resource.controller;

import com.lentd6190art.fpp.resource.dto.request.ResourceRequest;
import com.lentd6190art.fpp.resource.dto.response.ResourceResponse;
import com.lentd6190art.fpp.resource.model.enums.ResourceType;
import com.lentd6190art.fpp.resource.service.CreativeSpaceService;
import com.lentd6190art.fpp.resource.service.ResourceService;
import com.lentd6190art.fpp.resource.config.JwtService;
import com.lentd6190art.fpp.resource.exception.ResourceNotFoundException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;


@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.jwt.secret=VGhpc0lzQVNlY3JldEtleUZvclRlc3RpbmdQdXJwb3Nlc09ubHk=",
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration,org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration,org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration"
})
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CreativeSpaceService creativeSpaceService;

    @Test
    void updateResource_shouldReturn200AndUpdatedResource() throws Exception {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        ResourceResponse response = new ResourceResponse(
                resourceId,
                ResourceType.EQUIPMENT,
                providerId,
                "Canon AE-1",
                "Updated film camera",
                "ACTIVE",
                Map.of("category", "CAMERA"),
                Instant.now(),
                Instant.now());

        when(resourceService.updateResource(
                eq(ResourceType.EQUIPMENT),
                eq(resourceId),
                any(ResourceRequest.class),
                any())).thenReturn(response);

        mockMvc.perform(
                put("/api/resources/EQUIPMENT/{id}", resourceId)
                        .with(user(providerId.toString()).roles("SERVICE_PROVIDER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "resourceType": "EQUIPMENT",
                                    "name": "Canon AE-1",
                                    "description": "Film camera",
                                    "attributes": {
                                        "category": "CAMERA"
                                    }
                                }
                                """))
                .andExpect(status().isOk());

        verify(resourceService).updateResource(
                eq(ResourceType.EQUIPMENT),
                eq(resourceId),
                any(ResourceRequest.class),
                any());
    }

    @Test
    void deleteResource_shouldReturn204() throws Exception {
        UUID resourceId = UUID.randomUUID();

        mockMvc.perform(
                delete("/api/resources/EQUIPMENT/{id}", resourceId)
                        .with(user("test-provider").roles("SERVICE_PROVIDER")))
                .andExpect(status().isNoContent());

        verify(resourceService).deleteResource(
                eq(ResourceType.EQUIPMENT),
                eq(resourceId),
                any());
    }

    @Test
    void updateResource_shouldReturn404WhenResourceNotFound() throws Exception {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        when(resourceService.updateResource(
                eq(ResourceType.EQUIPMENT),
                eq(resourceId),
                any(ResourceRequest.class),
                any()))
                .thenThrow(new ResourceNotFoundException("Equipment not found: " + resourceId));

        mockMvc.perform(
                put("/api/resources/EQUIPMENT/{id}", resourceId)
                        .with(user(providerId.toString()).roles("SERVICE_PROVIDER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "resourceType": "EQUIPMENT",
                                    "name": "Canon AE-1",
                                    "description": "Film camera",
                                    "attributes": {
                                        "category": "CAMERA"
                                    }
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Equipment not found: " + resourceId));
    }

    @Test
    void deleteResource_shouldReturn404WhenResourceNotFound() throws Exception {
        UUID resourceId = UUID.randomUUID();

        doThrow(new ResourceNotFoundException("Equipment not found: " + resourceId))
                .when(resourceService)
                .deleteResource(
                        eq(ResourceType.EQUIPMENT),
                        eq(resourceId),
                        any());

        mockMvc.perform(
                delete("/api/resources/EQUIPMENT/{id}", resourceId)
                        .with(user("test-provider").roles("SERVICE_PROVIDER")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Equipment not found: " + resourceId));
    }

    @Test
    void updateResource_shouldReturn400WhenRequestIsInvalid() throws Exception {
        UUID resourceId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();

        when(resourceService.updateResource(
                eq(ResourceType.EQUIPMENT),
                eq(resourceId),
                any(ResourceRequest.class),
                any()))
                .thenThrow(new IllegalArgumentException("Invalid resource request"));

        mockMvc.perform(
                put("/api/resources/EQUIPMENT/{id}", resourceId)
                        .with(user(providerId.toString()).roles("SERVICE_PROVIDER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "resourceType": "EQUIPMENT",
                                    "name": "Canon AE-1",
                                    "description": "Film camera",
                                    "attributes": {
                                        "category": "CAMERA"
                                    }
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid resource request"));
    }

    @Test
    void getResources_shouldReturn401WhenUserIsNotAuthenticated() throws Exception {
        mockMvc.perform(
                get("/api/resources/EQUIPMENT"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getResources_shouldReturn403WhenUserDoesNotHaveProviderRole() throws Exception {
        mockMvc.perform(
                get("/api/resources/EQUIPMENT")
                        .with(user("test-customer").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }
}
