package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.dto.ProviderRegisterRequest;
import com.lentd6190art.fpp.identity.dto.ProviderRegisterResponse;
import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.ProviderProfileRepository;
import com.lentd6190art.fpp.identity.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProviderRegistrationService {

    private final UserRepository userRepository;
    private final ProviderProfileRepository providerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProviderRegistrationService(
            UserRepository userRepository,
            ProviderProfileRepository providerProfileRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ProviderRegisterResponse register(
            ProviderRegisterRequest request
    ) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        // Do not assign SERVICE_PROVIDER before admin approval.
        User savedUser = userRepository.save(user);

        ProviderProfile profile = new ProviderProfile(
                savedUser,
                request.businessName(),
                request.phone(),
                request.address(),
                request.serviceType()
        );

        ProviderProfile savedProfile =
                providerProfileRepository.save(profile);

        return new ProviderRegisterResponse(
                savedUser.getId(),
                savedProfile.getId(),
                savedProfile.getStatus(),
                "Provider registration submitted successfully. "
                        + "Your application is pending admin approval."
        );
    }
}