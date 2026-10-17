
package com.fpp.web.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

    @GetMapping("/")
    public String home() {
        return "redirect:/dashboard";
    }

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication) {
        if (authentication == null) {
            return "redirect:/login";
        }

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(role ->
                        role.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return "redirect:/admin/dashboard";
        }

        boolean isProvider = authentication.getAuthorities()
                .stream()
                .anyMatch(role ->
                        role.getAuthority().equals("ROLE_PROVIDER"));

        if (isProvider) {
            return "redirect:/provider/dashboard";
        }

        return "redirect:/access-denied";
    }

    @GetMapping("/provider/dashboard")
    public String providerDashboard() {
        return "dashboard/provider";
    }

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "dashboard/admin";
    }

    @GetMapping("/access-denied")
    public String accessDenied(Model model) {
        model.addAttribute(
                "message",
                "Bạn không có quyền truy cập trang này."
        );

        return "auth/access-denied";
    }
}