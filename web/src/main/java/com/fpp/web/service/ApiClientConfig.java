
package com.fpp.web.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ApiClientConfig {

    @Bean
    public RestClient.Builder apiRestClientBuilder(
            BearerTokenInterceptor bearerTokenInterceptor,
            @Value("${identity.api.base-url}") String identityApiBaseUrl) {

        return RestClient.builder()
                .baseUrl(identityApiBaseUrl)
                .requestInterceptor(bearerTokenInterceptor);
    }

    @Bean
    public RestClient identityApiClient(
            RestClient.Builder apiRestClientBuilder) {

        return apiRestClientBuilder.build();
    }
}
