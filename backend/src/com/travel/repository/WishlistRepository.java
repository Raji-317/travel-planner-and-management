package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.WishlistItem;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class WishlistRepository {

    public WishlistRepository() {
        initTable();
    }

    private void initTable() {
        String sql = "CREATE TABLE IF NOT EXISTS wishlist ("
                + "wishlist_id INT AUTO_INCREMENT PRIMARY KEY, "
                + "user_id INT NOT NULL, "
                + "package_id INT NULL, "
                + "destination_id INT NULL, "
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                + "UNIQUE KEY uq_user_wishlist_pkg (user_id, package_id), "
                + "UNIQUE KEY uq_user_wishlist_dest (user_id, destination_id)"
                + ") ENGINE=InnoDB;";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (SQLException e) {
            System.err.println("[WISHLIST-REPO] Table init warning: " + e.getMessage());
        }
    }

    public List<WishlistItem> findByUserId(int userId) {
        List<WishlistItem> list = new ArrayList<>();
        String sql = "SELECT w.*, "
                + "d.name as dest_name, d.state as dest_state, d.country as dest_country, "
                + "d.description as dest_desc, d.image_url as dest_img, d.daily_budget_estimated, "
                + "d.popularity_score, d.total_reviews, "
                + "p.title as pkg_title, p.base_price_per_person, p.duration_days "
                + "FROM wishlist w "
                + "LEFT JOIN destinations d ON w.destination_id = d.destination_id "
                + "LEFT JOIN packages p ON w.package_id = p.package_id "
                + "WHERE w.user_id = ? "
                + "ORDER BY w.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    WishlistItem item = new WishlistItem();
                    item.setWishlistId(rs.getInt("wishlist_id"));
                    item.setUserId(rs.getInt("user_id"));

                    int pkgId = rs.getInt("package_id");
                    if (!rs.wasNull()) item.setPackageId(pkgId);

                    int destId = rs.getInt("destination_id");
                    if (!rs.wasNull()) item.setDestinationId(destId);

                    item.setCreatedAt(rs.getTimestamp("created_at"));

                    // Destination fields
                    item.setDestinationName(rs.getString("dest_name"));
                    item.setDestinationState(rs.getString("dest_state"));
                    item.setDestinationCountry(rs.getString("dest_country"));
                    item.setDescription(rs.getString("dest_desc"));
                    item.setImageUrl(rs.getString("dest_img"));
                    item.setDailyBudgetEstimated(rs.getDouble("daily_budget_estimated"));
                    item.setPopularityScore(rs.getDouble("popularity_score"));
                    item.setTotalReviews(rs.getInt("total_reviews"));

                    // Package fields
                    item.setPackageTitle(rs.getString("pkg_title"));
                    item.setBasePricePerPerson(rs.getDouble("base_price_per_person"));
                    item.setDurationDays(rs.getInt("duration_days"));

                    list.add(item);
                }
            }
        } catch (SQLException e) {
            System.err.println("[WISHLIST-REPO] findByUserId error: " + e.getMessage());
        }
        return list;
    }

    public boolean add(int userId, Integer destinationId, Integer packageId) {
        String sql = "INSERT INTO wishlist (user_id, destination_id, package_id) VALUES (?, ?, ?) "
                + "ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            if (destinationId != null && destinationId > 0) {
                ps.setInt(2, destinationId);
            } else {
                ps.setNull(2, Types.INTEGER);
            }

            if (packageId != null && packageId > 0) {
                ps.setInt(3, packageId);
            } else {
                ps.setNull(3, Types.INTEGER);
            }

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[WISHLIST-REPO] add error: " + e.getMessage());
            return false;
        }
    }

    public boolean remove(int userId, Integer destinationId, Integer packageId) {
        StringBuilder sql = new StringBuilder("DELETE FROM wishlist WHERE user_id = ?");
        if (destinationId != null && destinationId > 0) {
            sql.append(" AND destination_id = ?");
        }
        if (packageId != null && packageId > 0) {
            sql.append(" AND package_id = ?");
        }

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            ps.setInt(1, userId);
            int idx = 2;
            if (destinationId != null && destinationId > 0) {
                ps.setInt(idx++, destinationId);
            }
            if (packageId != null && packageId > 0) {
                ps.setInt(idx++, packageId);
            }
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[WISHLIST-REPO] remove error: " + e.getMessage());
            return false;
        }
    }

    public boolean removeById(int userId, int wishlistId) {
        String sql = "DELETE FROM wishlist WHERE wishlist_id = ? AND user_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, wishlistId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[WISHLIST-REPO] removeById error: " + e.getMessage());
            return false;
        }
    }
}
