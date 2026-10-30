package com.lentd6190art.fpp.identity.config;

import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.RoleRepository;
import com.lentd6190art.fpp.identity.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    public DataSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {

        if (!seedEnabled) {
            return;
        }

        createUserIfNotExists(
                "seed.admin@fpp.local",
                "FPP Administrator",
                "ADMINISTRATOR"
        );

        createUserIfNotExists(
                "seed.provider@fpp.local",
                "FPP Service Provider",
                "SERVICE_PROVIDER"
        );

        createUserIfNotExists(
                "seed.photographer@fpp.local",
                "FPP Photographer",
                "PHOTOGRAPHER"
        );

        createUserIfNotExists(
                "seed.expert@fpp.local",
                "FPP Photography Expert",
                "PHOTOGRAPHY_EXPERT"
        );
    }

    private void createUserIfNotExists(
            String email,
            String fullName,
            String roleName) {

        if (userRepository.existsByEmail(email)) {
            System.out.println("[Seeder] User already exists: " + email);
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(
                        "Role not found: " + roleName
                ));

        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPasswordHash(
                passwordEncoder.encode("FppDemo@2026")
        );
        user.setActive(true);
        user.setRoles(Set.of(role));

        userRepository.save(user);

        System.out.println("[Seeder] Created user: " + email);
    }
}