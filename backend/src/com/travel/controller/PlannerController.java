package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.config.DatabaseConfig;
import com.travel.exception.AppException;
import com.travel.model.ItineraryDay;
import com.travel.model.ItineraryPlace;
import com.travel.model.SavedItinerary;
import com.travel.model.TourExpense;
import com.travel.planner.IndiaTourismEngine;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.service.PlannerService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PlannerController implements HttpHandler {

    private final PlannerService plannerService = new PlannerService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        try {
            if ("/api/planner/generate".equals(path) && "POST".equals(method)) {
                handleGenerate(exchange);
            } else if ("/api/planner/places".equals(path) && "GET".equals(method)) {
                handleGetPlaces(exchange);
            } else if ("/api/planner/save".equals(path) && "POST".equals(method)) {
                handleSave(exchange);
            } else if ("/api/planner/itineraries".equals(path) && "GET".equals(method)) {
                handleListSaved(exchange);
            } else if (path.startsWith("/api/planner/itineraries/") && "GET".equals(method)) {
                handleGetSavedById(exchange, path);
            } else if ("/api/planner/expenses".equals(path) && "POST".equals(method)) {
                handleCreateExpense(exchange);
            } else if ("/api/planner/expenses".equals(path) && "GET".equals(method)) {
                handleListExpenses(exchange);
            } else if (path.startsWith("/api/planner/expenses/") && "DELETE".equals(method)) {
                handleDeleteExpense(exchange, path);
            } else {
                HttpUtils.sendError(exchange, 404, "Planner endpoint not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (NumberFormatException e) {
            HttpUtils.sendError(exchange, 400, "Invalid numerical parameter.");
        } catch (Exception e) {
            System.err.println("[PLANNER-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Error: " + e.getMessage());
        }
    }

    private void handleCreateExpense(HttpExchange exchange) throws IOException, SQLException {
        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        String title = (String) req.getOrDefault("title", "Expense");
        String category = (String) req.getOrDefault("category", "OTHER");
        Number amtNum = (Number) req.getOrDefault("amount", 0.0);
        double amount = amtNum != null ? amtNum.doubleValue() : 0.0;
        String dateStr = (String) req.get("expenseDate");
        String notes = (String) req.get("notes");
        Number itinNum = (Number) req.get("itineraryId");
        Integer itineraryId = itinNum != null ? itinNum.intValue() : null;

        String sql = "INSERT INTO tour_logged_expenses (itinerary_id, category, title, amount, expense_date, notes) "
                + "VALUES (?, ?, ?, ?, ?, ?)";
        int id = 0;
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            if (itineraryId != null) ps.setInt(1, itineraryId); else ps.setNull(1, Types.INTEGER);
            ps.setString(2, category);
            ps.setString(3, title);
            ps.setDouble(4, amount);
            ps.setString(5, dateStr);
            ps.setString(6, notes);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) id = rs.getInt(1);
            }
        }

        TourExpense exp = new TourExpense();
        exp.setExpenseId(id);
        exp.setItineraryId(itineraryId);
        exp.setCategory(category);
        exp.setTitle(title);
        exp.setAmount(amount);
        exp.setExpenseDate(dateStr);
        exp.setNotes(notes);

        HttpUtils.sendCreated(exchange, exp);
    }

    private void handleListExpenses(HttpExchange exchange) throws IOException, SQLException {
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);
        String itinStr = query.get("itineraryId");
        Integer itinId = (itinStr != null && !itinStr.isEmpty()) ? Integer.parseInt(itinStr) : null;

        List<TourExpense> list = new ArrayList<>();
        String sql = (itinId != null)
                ? "SELECT * FROM tour_logged_expenses WHERE itinerary_id = ? ORDER BY created_at DESC"
                : "SELECT * FROM tour_logged_expenses ORDER BY created_at DESC LIMIT 50";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (itinId != null) ps.setInt(1, itinId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    TourExpense e = new TourExpense();
                    e.setExpenseId(rs.getInt("expense_id"));
                    e.setItineraryId(rs.getInt("itinerary_id"));
                    e.setCategory(rs.getString("category"));
                    e.setTitle(rs.getString("title"));
                    e.setAmount(rs.getDouble("amount"));
                    e.setExpenseDate(rs.getString("expense_date"));
                    e.setNotes(rs.getString("notes"));
                    e.setCreatedAt(rs.getTimestamp("created_at"));
                    list.add(e);
                }
            }
        }
        HttpUtils.sendSuccess(exchange, list);
    }

    private void handleDeleteExpense(HttpExchange exchange, String path) throws IOException, SQLException {
        String suffix = HttpUtils.extractPathSuffix(path, "/api/planner/expenses");
        int expId = Integer.parseInt(suffix);
        String sql = "DELETE FROM tour_logged_expenses WHERE expense_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, expId);
            ps.executeUpdate();
        }
        HttpUtils.sendSuccess(exchange, "Expense deleted successfully.");
    }

    private void handleGetPlaces(HttpExchange exchange) throws IOException {
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);
        String destName = query.get("destination");
        String idStr = query.get("destinationId");
        int destId = (idStr != null && !idStr.isEmpty()) ? Integer.parseInt(idStr) : 0;

        List<IndiaTourismEngine.IndiaPlaceInfo> places = plannerService.getPlacesForDestination(destName, destId);
        HttpUtils.sendSuccess(exchange, places);
    }

    @SuppressWarnings("unchecked")
    private void handleGenerate(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        Number destNum = (Number) req.get("destinationId");
        int destinationId = destNum != null ? destNum.intValue() : 0;
        String destName = (String) req.get("destinationName");
        String startLoc = (String) req.getOrDefault("startingLocation", "Bhimavaram");
        Number daysNum = (Number) req.getOrDefault("travelDays", 3);
        int travelDays = daysNum != null ? daysNum.intValue() : 3;
        Number travNum = (Number) req.getOrDefault("numTravelers", 2);
        int numTravelers = travNum != null ? travNum.intValue() : 2;
        Number budgetNum = (Number) req.getOrDefault("totalBudget", 10000.0);
        double totalBudget = budgetNum != null ? budgetNum.doubleValue() : 10000.0;
        String pace = (String) req.getOrDefault("travelPace", "BALANCED");
        String transport = (String) req.getOrDefault("preferredTransport", "TRAIN");

        List<String> interests = new ArrayList<>();
        Object interestsRaw = req.get("interests");
        if (interestsRaw instanceof List) {
            for (Object item : (List<Object>) interestsRaw) {
                if (item != null) interests.add(item.toString());
            }
        }

        List<String> selectedPlaces = new ArrayList<>();
        Object selectedRaw = req.get("selectedPlaces");
        if (selectedRaw instanceof List) {
            for (Object item : (List<Object>) selectedRaw) {
                if (item != null) selectedPlaces.add(item.toString());
            }
        }

        SavedItinerary itinerary = plannerService.generateItinerary(destinationId, destName, startLoc, travelDays,
                numTravelers, totalBudget, interests, pace, transport, selectedPlaces);

        HttpUtils.sendSuccess(exchange, itinerary);
    }

    @SuppressWarnings("unchecked")
    private void handleSave(HttpExchange exchange) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;

        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);

        SavedItinerary itin = new SavedItinerary();
        itin.setUserId(user.getUserId());
        itin.setTitle((String) req.get("title"));
        itin.setStartingLocation((String) req.get("startingLocation"));
        Number destNum = (Number) req.get("destinationId");
        itin.setDestinationId(destNum != null ? destNum.intValue() : 0);
        Number daysNum = (Number) req.getOrDefault("travelDays", 1);
        itin.setTravelDays(daysNum != null ? daysNum.intValue() : 1);
        Number travNum = (Number) req.getOrDefault("numTravelers", 1);
        itin.setNumTravelers(travNum != null ? travNum.intValue() : 1);
        Number budNum = (Number) req.getOrDefault("totalBudget", 0.0);
        itin.setTotalBudget(budNum != null ? budNum.doubleValue() : 0.0);
        Number estNum = (Number) req.getOrDefault("estimatedCost", 0.0);
        itin.setEstimatedCost(estNum != null ? estNum.doubleValue() : 0.0);
        itin.setTravelPace((String) req.get("travelPace"));
        itin.setPreferredTransport((String) req.get("preferredTransport"));

        SavedItinerary saved = plannerService.saveItinerary(itin);
        HttpUtils.sendCreated(exchange, saved);
    }

    private void handleListSaved(HttpExchange exchange) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;
        List<SavedItinerary> list = plannerService.getUserItineraries(user.getUserId());
        HttpUtils.sendSuccess(exchange, list);
    }

    private void handleGetSavedById(HttpExchange exchange, String path) throws IOException {
        String suffix = HttpUtils.extractPathSuffix(path, "/api/planner/itineraries");
        int id = Integer.parseInt(suffix);
        SavedItinerary itin = plannerService.getItineraryById(id);
        HttpUtils.sendSuccess(exchange, itin);
    }
}
