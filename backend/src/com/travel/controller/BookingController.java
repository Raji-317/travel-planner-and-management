package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.exception.AppException;
import com.travel.model.Booking;
import com.travel.model.BookingTraveler;
import com.travel.model.Review;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.service.BookingService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class BookingController implements HttpHandler {

    private final BookingService bookingService = new BookingService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);

        try {
            if (path.startsWith("/api/operator/bookings")) {
                handleOperatorBookings(exchange, method);
            } else if (path.startsWith("/api/bookings")) {
                handleTouristBookings(exchange, path, method);
            } else if (path.startsWith("/api/reviews")) {
                handleReviews(exchange, method, query);
            } else {
                HttpUtils.sendError(exchange, 404, "Booking route not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (NumberFormatException e) {
            HttpUtils.sendError(exchange, 400, "Invalid identifier in request URL.");
        } catch (Exception e) {
            System.err.println("[BOOKING-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handleTouristBookings(HttpExchange exchange, String path, String method) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;

        String suffix = HttpUtils.extractPathSuffix(path, "/api/bookings");

        if ("POST".equals(method) && suffix.isEmpty()) {
            // Create Booking
            String body = HttpUtils.readRequestBody(exchange);
            Map<String, Object> req = JsonParser.parseObject(body);

            Number depNum = (Number) req.get("departureId");
            int departureId = depNum != null ? depNum.intValue() : 0;
            Number travNum = (Number) req.getOrDefault("numTravelers", 1);
            int numTravelers = travNum != null ? travNum.intValue() : 1;
            String paymentMethod = (String) req.getOrDefault("paymentMethod", "CARD_SIMULATED");
            String specialRequests = (String) req.get("specialRequests");

            List<BookingTraveler> travelers = parseTravelers(req.get("travelers"));

            Booking booking = bookingService.createBooking(user.getUserId(), departureId, numTravelers,
                    travelers, paymentMethod, specialRequests);
            HttpUtils.sendCreated(exchange, booking);

        } else if ("GET".equals(method) && "my".equals(suffix)) {
            // My Bookings
            List<Booking> list = bookingService.getUserBookings(user.getUserId());
            HttpUtils.sendSuccess(exchange, list);

        } else if ("GET".equals(method) && !suffix.isEmpty()) {
            // Single booking by ID
            int bookingId = Integer.parseInt(suffix);
            Booking b = bookingService.getBookingById(bookingId, user.getUserId(), user.getRole());
            HttpUtils.sendSuccess(exchange, b);

        } else if (("POST".equals(method) && suffix.endsWith("/cancel")) ||
                   ("DELETE".equals(method) && !suffix.isEmpty())) {
            // Cancel booking: /api/bookings/{id}/cancel or DELETE /api/bookings/{id}
            String idStr = suffix.endsWith("/cancel")
                    ? suffix.substring(0, suffix.indexOf("/cancel"))
                    : suffix;
            int bookingId = Integer.parseInt(idStr);

            String reason = "Cancelled to resolve tour schedule conflict";
            if ("POST".equals(method)) {
                String body = HttpUtils.readRequestBody(exchange);
                Map<String, Object> req = JsonParser.parseObject(body);
                if (req.containsKey("reason")) {
                    reason = (String) req.get("reason");
                }
            }

            boolean ok = bookingService.cancelBooking(bookingId, user.getUserId(), reason);
            if (ok) {
                HttpUtils.sendSuccess(exchange, "Booking cancelled successfully. Simulated refund has been credited.");
            } else {
                HttpUtils.sendError(exchange, 400, "Unable to cancel booking.");
            }

        } else {
            HttpUtils.sendError(exchange, 404, "Invalid booking request.");
        }
    }

    private void handleOperatorBookings(HttpExchange exchange, String method) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;
        if (!AuthFilter.requireRole(exchange, user, "OPERATOR", "ADMIN")) return;

        if ("GET".equals(method)) {
            List<Booking> list = bookingService.getOperatorBookings(user.getUserId());
            HttpUtils.sendSuccess(exchange, list);
        } else {
            HttpUtils.sendError(exchange, 405, "Method not allowed.");
        }
    }

    private void handleReviews(HttpExchange exchange, String method, Map<String, String> query) throws IOException {
        if ("GET".equals(method)) {
            String pkgStr = query.get("packageId");
            if (pkgStr == null || pkgStr.isEmpty()) {
                HttpUtils.sendError(exchange, 400, "Missing packageId parameter.");
                return;
            }
            int packageId = Integer.parseInt(pkgStr);
            List<Review> list = bookingService.getPackageReviews(packageId);
            HttpUtils.sendSuccess(exchange, list);
        } else if ("POST".equals(method)) {
            TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
            if (user == null) return;

            String body = HttpUtils.readRequestBody(exchange);
            Map<String, Object> req = JsonParser.parseObject(body);

            Number pkgNum = (Number) req.get("packageId");
            int packageId = pkgNum != null ? pkgNum.intValue() : 0;
            Number ratingNum = (Number) req.getOrDefault("rating", 5);
            int rating = ratingNum != null ? ratingNum.intValue() : 5;
            String title = (String) req.get("reviewTitle");
            String comment = (String) req.get("comment");

            Review rev = bookingService.addReview(user.getUserId(), packageId, rating, title, comment);
            HttpUtils.sendCreated(exchange, rev);
        } else {
            HttpUtils.sendError(exchange, 405, "Method not allowed for reviews.");
        }
    }

    @SuppressWarnings("unchecked")
    private List<BookingTraveler> parseTravelers(Object rawList) {
        List<BookingTraveler> travelers = new ArrayList<>();
        if (rawList instanceof List) {
            for (Object item : (List<Object>) rawList) {
                if (item instanceof Map) {
                    Map<String, Object> map = (Map<String, Object>) item;
                    BookingTraveler t = new BookingTraveler();
                    t.setFullName((String) map.get("fullName"));
                    Number ageNum = (Number) map.getOrDefault("age", 25);
                    t.setAge(ageNum != null ? ageNum.intValue() : 25);
                    t.setGender((String) map.getOrDefault("gender", "OTHER"));
                    t.setIdProofType((String) map.getOrDefault("idProofType", "PASSPORT"));
                    t.setIdProofNumber((String) map.getOrDefault("idProofNumber", "XXXX1234"));
                    travelers.add(t);
                }
            }
        }
        return travelers;
    }
}

