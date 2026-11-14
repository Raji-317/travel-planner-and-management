package com.travel.config;

/**
 * Server configuration constants and defaults.
 */
public class ServerConfig {
    public static final int DEFAULT_PORT = 8080;
    public static final int THREAD_POOL_SIZE = 16;
    public static final String ALLOWED_ORIGIN = "*"; // Configurable for React dev server
    
    public static int getPort() {
        String portStr = System.getenv("PORT");
        if (portStr != null) {
            try {
                return Integer.parseInt(portStr.trim());
            } catch (NumberFormatException ignored) {}
        }
        return DEFAULT_PORT;
    }
}

