
package com.lentd6190art.fpp.identity.config;

import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.ProviderProfileRepository;
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
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    public DataSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProviderProfileRepository providerProfileRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.providerProfileRepository = providerProfileRepository;
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

        User provider = createUserIfNotExists(
                "seed.provider@fpp.local",
                "FPP Service Provider",
                "SERVICE_PROVIDER"
        );

        ensureProviderProfile(provider);

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

    private User createUserIfNotExists(
            String email,
            String fullName,
            String roleName) {

        return userRepository.findByEmail(email)
                .orElseGet(() -> {

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

                    User savedUser = userRepository.save(user);

                    System.out.println(
                            "[Seeder] Created user: " + email
                    );

                    return savedUser;
                });
    }

    private void ensureProviderProfile(User provider) {

        if (providerProfileRepository.existsByUserId(provider.getId())) {
            System.out.println(
                    "[Seeder] Provider profile already exists: "
                            + provider.getEmail()
            );
            return;
        }

        ProviderProfile profile = new ProviderProfile();

        profile.setUser(provider);
        profile.setBusinessName("FPP Demo Darkroom");
        profile.setPhone("0900000000");
        profile.setAddress("Ho Chi Minh City, Vietnam");
        profile.setServiceType("DARKROOM");
        profile.setStatus("PENDING");

        providerProfileRepository.save(profile);

        System.out.println(
                "[Seeder] Created provider profile: "
                        + provider.getEmail()
        );
    }
}
