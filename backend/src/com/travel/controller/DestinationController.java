package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.exception.AppException;
import com.travel.model.Attraction;
import com.travel.model.AttractionCategory;
import com.travel.model.Destination;
import com.travel.service.DestinationService;
import com.travel.util.HttpUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class DestinationController implements HttpHandler {

    private final DestinationService destinationService = new DestinationService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);

        try {
            if (path.startsWith("/api/destinations") && "GET".equals(method)) {
                String suffix = HttpUtils.extractPathSuffix(path, "/api/destinations");
                if (suffix.isEmpty()) {
                    // List all destinations with filters
                    String search = query.get("search");
                    String season = query.get("season");
                    String budgetStr = query.get("maxBudget");
                    Double maxBudget = (budgetStr != null && !budgetStr.isEmpty()) ? Double.parseDouble(budgetStr) : null;
                    Boolean featured = Boolean.parseBoolean(query.get("featured"));

                    List<Destination> list = destinationService.getDestinations(search, season, maxBudget, featured);
                    HttpUtils.sendSuccess(exchange, list);
                } else {
                    // Specific destination by ID
                    int id = Integer.parseInt(suffix);
                    Destination d = destinationService.getDestinationById(id);
                    HttpUtils.sendSuccess(exchange, d);
                }
            } else if ("/api/categories".equals(path) && "GET".equals(method)) {
                List<AttractionCategory> list = destinationService.getCategories();
                HttpUtils.sendSuccess(exchange, list);
            } else if ("/api/attractions".equals(path) && "GET".equals(method)) {
                String destStr = query.get("destinationId");
                if (destStr == null || destStr.isEmpty()) {
                    HttpUtils.sendError(exchange, 400, "Missing required query parameter: destinationId");
                    return;
                }
                int destId = Integer.parseInt(destStr);
                String catStr = query.get("categoryId");
                Integer catId = (catStr != null && !catStr.isEmpty()) ? Integer.parseInt(catStr) : null;

                List<Attraction> list = destinationService.getAttractions(destId, catId);
                HttpUtils.sendSuccess(exchange, list);
            } else {
                HttpUtils.sendError(exchange, 404, "Destination endpoint not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (NumberFormatException e) {
            HttpUtils.sendError(exchange, 400, "Invalid numerical parameter.");
        } catch (Exception e) {
            System.err.println("[DEST-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Error: " + e.getMessage());
        }
    }
}

