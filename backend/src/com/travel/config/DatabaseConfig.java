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

        // 2. Check for unified connection URL (Railway / Heroku / Render / Aiven)
        String dbUrl = System.getenv("MYSQL_URL");
        if (dbUrl == null || dbUrl.isEmpty()) dbUrl = System.getenv("MYSQL_PRIVATE_URL");
        if (dbUrl == null || dbUrl.isEmpty()) dbUrl = System.getenv("MYSQL_PUBLIC_URL");
        if (dbUrl == null || dbUrl.isEmpty()) dbUrl = System.getenv("DATABASE_URL");

        if (dbUrl != null && !dbUrl.trim().isEmpty()) {
            try {
                String clean = dbUrl.trim();
                if (clean.startsWith("mysql://")) {
                    clean = "http://" + clean.substring(8);
                }
                java.net.URI uri = new java.net.URI(clean);
                if (uri.getHost() != null) dbHost = uri.getHost();
                if (uri.getPort() > 0) dbPort = String.valueOf(uri.getPort());
                if (uri.getPath() != null && uri.getPath().length() > 1) {
                    String p = uri.getPath().substring(1);
                    int qIdx = p.indexOf("?");
                    dbName = (qIdx > 0) ? p.substring(0, qIdx) : p;
                }
                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    dbUser = userParts[0];
                    if (userParts.length > 1) dbPassword = userParts[1];
                }
                System.out.println("[DB-INIT] Detected cloud database URL. Host: " + dbHost + ", Port: " + dbPort + ", DB: " + dbName);
            } catch (Exception e) {
                System.err.println("[WARN] Could not parse DB URL (" + dbUrl + "): " + e.getMessage());
            }
        }

        // 3. Fallback to individual environment variables -> properties file -> default
        if (dbHost == null) dbHost = getValMulti(new String[]{"DB_HOST", "MYSQLHOST", "MYSQL_HOST"}, props.getProperty("db.host"), DEFAULT_HOST);
        if (dbPort == null) dbPort = getValMulti(new String[]{"DB_PORT", "MYSQLPORT", "MYSQL_PORT"}, props.getProperty("db.port"), DEFAULT_PORT);
        if (dbName == null) dbName = getValMulti(new String[]{"DB_NAME", "MYSQLDATABASE", "MYSQL_DATABASE"}, props.getProperty("db.name"), DEFAULT_DB);
        if (dbUser == null) dbUser = getValMulti(new String[]{"DB_USER", "MYSQLUSER", "MYSQL_USER"}, props.getProperty("db.user"), DEFAULT_USER);
        if (dbPassword == null) dbPassword = getValMulti(new String[]{"DB_PASSWORD", "MYSQLPASSWORD", "MYSQL_PASSWORD"}, props.getProperty("db.password"), DEFAULT_PASSWORD);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[WARN] MySQL JDBC Driver not found in classpath. "
                    + "Please ensure mysql-connector-j.jar is in backend/lib/.");
        }
    }

    private static String getValMulti(String[] envKeys, String propVal, String defaultVal) {
        for (String k : envKeys) {
            String val = System.getenv(k);
            if (val != null && !val.trim().isEmpty()) return val.trim();
        }
        if (propVal != null && !propVal.trim().isEmpty()) return propVal.trim();
        return defaultVal;
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
