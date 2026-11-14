package com.travel.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Manages database connection settings and JDBC connections.
 * Uses pure JDBC without Hibernate or Spring.
 */
public class DatabaseConfig {

    private static final String DEFAULT_HOST = "localhost";
    private static final String DEFAULT_PORT = "3306";
    private static final String DEFAULT_DB = "travel_planner_db";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "root";

    private static String dbHost;
    private static String dbPort;
    private static String dbName;
    private static String dbUser;
    private static String dbPassword;

    static {
        // 1. Load from db.properties if present
        Properties props = new Properties();
        File propFile = new File("db.properties");
        if (!propFile.exists()) {
            propFile = new File("backend/db.properties");
        }
        if (propFile.exists()) {
            try (FileInputStream fis = new FileInputStream(propFile)) {
                props.load(fis);
            } catch (IOException e) {
                System.err.println("[INFO] Could not read db.properties: " + e.getMessage());
            }
        }

        // 2. Read environment variable -> properties file -> default
        dbHost = getVal("DB_HOST", props.getProperty("db.host"), DEFAULT_HOST);
        dbPort = getVal("DB_PORT", props.getProperty("db.port"), DEFAULT_PORT);
        dbName = getVal("DB_NAME", props.getProperty("db.name"), DEFAULT_DB);
        dbUser = getVal("DB_USER", props.getProperty("db.user"), DEFAULT_USER);
        dbPassword = getVal("DB_PASSWORD", props.getProperty("db.password"), DEFAULT_PASSWORD);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[WARN] MySQL JDBC Driver not found in classpath. "
                    + "Please ensure mysql-connector-j.jar is in backend/lib/.");
        }
    }

    private static String getVal(String envKey, String propVal, String defaultVal) {
        String envVal = System.getenv(envKey);
        if (envVal != null && !envVal.trim().isEmpty()) return envVal.trim();
        if (propVal != null && !propVal.trim().isEmpty()) return propVal.trim();
        return defaultVal;
    }

    public static String getJdbcUrl() {
        return "jdbc:mysql://" + dbHost + ":" + dbPort + "/" + dbName
                + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&connectTimeout=3000&socketTimeout=5000";
    }

    public static Connection getConnection() throws SQLException {
        try {
            return DriverManager.getConnection(getJdbcUrl(), dbUser, dbPassword);
        } catch (SQLException e) {
            // Auto-fallback to "root" if an environment variable held an old/incorrect password
            if (!"root".equals(dbPassword)) {
                try {
                    Connection conn = DriverManager.getConnection(getJdbcUrl(), "root", "root");
                    dbPassword = "root"; // update active password
                    return conn;
                } catch (SQLException ignored) {}
            }
            throw e;
        }
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DB-ERROR] Failed to connect to MySQL database at " + getJdbcUrl() + ": " + e.getMessage());
            return false;
        }
    }

    public static void setCredentials(String host, String port, String db, String user, String pass) {
        dbHost = host;
        dbPort = port;
        dbName = db;
        dbUser = user;
        dbPassword = pass;
    }
}
