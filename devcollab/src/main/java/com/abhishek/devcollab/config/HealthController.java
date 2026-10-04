package com.abhishek.devcollab.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Cheap liveness probe for uptime monitoring and keep-alive pings.
 * Deliberately touches neither the database nor JPA so it stays fast and
 * cannot fail for reasons unrelated to the process being alive.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of("status", "UP");
    }
}
