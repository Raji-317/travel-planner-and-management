package com.travel;

import com.sun.net.httpserver.HttpServer;
import com.travel.config.DatabaseConfig;
import com.travel.config.ServerConfig;
import com.travel.util.HttpUtils;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Executors;

/**
 * Backend server entrypoint using pure Java's built-in HttpServer.
 * No Spring Boot, no external application server.
 */
public class Main {

    private static HttpServer server;

    public static void main(String[] args) {
        int port = ServerConfig.getPort();

        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);
            server.setExecutor(Executors.newFixedThreadPool(ServerConfig.THREAD_POOL_SIZE));

            registerSystemEndpoints();

            server.start();

            printBanner(port);

            // Verify database connection at startup
            boolean dbConnected = DatabaseConfig.testConnection();
            if (dbConnected) {
                System.out.println("[DB-INIT] Successfully connected to MySQL database: travel_planner_db");
            } else {
                System.out.println("[DB-INIT] Warning: Could not reach MySQL. Ensure MySQL is running on port 3306 and schema is loaded.");
            }

        } catch (IOException e) {
            System.err.println("[FATAL] Could not start HTTP server on port " + port + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void registerSystemEndpoints() {
        // Auth Endpoints: /api/auth/register, /api/auth/login, /api/auth/me, etc.
        server.createContext("/api/auth", new com.travel.controller.AuthController());

        // Destination & Attraction Endpoints: /api/destinations, /api/categories, /api/attractions
        com.travel.controller.DestinationController destController = new com.travel.controller.DestinationController();
        server.createContext("/api/destinations", destController);
        server.createContext("/api/categories", destController);
        server.createContext("/api/attractions", destController);

        // Package Endpoints: /api/packages, /api/operator/packages
        com.travel.controller.PackageController pkgController = new com.travel.controller.PackageController();
        server.createContext("/api/packages", pkgController);
        server.createContext("/api/operator/packages", pkgController);

        // Booking & Review Endpoints: /api/bookings, /api/operator/bookings, /api/reviews
        com.travel.controller.BookingController bookingController = new com.travel.controller.BookingController();
        server.createContext("/api/bookings", bookingController);
        server.createContext("/api/operator/bookings", bookingController);
        server.createContext("/api/reviews", bookingController);

        // Smart Travel Planner Endpoints: /api/planner/generate, /api/planner/save, etc.
        server.createContext("/api/planner", new com.travel.controller.PlannerController());

        // Admin Endpoints: /api/admin/dashboard, /api/admin/operators, /api/admin/users
        server.createContext("/api/admin", new com.travel.controller.AdminController());

        // GET /api/health - System and Database Health Check
        server.createContext("/api/health", exchange -> {
            if (HttpUtils.handlePreflight(exchange)) return;
            try {
                boolean dbOk = DatabaseConfig.testConnection();
                Map<String, Object> health = new LinkedHashMap<>();
                health.put("status", "UP");
                health.put("service", "Travel & Tourism Management System API");
                health.put("databaseConnected", dbOk);
                health.put("timestamp", System.currentTimeMillis());
                health.put("jvmVersion", System.getProperty("java.version"));
                health.put("activeThreads", Thread.activeCount());

                HttpUtils.sendSuccess(exchange, health);
            } catch (Exception e) {
                HttpUtils.sendError(exchange, 500, e.getMessage());
            }
        });

        // GET / - Root welcome test
        server.createContext("/", exchange -> {
            if (HttpUtils.handlePreflight(exchange)) return;
            String path = exchange.getRequestURI().getPath();
            if ("/".equals(path)) {
                Map<String, Object> welcome = new LinkedHashMap<>();
                welcome.put("message", "Welcome to Travel & Tourism Management System API");
                welcome.put("version", "1.0.0");
                welcome.put("documentation", "/api/health");
                HttpUtils.sendSuccess(exchange, welcome);
            } else {
                HttpUtils.sendError(exchange, 404, "Endpoint not found: " + path);
            }
        });
    }

    public static HttpServer getServer() {
        return server;
    }

    private static void printBanner(int port) {
        System.out.println("======================================================================");
        System.out.println("   TRAVEL & TOURISM MANAGEMENT SYSTEM WITH SMART TRAVEL PLANNER       ");
        System.out.println("   Pure Java Built-in com.sun.net.httpserver + JDBC Backend           ");
        System.out.println("======================================================================");
        System.out.println("  [SERVER] Listening on http://localhost:" + port);
        System.out.println("  [HEALTH] Healthcheck: http://localhost:" + port + "/api/health");
        System.out.println("  [THREADS] Worker pool capacity: " + ServerConfig.THREAD_POOL_SIZE);
        System.out.println("======================================================================");
    }
}

