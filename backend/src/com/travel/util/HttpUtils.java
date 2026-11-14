package com.travel.util;

import com.sun.net.httpserver.HttpExchange;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Utility methods for handling HTTP exchanges in com.sun.net.httpserver.
 */
public class HttpUtils {

    public static void enableCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
    }

    public static boolean handlePreflight(HttpExchange exchange) throws IOException {
        enableCORS(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    public static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[1024];
        int nRead;
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        return new String(buffer.toByteArray(), StandardCharsets.UTF_8);
    }

    public static Map<String, String> parseQueryParams(HttpExchange exchange) {
        Map<String, String> queryMap = new HashMap<>();
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null || query.isEmpty()) {
            return queryMap;
        }
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    queryMap.put(key, value);
                } else if (idx == -1 && !pair.isEmpty()) {
                    String key = URLDecoder.decode(pair, StandardCharsets.UTF_8);
                    queryMap.put(key, "");
                }
            } catch (Exception ignored) {}
        }
        return queryMap;
    }

    public static void sendJsonResponse(HttpExchange exchange, int statusCode, Object data) throws IOException {
        enableCORS(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        String json = JsonParser.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public static void sendSuccess(HttpExchange exchange, Object data) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("data", data);
        sendJsonResponse(exchange, 200, resp);
    }

    public static void sendCreated(HttpExchange exchange, Object data) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("data", data);
        sendJsonResponse(exchange, 201, resp);
    }

    public static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("error", message);
        resp.put("statusCode", statusCode);
        sendJsonResponse(exchange, statusCode, resp);
    }

    /**
     * Extracts path segment after base path, e.g. /api/destinations/123 -> "123"
     */
    public static String extractPathSuffix(String fullPath, String basePrefix) {
        if (fullPath.startsWith(basePrefix)) {
            String suffix = fullPath.substring(basePrefix.length());
            if (suffix.startsWith("/")) {
                suffix = suffix.substring(1);
            }
            int qIdx = suffix.indexOf("?");
            if (qIdx != -1) {
                suffix = suffix.substring(0, qIdx);
            }
            return suffix.trim();
        }
        return "";
    }
}

