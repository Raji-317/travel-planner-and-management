package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.Attraction;
import com.travel.model.AttractionCategory;
import com.travel.model.Destination;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure JDBC repository for Destinations, Categories, and Attractions.
 */
public class DestinationRepository {

    public List<Destination> findAll(String search, String season, Double maxBudget, Boolean featured) {
        List<Destination> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM destinations WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(name) LIKE ? OR LOWER(state) LIKE ? OR LOWER(country) LIKE ?) ");
            String wild = "%" + search.trim().toLowerCase() + "%";
            params.add(wild);
            params.add(wild);
            params.add(wild);
        }
        if (season != null && !season.trim().isEmpty()) {
            sql.append("AND LOWER(best_season) LIKE ? ");
            params.add("%" + season.trim().toLowerCase() + "%");
        }
        if (maxBudget != null && maxBudget > 0) {
            sql.append("AND daily_budget_estimated <= ? ");
            params.add(maxBudget);
        }
        if (featured != null && featured) {
            sql.append("AND is_featured = TRUE ");
        }

        sql.append("ORDER BY popularity_score DESC, total_reviews DESC");

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToDestination(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] DestinationRepository.findAll: " + e.getMessage());
        }
        return list;
    }

    public Destination findById(int id) {
        String sql = "SELECT * FROM destinations WHERE destination_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToDestination(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] DestinationRepository.findById: " + e.getMessage());
        }
        return null;
    }

    public List<Attraction> findAttractionsByDestination(int destinationId, Integer categoryId) {
        List<Attraction> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT a.*, c.name as category_name FROM attractions a "
                + "JOIN attraction_categories c ON a.category_id = c.category_id "
                + "WHERE a.destination_id = ? "
        );
        if (categoryId != null && categoryId > 0) {
            sql.append("AND a.category_id = ? ");
        }
        sql.append("ORDER BY a.popularity_rating DESC");

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            ps.setInt(1, destinationId);
            if (categoryId != null && categoryId > 0) {
                ps.setInt(2, categoryId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToAttraction(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findAttractionsByDestination: " + e.getMessage());
        }
        return list;
    }

    public List<AttractionCategory> findAllCategories() {
        List<AttractionCategory> list = new ArrayList<>();
        String sql = "SELECT * FROM attraction_categories ORDER BY category_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                AttractionCategory cat = new AttractionCategory();
                cat.setCategoryId(rs.getInt("category_id"));
                cat.setName(rs.getString("name"));
                cat.setIconName(rs.getString("icon_name"));
                cat.setDescription(rs.getString("description"));
                list.add(cat);
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findAllCategories: " + e.getMessage());
        }
        return list;
    }

    public Destination saveDestination(Destination d) throws SQLException {
        String sql = "INSERT INTO destinations (name, state, country, description, best_season, daily_budget_estimated, currency, image_url, thumbnail_url, popularity_score, is_featured) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, d.getName());
            ps.setString(2, d.getState());
            ps.setString(3, d.getCountry());
            ps.setString(4, d.getDescription());
            ps.setString(5, d.getBestSeason());
            ps.setDouble(6, d.getDailyBudgetEstimated());
            ps.setString(7, d.getCurrency() != null ? d.getCurrency() : "INR");
            ps.setString(8, d.getImageUrl());
            ps.setString(9, d.getThumbnailUrl());
            ps.setDouble(10, d.getPopularityScore() > 0 ? d.getPopularityScore() : 4.5);
            ps.setBoolean(11, d.isFeatured());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    d.setDestinationId(rs.getInt(1));
                }
            }
        }
        return d;
    }

    private Destination mapRowToDestination(ResultSet rs) throws SQLException {
        Destination d = new Destination();
        d.setDestinationId(rs.getInt("destination_id"));
        d.setName(rs.getString("name"));
        d.setState(rs.getString("state"));
        d.setCountry(rs.getString("country"));
        d.setDescription(rs.getString("description"));
        d.setBestSeason(rs.getString("best_season"));
        d.setDailyBudgetEstimated(rs.getDouble("daily_budget_estimated"));
        d.setCurrency(rs.getString("currency"));
        d.setImageUrl(rs.getString("image_url"));
        d.setThumbnailUrl(rs.getString("thumbnail_url"));
        d.setPopularityScore(rs.getDouble("popularity_score"));
        d.setTotalReviews(rs.getInt("total_reviews"));
        d.setLatitude(rs.getObject("latitude") != null ? rs.getDouble("latitude") : null);
        d.setLongitude(rs.getObject("longitude") != null ? rs.getDouble("longitude") : null);
        d.setFeatured(rs.getBoolean("is_featured"));
        d.setCreatedAt(rs.getTimestamp("created_at"));
        return d;
    }

    private Attraction mapRowToAttraction(ResultSet rs) throws SQLException {
        Attraction a = new Attraction();
        a.setAttractionId(rs.getInt("attraction_id"));
        a.setDestinationId(rs.getInt("destination_id"));
        a.setCategoryId(rs.getInt("category_id"));
        a.setCategoryName(rs.getString("category_name"));
        a.setName(rs.getString("name"));
        a.setDescription(rs.getString("description"));
        a.setEstimatedDurationMin(rs.getInt("estimated_duration_min"));
        a.setTicketPrice(rs.getDouble("ticket_price"));
        Time openTime = rs.getTime("opening_time");
        Time closeTime = rs.getTime("closing_time");
        a.setOpeningTime(openTime != null ? openTime.toString() : "09:00:00");
        a.setClosingTime(closeTime != null ? closeTime.toString() : "18:00:00");
        a.setLatitude(rs.getObject("latitude") != null ? rs.getDouble("latitude") : null);
        a.setLongitude(rs.getObject("longitude") != null ? rs.getDouble("longitude") : null);
        a.setImageUrl(rs.getString("image_url"));
        a.setPopularityRating(rs.getDouble("popularity_rating"));
        a.setWheelchairAccessible(rs.getBoolean("is_wheelchair_accessible"));
        a.setCreatedAt(rs.getTimestamp("created_at"));
        return a;
    }
}
