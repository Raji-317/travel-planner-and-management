package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.OperatorProfile;
import com.travel.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure JDBC repository for User and Operator persistence.
 */
public class UserRepository {

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findByEmail: " + e.getMessage());
        }
        return null;
    }

    public User findById(int userId) {
        String sql = "SELECT * FROM users WHERE user_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findById: " + e.getMessage());
        }
        return null;
    }

    public User createTourist(User user) throws SQLException {
        String sql = "INSERT INTO users (email, password_hash, salt, full_name, phone, role, status, avatar_url) "
                + "VALUES (?, ?, ?, ?, ?, 'TOURIST', 'ACTIVE', ?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getEmail().trim().toLowerCase());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getSalt());
            ps.setString(4, user.getFullName());
            ps.setString(5, user.getPhone());
            ps.setString(6, user.getAvatarUrl());

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    user.setUserId(rs.getInt(1));
                    user.setRole("TOURIST");
                    user.setStatus("ACTIVE");
                }
            }
        }
        return user;
    }

    public User createOperator(User user, OperatorProfile profile) throws SQLException {
        String userSql = "INSERT INTO users (email, password_hash, salt, full_name, phone, role, status, avatar_url) "
                + "VALUES (?, ?, ?, ?, ?, 'OPERATOR', 'PENDING_APPROVAL', ?)";
        String profileSql = "INSERT INTO operator_profiles (operator_id, company_name, license_number, years_in_business, "
                + "office_address, support_phone, support_email, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false); // Begin Transaction

            int userId;
            try (PreparedStatement psUser = conn.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS)) {
                psUser.setString(1, user.getEmail().trim().toLowerCase());
                psUser.setString(2, user.getPasswordHash());
                psUser.setString(3, user.getSalt());
                psUser.setString(4, user.getFullName());
                psUser.setString(5, user.getPhone());
                psUser.setString(6, user.getAvatarUrl());
                psUser.executeUpdate();

                try (ResultSet rs = psUser.getGeneratedKeys()) {
                    if (rs.next()) {
                        userId = rs.getInt(1);
                        user.setUserId(userId);
                        user.setRole("OPERATOR");
                        user.setStatus("PENDING_APPROVAL");
                    } else {
                        throw new SQLException("Failed to generate user ID for operator.");
                    }
                }
            }

            try (PreparedStatement psProf = conn.prepareStatement(profileSql)) {
                psProf.setInt(1, userId);
                psProf.setString(2, profile.getCompanyName());
                psProf.setString(3, profile.getLicenseNumber());
                psProf.setInt(4, profile.getYearsInBusiness());
                psProf.setString(5, profile.getOfficeAddress());
                psProf.setString(6, profile.getSupportPhone());
                psProf.setString(7, profile.getSupportEmail());
                psProf.executeUpdate();
            }

            conn.commit(); // Commit Transaction
            return user;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    public boolean updateProfile(int userId, String fullName, String phone, String avatarUrl) {
        String sql = "UPDATE users SET full_name = ?, phone = ?, avatar_url = ? WHERE user_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, fullName);
            ps.setString(2, phone);
            ps.setString(3, avatarUrl);
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] updateProfile: " + e.getMessage());
            return false;
        }
    }

    public OperatorProfile getOperatorProfile(int operatorId) {
        String sql = "SELECT * FROM operator_profiles WHERE operator_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, operatorId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    OperatorProfile p = new OperatorProfile();
                    p.setOperatorId(rs.getInt("operator_id"));
                    p.setCompanyName(rs.getString("company_name"));
                    p.setLicenseNumber(rs.getString("license_number"));
                    p.setYearsInBusiness(rs.getInt("years_in_business"));
                    p.setOfficeAddress(rs.getString("office_address"));
                    p.setSupportPhone(rs.getString("support_phone"));
                    p.setSupportEmail(rs.getString("support_email"));
                    p.setVerified(rs.getBoolean("is_verified"));
                    p.setAdminNotes(rs.getString("admin_notes"));
                    p.setVerifiedAt(rs.getTimestamp("verified_at"));
                    p.setCreatedAt(rs.getTimestamp("created_at"));
                    return p;
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] getOperatorProfile: " + e.getMessage());
        }
        return null;
    }

    public List<User> listAllUsers() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY user_id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRowToUser(rs));
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] listAllUsers: " + e.getMessage());
        }
        return list;
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setSalt(rs.getString("salt"));
        u.setFullName(rs.getString("full_name"));
        u.setPhone(rs.getString("phone"));
        u.setRole(rs.getString("role"));
        u.setStatus(rs.getString("status"));
        u.setAvatarUrl(rs.getString("avatar_url"));
        u.setCreatedAt(rs.getTimestamp("created_at"));
        u.setUpdatedAt(rs.getTimestamp("updated_at"));
        return u;
    }
}
