package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.config.DatabaseConfig;
import com.travel.exception.AppException;
import com.travel.model.User;
import com.travel.repository.UserRepository;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AdminController implements HttpHandler {

    private final UserRepository userRepository = new UserRepository();
    private final com.travel.service.BookingService bookingService = new com.travel.service.BookingService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;
        if (!AuthFilter.requireRole(exchange, user, "ADMIN")) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        try {
            if ("/api/admin/dashboard".equals(path) && "GET".equals(method)) {
                handleDashboardMetrics(exchange);
            } else if ("/api/admin/bookings".equals(path) && "GET".equals(method)) {
                handleListBookings(exchange);
            } else if ("/api/admin/operators".equals(path) && "GET".equals(method)) {
                handleListOperators(exchange);
            } else if (path.startsWith("/api/admin/operators/") && "PUT".equals(method)) {
                handleOperatorApproval(exchange, path);
            } else if ("/api/admin/packages".equals(path) && "GET".equals(method)) {
                handleListPackages(exchange);
            } else if (path.startsWith("/api/admin/packages/") && "PUT".equals(method)) {
                handlePackageApproval(exchange, path);
            } else if ("/api/admin/users".equals(path) && "GET".equals(method)) {
                handleListUsers(exchange);
            } else {
                HttpUtils.sendError(exchange, 404, "Admin endpoint not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (Exception e) {
            System.err.println("[ADMIN-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Error: " + e.getMessage());
        }
    }

    private void handleListBookings(HttpExchange exchange) throws IOException {
        List<com.travel.model.Booking> bookings = bookingService.getAllBookings();
        HttpUtils.sendSuccess(exchange, bookings);
    }

    private void handleDashboardMetrics(HttpExchange exchange) throws IOException, SQLException {
        Map<String, Object> metrics = new LinkedHashMap<>();
        try (Connection conn = DatabaseConfig.getConnection()) {
            metrics.put("totalTourists", queryCount(conn, "SELECT COUNT(*) FROM users WHERE role = 'TOURIST'"));
            metrics.put("totalOperators", queryCount(conn, "SELECT COUNT(*) FROM users WHERE role = 'OPERATOR'"));
            metrics.put("pendingApprovals", queryCount(conn, "SELECT COUNT(*) FROM users WHERE role = 'OPERATOR' AND status = 'PENDING_APPROVAL'"));
            metrics.put("totalDestinations", queryCount(conn, "SELECT COUNT(*) FROM destinations"));
            metrics.put("totalPackages", queryCount(conn, "SELECT COUNT(*) FROM packages"));
            metrics.put("activePackages", queryCount(conn, "SELECT COUNT(*) FROM packages WHERE is_active = TRUE"));
            metrics.put("pendingPackages", queryCount(conn, "SELECT COUNT(*) FROM packages WHERE is_active = FALSE"));
            metrics.put("totalBookings", queryCount(conn, "SELECT COUNT(*) FROM bookings"));
            metrics.put("confirmedBookings", queryCount(conn, "SELECT COUNT(*) FROM bookings WHERE booking_status = 'CONFIRMED'"));
            metrics.put("cancelledBookings", queryCount(conn, "SELECT COUNT(*) FROM bookings WHERE booking_status = 'CANCELLED'"));

            String revSql = "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'SUCCESS'";
            try (PreparedStatement ps = conn.prepareStatement(revSql);
                 ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    metrics.put("totalRevenue", rs.getDouble(1));
                }
            }

            // Operator performance analytics
            List<Map<String, Object>> operatorStats = new ArrayList<>();
            String opSql = "SELECT u.user_id, u.full_name, op.company_name, op.is_verified, "
                    + "COUNT(DISTINCT p.package_id) as package_count, "
                    + "COALESCE(SUM(b.total_amount), 0) as total_earned, "
                    + "COUNT(b.booking_id) as total_bookings "
                    + "FROM users u "
                    + "JOIN operator_profiles op ON u.user_id = op.operator_id "
                    + "LEFT JOIN packages p ON u.user_id = p.operator_id "
                    + "LEFT JOIN package_departures pd ON p.package_id = pd.package_id "
                    + "LEFT JOIN bookings b ON pd.departure_id = b.departure_id AND b.booking_status = 'CONFIRMED' "
                    + "GROUP BY u.user_id, u.full_name, op.company_name, op.is_verified "
                    + "ORDER BY total_earned DESC";
            try (PreparedStatement psOp = conn.prepareStatement(opSql);
                 ResultSet rsOp = psOp.executeQuery()) {
                while (rsOp.next()) {
                    Map<String, Object> op = new LinkedHashMap<>();
                    op.put("operatorId", rsOp.getInt("user_id"));
                    op.put("operatorName", rsOp.getString("full_name"));
                    op.put("companyName", rsOp.getString("company_name"));
                    op.put("isVerified", rsOp.getBoolean("is_verified"));
                    op.put("packageCount", rsOp.getInt("package_count"));
                    op.put("totalEarned", rsOp.getDouble("total_earned"));
                    op.put("totalBookings", rsOp.getInt("total_bookings"));
                    operatorStats.add(op);
                }
            }
            metrics.put("operatorStats", operatorStats);

            // Package performance analytics
            List<Map<String, Object>> topPackages = new ArrayList<>();
            String pkgSql = "SELECT p.package_id, p.title, p.base_price_per_person, "
                    + "COUNT(b.booking_id) as bookings_count, "
                    + "COALESCE(SUM(b.total_amount), 0) as package_revenue "
                    + "FROM packages p "
                    + "LEFT JOIN package_departures pd ON p.package_id = pd.package_id "
                    + "LEFT JOIN bookings b ON pd.departure_id = b.departure_id AND b.booking_status = 'CONFIRMED' "
                    + "GROUP BY p.package_id, p.title, p.base_price_per_person "
                    + "ORDER BY bookings_count DESC LIMIT 6";
            try (PreparedStatement psPkg = conn.prepareStatement(pkgSql);
                 ResultSet rsPkg = psPkg.executeQuery()) {
                while (rsPkg.next()) {
                    Map<String, Object> p = new LinkedHashMap<>();
                    p.put("packageId", rsPkg.getInt("package_id"));
                    p.put("title", rsPkg.getString("title"));
                    p.put("price", rsPkg.getDouble("base_price_per_person"));
                    p.put("bookingsCount", rsPkg.getInt("bookings_count"));
                    p.put("revenue", rsPkg.getDouble("package_revenue"));
                    topPackages.add(p);
                }
            }
            metrics.put("topPackages", topPackages);
        }
        HttpUtils.sendSuccess(exchange, metrics);
    }

    private void handleListOperators(HttpExchange exchange) throws IOException, SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT u.user_id, u.email, u.full_name, u.phone, u.status, u.created_at, "
                + "o.company_name, o.license_number, o.years_in_business, o.is_verified, o.admin_notes "
                + "FROM users u LEFT JOIN operator_profiles o ON u.user_id = o.operator_id "
                + "WHERE u.role = 'OPERATOR' ORDER BY u.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("userId", rs.getInt("user_id"));
                map.put("email", rs.getString("email"));
                map.put("fullName", rs.getString("full_name"));
                map.put("phone", rs.getString("phone"));
                map.put("status", rs.getString("status"));
                map.put("companyName", rs.getString("company_name"));
                map.put("licenseNumber", rs.getString("license_number"));
                map.put("yearsInBusiness", rs.getInt("years_in_business"));
                map.put("isVerified", rs.getBoolean("is_verified"));
                map.put("adminNotes", rs.getString("admin_notes"));
                map.put("createdAt", rs.getTimestamp("created_at"));
                list.add(map);
            }
        }
        HttpUtils.sendSuccess(exchange, list);
    }

    private void handleOperatorApproval(HttpExchange exchange, String path) throws IOException, SQLException {
        String suffix = HttpUtils.extractPathSuffix(path, "/api/admin/operators");
        int slashIdx = suffix.indexOf("/");
        int operatorId = Integer.parseInt(slashIdx != -1 ? suffix.substring(0, slashIdx) : suffix);

        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);
        boolean approve = Boolean.parseBoolean(String.valueOf(req.getOrDefault("approve", true)));
        String adminNotes = (String) req.getOrDefault("adminNotes", "Reviewed by Admin");

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            String userStatus = approve ? "ACTIVE" : "SUSPENDED";
            String userSql = "UPDATE users SET status = ? WHERE user_id = ? AND role = 'OPERATOR'";
            try (PreparedStatement psU = conn.prepareStatement(userSql)) {
                psU.setString(1, userStatus);
                psU.setInt(2, operatorId);
                psU.executeUpdate();
            }

            String profSql = "UPDATE operator_profiles SET is_verified = ?, admin_notes = ?, verified_at = NOW() WHERE operator_id = ?";
            try (PreparedStatement psP = conn.prepareStatement(profSql)) {
                psP.setBoolean(1, approve);
                psP.setString(2, adminNotes);
                psP.setInt(3, operatorId);
                psP.executeUpdate();
            }

            conn.commit();
        }

        HttpUtils.sendSuccess(exchange, "Operator approval status updated successfully.");
    }

    private void handleListPackages(HttpExchange exchange) throws IOException, SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT p.*, d.name as destination_name, u.full_name as operator_name, "
                + "u.email as operator_email, op.company_name "
                + "FROM packages p "
                + "JOIN destinations d ON p.destination_id = d.destination_id "
                + "JOIN users u ON p.operator_id = u.user_id "
                + "LEFT JOIN operator_profiles op ON u.user_id = op.operator_id "
                + "ORDER BY p.is_active ASC, p.created_at DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("packageId", rs.getInt("package_id"));
                map.put("operatorId", rs.getInt("operator_id"));
                map.put("operatorName", rs.getString("operator_name"));
                map.put("operatorEmail", rs.getString("operator_email"));
                map.put("companyName", rs.getString("company_name"));
                map.put("destinationName", rs.getString("destination_name"));
                map.put("title", rs.getString("title"));
                map.put("description", rs.getString("description"));
                map.put("durationDays", rs.getInt("duration_days"));
                map.put("durationNights", rs.getInt("duration_nights"));
                map.put("basePricePerPerson", rs.getDouble("base_price_per_person"));
                map.put("maxTravellers", rs.getInt("max_travellers"));
                map.put("totalBookings", rs.getInt("total_bookings"));
                map.put("isActive", rs.getBoolean("is_active"));
                map.put("rejectionNotes", rs.getString("rejection_notes"));
                map.put("imageUrl", rs.getString("image_url"));
                map.put("createdAt", rs.getTimestamp("created_at"));
                list.add(map);
            }
        }
        HttpUtils.sendSuccess(exchange, list);
    }

    private void handlePackageApproval(HttpExchange exchange, String path) throws IOException, SQLException {
        String suffix = HttpUtils.extractPathSuffix(path, "/api/admin/packages");
        int slashIdx = suffix.indexOf("/");
        int packageId = Integer.parseInt(slashIdx != -1 ? suffix.substring(0, slashIdx) : suffix);

        String body = HttpUtils.readRequestBody(exchange);
        Map<String, Object> req = JsonParser.parseObject(body);
        boolean approve = Boolean.parseBoolean(String.valueOf(req.getOrDefault("approve", true)));
        String rejectionNotes = (String) req.getOrDefault("rejectionNotes", approve ? null : "Package details require revision");

        String sql = "UPDATE packages SET is_active = ?, rejection_notes = ? WHERE package_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setBoolean(1, approve);
            ps.setString(2, approve ? null : rejectionNotes);
            ps.setInt(3, packageId);
            ps.executeUpdate();
        }
        HttpUtils.sendSuccess(exchange, approve ? "Package approved and published to tourist portal." : "Package rejected and hidden from tourist portal.");
    }

    private void handleListUsers(HttpExchange exchange) throws IOException {
        List<User> list = userRepository.listAllUsers();
        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (User u : list) {
            sanitized.add(com.travel.service.AuthService.sanitizeUser(u));
        }
        HttpUtils.sendSuccess(exchange, sanitized);
    }

    private int queryCount(Connection conn, String sql) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt(1);
        }
        return 0;
    }
}

