
package com.fpp.web.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Ma hoa mat khau
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Tai khoan demo trong khi cho API tu nhom truong
    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder) {

        var provider = User.withUsername("provider")
                .password(passwordEncoder.encode("Provider@123"))
                .roles("PROVIDER")
                .build();

        var admin = User.withUsername("admin")
                .password(passwordEncoder.encode("Admin@123"))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(provider, admin);
    }

    // Cau hinh phan quyen va bao ve cac trang web
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .authorizeHttpRequests(auth -> auth

                // Trang dang nhap va tai nguyen cong khai
                .requestMatchers(
                    "/login",
                    "/css/**",
                    "/js/**",
                    "/access-denied"
                ).permitAll()

                // Chi Provider duoc truy cap khu vuc Provider
                .requestMatchers("/provider/**").hasRole("PROVIDER")

                // Chi Admin duoc truy cap khu vuc Admin
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Dashboard dieu huong chi danh cho nguoi da dang nhap
                .requestMatchers("/dashboard").authenticated()

                // Cac trang con lai yeu cau dang nhap
                .anyRequest().authenticated()
            )

            // Dang nhap bang form
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error")
                .permitAll()
            )

            // Dang xuat
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )

            // Xu ly khi nguoi dung khong co quyen truy cap
            .exceptionHandling(exception -> exception
                .accessDeniedPage("/access-denied")
            );

        return http.build();
    }
}
