
package com.fpp.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class WebApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    // Chua dang nhap: chuyen den trang login
    @Test
    void unauthenticatedUserShouldBeRedirectedToLogin() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    // Provider duoc chuyen den dashboard Provider
    @Test
    void providerShouldBeRedirectedToProviderDashboard() throws Exception {
        mockMvc.perform(get("/dashboard")
                        .with(user("provider").roles("PROVIDER")))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/provider/dashboard"));
    }

    // Admin duoc chuyen den dashboard Admin
    @Test
    void adminShouldBeRedirectedToAdminDashboard() throws Exception {
        mockMvc.perform(get("/dashboard")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));
    }

    // Provider duoc vao dashboard cua minh
    @Test
    void providerShouldAccessProviderDashboard() throws Exception {
        mockMvc.perform(get("/provider/dashboard")
                        .with(user("provider").roles("PROVIDER")))
                .andExpect(status().isOk());
    }

    // Provider khong duoc vao dashboard Admin
    @Test
    void providerShouldNotAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard")
                        .with(user("provider").roles("PROVIDER")))
                .andExpect(status().isForbidden());
    }

    // Admin duoc vao dashboard cua minh
    @Test
    void adminShouldAccessAdminDashboard() throws Exception {
        mockMvc.perform(get("/admin/dashboard")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }

    // Admin khong duoc vao dashboard Provider
    @Test
    void adminShouldNotAccessProviderDashboard() throws Exception {
        mockMvc.perform(get("/provider/dashboard")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }
}
