
package com.lentd6190art.fpp.resource.config;

import java.util.UUID;

/**
 * Stores the provider identity extracted from the authenticated JWT.
 *
 * The principal remains the user's ID.
 * A null providerId means the authenticated user has no valid provider identity.
 */
public record ProviderAuthenticationDetails(UUID providerId) {
}
