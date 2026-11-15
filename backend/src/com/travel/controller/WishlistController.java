package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.model.WishlistItem;
import com.travel.repository.WishlistRepository;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class WishlistController implements HttpHandler {

    private final WishlistRepository wishlistRepository = new WishlistRepository();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);

        try {
            TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
            if (user == null) {
                return; // 401 already sent by AuthFilter
            }

            int userId = user.getUserId();

            if ("GET".equals(method)) {
                List<WishlistItem> list = wishlistRepository.findByUserId(userId);
                HttpUtils.sendSuccess(exchange, list);
            } else if ("POST".equals(method)) {
                String body = HttpUtils.readRequestBody(exchange);
                Map<String, Object> req = JsonParser.parseObject(body);

                Integer destinationId = null;
                Integer packageId = null;

                if (req.get("destinationId") != null) {
                    destinationId = ((Number) req.get("destinationId")).intValue();
                }
                if (req.get("packageId") != null) {
                    packageId = ((Number) req.get("packageId")).intValue();
                }

                if (destinationId == null && packageId == null) {
                    HttpUtils.sendError(exchange, 400, "Please provide destinationId or packageId to add to wishlist.");
                    return;
                }

                boolean ok = wishlistRepository.add(userId, destinationId, packageId);
                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("success", ok);
                resp.put("message", ok ? "Added to wishlist" : "Item already in wishlist");
                HttpUtils.sendSuccess(exchange, resp);
            } else if ("DELETE".equals(method)) {
                String suffix = HttpUtils.extractPathSuffix(path, "/api/wishlist");
                Integer destinationId = null;
                Integer packageId = null;
                Integer wishlistId = null;

                if (query.get("destinationId") != null) {
                    destinationId = Integer.parseInt(query.get("destinationId"));
                }
                if (query.get("packageId") != null) {
                    packageId = Integer.parseInt(query.get("packageId"));
                }
                if (query.get("wishlistId") != null) {
                    wishlistId = Integer.parseInt(query.get("wishlistId"));
                }

                // If no query params, check body if present
                if (destinationId == null && packageId == null && wishlistId == null) {
                    String body = HttpUtils.readRequestBody(exchange);
                    if (body != null && !body.trim().isEmpty()) {
                        Map<String, Object> req = JsonParser.parseObject(body);
                        if (req.get("destinationId") != null) destinationId = ((Number) req.get("destinationId")).intValue();
                        if (req.get("packageId") != null) packageId = ((Number) req.get("packageId")).intValue();
                        if (req.get("wishlistId") != null) wishlistId = ((Number) req.get("wishlistId")).intValue();
                    }
                }

                // If still not found, check path suffix /api/wishlist/:id
                if (destinationId == null && packageId == null && wishlistId == null && !suffix.isEmpty()) {
                    int parsedId = Integer.parseInt(suffix);
                    // Check if query type=dest or default to wishlistId or destinationId
                    if ("destination".equalsIgnoreCase(query.get("type"))) {
                        destinationId = parsedId;
                    } else if ("package".equalsIgnoreCase(query.get("type"))) {
                        packageId = parsedId;
                    } else {
                        // Try removing by destinationId first or wishlistId
                        boolean byDest = wishlistRepository.remove(userId, parsedId, null);
                        if (byDest) {
                            Map<String, Object> resp = new LinkedHashMap<>();
                            resp.put("success", true);
                            resp.put("message", "Removed from wishlist");
                            HttpUtils.sendSuccess(exchange, resp);
                            return;
                        }
                        wishlistId = parsedId;
                    }
                }

                boolean ok = false;
                if (wishlistId != null) {
                    ok = wishlistRepository.removeById(userId, wishlistId);
                } else if (destinationId != null || packageId != null) {
                    ok = wishlistRepository.remove(userId, destinationId, packageId);
                }

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("success", ok);
                resp.put("message", ok ? "Removed from wishlist" : "Item not found in wishlist");
                HttpUtils.sendSuccess(exchange, resp);
            } else {
                HttpUtils.sendError(exchange, 405, "Method not allowed: " + method);
            }
        } catch (NumberFormatException e) {
            HttpUtils.sendError(exchange, 400, "Invalid ID parameter format");
        } catch (Exception e) {
            System.err.println("[WISHLIST-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }
}
