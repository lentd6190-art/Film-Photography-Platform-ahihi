
package com.lentd6190art.fpp.identity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class RbacTestController {

    @GetMapping("/rbac-test")
    public Map<String, String> testAdminAccess() {
        return Map.of(
                "message", "RBAC authorization successful"
        );
    }
}
