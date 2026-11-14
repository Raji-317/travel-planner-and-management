package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.exception.AppException;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.service.AuthService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Controller handling authentication, registrations, and profile endpoints.
 */
public class AuthController implements HttpHandler {

    private final AuthService authService = new AuthService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        try {
            if ("/api/auth/register".equals(path) && "POST".equals(method)) {
                handleRegister(exchange);
            } else if ("/api/auth/login".equals(path) && "POST".equals(method)) {
                handleLogin(exchange);
            } else if ("/api/auth/logout".equals(path) && "POST".equals(method)) {
                handleLogout(exchange);
            } else if ("/api/auth/me".equals(path) && "GET".equals(method)) {
                handleGetMe(exchange);
            } else if ("/api/auth/profile".equals(path) && "PUT".equals(method)) {
                handleUpdateProfile(exchange);
            } else {
                HttpUtils.sendError(exchange, 404, "Authentication endpoint not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            System.err.println("[AUTH-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Internal authentication error: " + e.getMessage());
        }
    }

    private void handleRegister(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        String role = (String) req.getOrDefault("role", "TOURIST");
        String email = (String) req.get("email");
        String password = (String) req.get("password");
        String fullName = (String) req.get("fullName");
        String phone = (String) req.get("phone");

        Map<String, Object> res;
        if ("OPERATOR".equalsIgnoreCase(role)) {
            String companyName = (String) req.get("companyName");
            String licenseNumber = (String) req.get("licenseNumber");
            Number yearsNum = (Number) req.getOrDefault("yearsInBusiness", 1);
            int years = yearsNum != null ? yearsNum.intValue() : 1;
            String address = (String) req.get("officeAddress");
            String supportPhone = (String) req.get("supportPhone");
            String supportEmail = (String) req.get("supportEmail");

            res = authService.registerOperator(email, password, fullName, phone, companyName,
                    licenseNumber, years, address, supportPhone, supportEmail);
        } else {
            res = authService.registerTourist(email, password, fullName, phone);
        }

        HttpUtils.sendCreated(exchange, res);
    }

    private void handleLogin(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        String email = (String) req.get("email");
        String password = (String) req.get("password");

        Map<String, Object> res = authService.login(email, password);
        HttpUtils.sendSuccess(exchange, res);
    }

    private void handleLogout(HttpExchange exchange) throws IOException {
        // Stateless HMAC tokens expire automatically or can be discarded client-side
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Logged out successfully");
        HttpUtils.sendSuccess(exchange, res);
    }

    private void handleGetMe(HttpExchange exchange) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;

        Map<String, Object> res = authService.getProfile(user.getUserId());
        HttpUtils.sendSuccess(exchange, res);
    }

    private void handleUpdateProfile(HttpExchange exchange) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;

        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        String fullName = (String) req.get("fullName");
        String phone = (String) req.get("phone");
        String avatarUrl = (String) req.get("avatarUrl");

        boolean ok = authService.updateProfile(user.getUserId(), fullName, phone, avatarUrl);
        if (ok) {
            Map<String, Object> res = authService.getProfile(user.getUserId());
            HttpUtils.sendSuccess(exchange, res);
        } else {
            HttpUtils.sendError(exchange, 400, "Unable to update profile.");
        }
    }
}
