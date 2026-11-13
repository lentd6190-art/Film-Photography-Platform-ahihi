
package com.lentd6190art.fpp.identity.controller;

import com.lentd6190art.fpp.identity.dto.RegisterRequest;
import com.lentd6190art.fpp.identity.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class RegisterController {

    private final AuthService authService;

    public RegisterController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
   public ResponseEntity<String> register(
        @jakarta.validation.Valid @RequestBody RegisterRequest request
) {
        try {
            authService.register(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Registration successful");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }
}
