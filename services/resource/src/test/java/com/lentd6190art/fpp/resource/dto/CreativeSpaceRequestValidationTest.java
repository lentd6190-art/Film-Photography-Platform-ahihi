package com.lentd6190art.fpp.resource.dto;

import com.lentd6190art.fpp.resource.model.enums.AvailabilityStatus;
import com.lentd6190art.fpp.resource.model.enums.CreativeSpaceType;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.ConstraintViolation;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CreativeSpaceRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private CreativeSpaceRequest createValidRequest() {
        return new CreativeSpaceRequest(
                "My Darkroom",
                "Professional darkroom",
                "Thu Duc, Ho Chi Minh City",
                new BigDecimal("10.123456"),
                new BigDecimal("106.123456"),
                10,
                new BigDecimal("50.25"),
                new BigDecimal("150.50"),
                CreativeSpaceType.DARKROOM,
                "10m x 5m",
                "Vintage",
                "Natural lighting",
                "Good ventilation",
                "Soundproof",
                List.of("Enlarger", "Film scanner"),
                Map.of("Monday", "08:00-17:00"),
                "No smoking",
                List.of("image1.jpg"),
                AvailabilityStatus.AVAILABLE);
    }

    @Test
    void validate_shouldAcceptValidRequest() {
        CreativeSpaceRequest request = createValidRequest();

        Set<ConstraintViolation<CreativeSpaceRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void validate_shouldRejectHourlyPriceWithMoreThanTwoDecimalPlaces() {
        CreativeSpaceRequest request = new CreativeSpaceRequest(
                "My Darkroom", "Description", "Address",
                new BigDecimal("10.123456"),
                new BigDecimal("106.123456"),
                10,
                new BigDecimal("50.25"),
                new BigDecimal("12.345"),
                CreativeSpaceType.DARKROOM,
                "10m x 5m", "Vintage", "Lighting",
                "Ventilation", "Acoustics",
                List.of(), Map.of(), "Policies",
                List.of(), AvailabilityStatus.AVAILABLE);

        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void validate_shouldRejectNumericValuesExceedingDatabasePrecision() {
        assertFalse(validator.validateValue(
                CreativeSpaceRequest.class,
                "latitude",
                new BigDecimal("10.1234567")).isEmpty());

        assertFalse(validator.validateValue(
                CreativeSpaceRequest.class,
                "longitude",
                new BigDecimal("106.1234567")).isEmpty());

        assertFalse(validator.validateValue(
                CreativeSpaceRequest.class,
                "areaSqm",
                new BigDecimal("50.256")).isEmpty());
    }

    @Test
    void validate_shouldRejectLatitudeOutsideRange() {
        CreativeSpaceRequest request = createValidRequest();

        CreativeSpaceRequest invalidRequest = new CreativeSpaceRequest(
                request.name(), request.description(), request.address(),
                new BigDecimal("91.0"), request.longitude(),
                request.capacity(), request.areaSqm(),
                request.hourlyPrice(), request.spaceType(),
                request.dimensions(), request.artisticStyle(),
                request.lighting(), request.ventilation(),
                request.acoustics(), request.amenities(),
                request.operatingHours(), request.policies(),
                request.images(), request.availabilityStatus());

        assertFalse(validator.validate(invalidRequest).isEmpty());
    }

    @Test
    void validate_shouldRejectZeroArea() {
        CreativeSpaceRequest request = createValidRequest();

        CreativeSpaceRequest invalidRequest = new CreativeSpaceRequest(
                request.name(), request.description(), request.address(),
                request.latitude(), request.longitude(),
                request.capacity(), BigDecimal.ZERO,
                request.hourlyPrice(), request.spaceType(),
                request.dimensions(), request.artisticStyle(),
                request.lighting(), request.ventilation(),
                request.acoustics(), request.amenities(),
                request.operatingHours(), request.policies(),
                request.images(), request.availabilityStatus());

        assertFalse(validator.validate(invalidRequest).isEmpty());
    }

    @Test
    void validate_shouldRejectZeroCapacity() {
        CreativeSpaceRequest request = createValidRequest();

        CreativeSpaceRequest invalidRequest = new CreativeSpaceRequest(
                request.name(), request.description(), request.address(),
                request.latitude(), request.longitude(),
                0, request.areaSqm(),
                request.hourlyPrice(), request.spaceType(),
                request.dimensions(), request.artisticStyle(),
                request.lighting(), request.ventilation(),
                request.acoustics(), request.amenities(),
                request.operatingHours(), request.policies(),
                request.images(), request.availabilityStatus());

        assertFalse(validator.validate(invalidRequest).isEmpty());
    }

    @Test
    void validate_shouldRejectBlankName() {
        CreativeSpaceRequest request = createValidRequest();

        CreativeSpaceRequest invalidRequest = new CreativeSpaceRequest(
                " ", request.description(), request.address(),
                request.latitude(), request.longitude(),
                request.capacity(), request.areaSqm(),
                request.hourlyPrice(), request.spaceType(),
                request.dimensions(), request.artisticStyle(),
                request.lighting(), request.ventilation(),
                request.acoustics(), request.amenities(),
                request.operatingHours(), request.policies(),
                request.images(), request.availabilityStatus());

        assertFalse(validator.validate(invalidRequest).isEmpty());
    }
}