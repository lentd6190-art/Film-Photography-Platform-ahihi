
package com.lentd6190art.fpp.identity.service;

import com.lentd6190art.fpp.identity.entity.ProviderProfile;
import com.lentd6190art.fpp.identity.entity.ProviderStatus;
import com.lentd6190art.fpp.identity.entity.Role;
import com.lentd6190art.fpp.identity.entity.User;
import com.lentd6190art.fpp.identity.repository.ProviderProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProviderIdentityServiceTest {

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @InjectMocks
    private ProviderIdentityService providerIdentityService;

    private User user;
    private Role providerRole;

    private final UUID userId = UUID.randomUUID();
    private final UUID providerId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        user = mock(User.class);
        providerRole = mock(Role.class);
    }

    @Test
    void resolveProviderId_shouldReturnNullForRegularUser() {
        Role photographerRole = mock(Role.class);
        when(photographerRole.getName()).thenReturn("PHOTOGRAPHER");
        when(user.getRoles()).thenReturn(Set.of(photographerRole));

        UUID result = providerIdentityService.resolveProviderId(user);

        assertNull(result);
        verifyNoInteractions(providerProfileRepository);
    }

    @Test
    void resolveProviderId_shouldReturnIdForApprovedProvider() {
        ProviderProfile profile = mock(ProviderProfile.class);

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerRole.getName()).thenReturn("SERVICE_PROVIDER");
        when(user.getId()).thenReturn(userId);

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerProfileRepository.findByUser_Id(userId))
                .thenReturn(Optional.of(profile));
        when(profile.getStatus()).thenReturn(ProviderStatus.APPROVED);
        when(profile.getId()).thenReturn(providerId);

        UUID result = providerIdentityService.resolveProviderId(user);

        assertEquals(providerId, result);
        verify(providerProfileRepository).findByUser_Id(userId);
    }

    @Test
    void resolveProviderId_shouldReturnNullForPendingProvider() {
        ProviderProfile profile = mock(ProviderProfile.class);

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerRole.getName()).thenReturn("SERVICE_PROVIDER");
        when(user.getId()).thenReturn(userId);

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerProfileRepository.findByUser_Id(userId))
                .thenReturn(Optional.of(profile));
        when(profile.getStatus()).thenReturn(ProviderStatus.PENDING);

        UUID result = providerIdentityService.resolveProviderId(user);

        assertNull(result);
        verify(providerProfileRepository).findByUser_Id(userId);
        verify(profile, never()).getId();
    }

    @Test
    void resolveProviderId_shouldReturnNullWhenProfileDoesNotExist() {

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerRole.getName()).thenReturn("SERVICE_PROVIDER");
        when(user.getId()).thenReturn(userId);

        when(user.getRoles()).thenReturn(Set.of(providerRole));
        when(providerProfileRepository.findByUser_Id(userId))
                .thenReturn(Optional.empty());

        UUID result = providerIdentityService.resolveProviderId(user);

        assertNull(result);
        verify(providerProfileRepository).findByUser_Id(userId);
    }
}
