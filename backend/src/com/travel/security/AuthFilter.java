package com.travel.security;

import com.sun.net.httpserver.HttpExchange;
import com.travel.util.HttpUtils;

import java.io.IOException;

/**
 * Validates request authorization headers and enforces Role-Based Access Control (RBAC).
 */
public class AuthFilter {

    public static TokenService.TokenPayload authenticate(HttpExchange exchange) throws IOException {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            HttpUtils.sendError(exchange, 401, "Missing or invalid Authorization header. Expected Bearer token.");
            return null;
        }

        String token = authHeader.substring(7).trim();
        TokenService.TokenPayload payload = TokenService.validateToken(token);
        if (payload == null) {
            HttpUtils.sendError(exchange, 401, "Session expired or invalid token. Please log in again.");
            return null;
        }

        return payload;
    }

    public static boolean requireRole(HttpExchange exchange, TokenService.TokenPayload user, String... allowedRoles) throws IOException {
        if (user == null) {
            return false;
        }

        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(user.getRole())) {
                return true;
            }
        }

        HttpUtils.sendError(exchange, 403, "Access denied. Required role: " + String.join(", ", allowedRoles));
        return false;
    }
}
