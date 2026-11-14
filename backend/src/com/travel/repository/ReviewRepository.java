package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.Review;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ReviewRepository {

    public Review addReview(Review r) throws SQLException {
        String sql = "INSERT INTO reviews (user_id, package_id, rating, review_title, comment) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, r.getUserId());
            ps.setInt(2, r.getPackageId());
            ps.setInt(3, r.getRating());
            ps.setString(4, r.getReviewTitle());
            ps.setString(5, r.getComment());
            ps.executeUpdate();

            // Update average rating on package
            updatePackageRating(conn, r.getPackageId());
        }
        return r;
    }

    public List<Review> findPackageReviews(int packageId) {
        List<Review> list = new ArrayList<>();
        String sql = "SELECT r.*, u.full_name as user_full_name, u.avatar_url as user_avatar_url "
                + "FROM reviews r JOIN users u ON r.user_id = u.user_id "
                + "WHERE r.package_id = ? ORDER BY r.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, packageId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Review rev = new Review();
                    rev.setReviewId(rs.getInt("review_id"));
                    rev.setUserId(rs.getInt("user_id"));
                    rev.setUserFullName(rs.getString("user_full_name"));
                    rev.setUserAvatarUrl(rs.getString("user_avatar_url"));
                    rev.setPackageId(rs.getInt("package_id"));
                    rev.setRating(rs.getInt("rating"));
                    rev.setReviewTitle(rs.getString("review_title"));
                    rev.setComment(rs.getString("comment"));
                    rev.setCreatedAt(rs.getTimestamp("created_at"));
                    list.add(rev);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findPackageReviews: " + e.getMessage());
        }
        return list;
    }

    private void updatePackageRating(Connection conn, int packageId) {
        String sql = "UPDATE packages SET rating = (SELECT AVG(rating) FROM reviews WHERE package_id = ?) WHERE package_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, packageId);
            ps.setInt(2, packageId);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] updatePackageRating: " + e.getMessage());
        }
    }
}

