package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.Package;
import com.travel.model.PackageDeparture;
import com.travel.model.PackageItineraryDay;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure JDBC repository for Package, Itinerary Day, and Departure persistence.
 */
public class PackageRepository {

    public List<Package> findAll(String destination, Double maxPrice, Integer durationDays, String search) {
        List<Package> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT p.*, d.name as destination_name, u.full_name as operator_name "
                + "FROM packages p "
                + "JOIN destinations d ON p.destination_id = d.destination_id "
                + "JOIN users u ON p.operator_id = u.user_id "
                + "WHERE p.is_active = TRUE "
        );
        List<Object> params = new ArrayList<>();

        if (destination != null && !destination.trim().isEmpty()) {
            sql.append("AND (LOWER(d.name) LIKE ? OR LOWER(d.country) LIKE ?) ");
            String dWild = "%" + destination.trim().toLowerCase() + "%";
            params.add(dWild);
            params.add(dWild);
        }
        if (maxPrice != null && maxPrice > 0) {
            sql.append("AND p.base_price_per_person <= ? ");
            params.add(maxPrice);
        }
        if (durationDays != null && durationDays > 0) {
            sql.append("AND p.duration_days = ? ");
            params.add(durationDays);
        }
        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ?) ");
            String sWild = "%" + search.trim().toLowerCase() + "%";
            params.add(sWild);
            params.add(sWild);
        }

        sql.append("ORDER BY p.rating DESC, p.total_bookings DESC");

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToPackage(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] PackageRepository.findAll: " + e.getMessage());
        }
        return list;
    }

    public Package findById(int id) {
        String sql = "SELECT p.*, d.name as destination_name, u.full_name as operator_name "
                + "FROM packages p "
                + "JOIN destinations d ON p.destination_id = d.destination_id "
                + "JOIN users u ON p.operator_id = u.user_id "
                + "WHERE p.package_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Package pkg = mapRowToPackage(rs);
                    pkg.setItineraryDays(findItineraryDaysByPackageId(conn, id));
                    pkg.setDepartures(findDeparturesByPackageId(conn, id));
                    return pkg;
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] PackageRepository.findById: " + e.getMessage());
        }
        return null;
    }

    public List<Package> findByOperatorId(int operatorId) {
        List<Package> list = new ArrayList<>();
        String sql = "SELECT p.*, d.name as destination_name, u.full_name as operator_name "
                + "FROM packages p "
                + "JOIN destinations d ON p.destination_id = d.destination_id "
                + "JOIN users u ON p.operator_id = u.user_id "
                + "WHERE p.operator_id = ? "
                + "ORDER BY p.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, operatorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Package p = mapRowToPackage(rs);
                    p.setItineraryDays(findItineraryDaysByPackageId(conn, p.getPackageId()));
                    p.setDepartures(findDeparturesByPackageId(conn, p.getPackageId()));
                    list.add(p);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findByOperatorId: " + e.getMessage());
        }
        return list;
    }

    public Package createPackage(Package pkg) throws SQLException {
        String pkgSql = "INSERT INTO packages (operator_id, destination_id, title, slug, description, duration_days, "
                + "duration_nights, base_price_per_person, max_travellers, included_services, excluded_services, "
                + "accommodation_details, transportation_details, image_url, rating, total_bookings, is_active) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, FALSE)";

        String daySql = "INSERT INTO package_itinerary_days (package_id, day_number, title, description, "
                + "morning_activity, afternoon_activity, evening_activity, meals_included) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        String depSql = "INSERT INTO package_departures (package_id, start_date, end_date, total_slots, available_slots, status) "
                + "VALUES (?, ?, ?, ?, ?, 'OPEN')";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false); // Begin Atomic Transaction

            int pkgId;
            try (PreparedStatement psPkg = conn.prepareStatement(pkgSql, Statement.RETURN_GENERATED_KEYS)) {
                psPkg.setInt(1, pkg.getOperatorId());
                psPkg.setInt(2, pkg.getDestinationId());
                psPkg.setString(3, pkg.getTitle());
                String slug = pkg.getTitle().toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis() % 10000;
                psPkg.setString(4, slug);
                psPkg.setString(5, pkg.getDescription());
                psPkg.setInt(6, pkg.getDurationDays());
                psPkg.setInt(7, pkg.getDurationNights());
                psPkg.setDouble(8, pkg.getBasePricePerPerson());
                psPkg.setInt(9, pkg.getMaxTravellers() > 0 ? pkg.getMaxTravellers() : 30);
                psPkg.setString(10, pkg.getIncludedServices());
                psPkg.setString(11, pkg.getExcludedServices());
                psPkg.setString(12, pkg.getAccommodationDetails());
                psPkg.setString(13, pkg.getTransportationDetails());
                psPkg.setString(14, pkg.getImageUrl());
                psPkg.executeUpdate();

                try (ResultSet rs = psPkg.getGeneratedKeys()) {
                    if (rs.next()) {
                        pkgId = rs.getInt(1);
                        pkg.setPackageId(pkgId);
                        pkg.setSlug(slug);
                    } else {
                        throw new SQLException("Failed to retrieve generated package ID.");
                    }
                }
            }

            // Insert Itinerary Days
            if (pkg.getItineraryDays() != null && !pkg.getItineraryDays().isEmpty()) {
                try (PreparedStatement psDay = conn.prepareStatement(daySql)) {
                    for (PackageItineraryDay day : pkg.getItineraryDays()) {
                        psDay.setInt(1, pkgId);
                        psDay.setInt(2, day.getDayNumber());
                        psDay.setString(3, day.getTitle());
                        psDay.setString(4, day.getDescription());
                        psDay.setString(5, day.getMorningActivity());
                        psDay.setString(6, day.getAfternoonActivity());
                        psDay.setString(7, day.getEveningActivity());
                        psDay.setString(8, day.getMealsIncluded());
                        psDay.addBatch();
                    }
                    psDay.executeBatch();
                }
            }

            // Insert Departures
            if (pkg.getDepartures() != null && !pkg.getDepartures().isEmpty()) {
                try (PreparedStatement psDep = conn.prepareStatement(depSql)) {
                    for (PackageDeparture dep : pkg.getDepartures()) {
                        psDep.setInt(1, pkgId);
                        psDep.setDate(2, Date.valueOf(dep.getStartDate()));
                        psDep.setDate(3, Date.valueOf(dep.getEndDate()));
                        int slots = dep.getTotalSlots() > 0 ? dep.getTotalSlots() : pkg.getMaxTravellers();
                        psDep.setInt(4, slots);
                        psDep.setInt(5, slots);
                        psDep.addBatch();
                    }
                    psDep.executeBatch();
                }
            }

            conn.commit(); // Commit Transaction
            return pkg;
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

    public boolean updatePackage(Package pkg) {
        String sql = "UPDATE packages SET title = ?, description = ?, destination_id = ?, duration_days = ?, "
                + "duration_nights = ?, base_price_per_person = ?, max_travellers = ?, included_services = ?, "
                + "excluded_services = ?, accommodation_details = ?, transportation_details = ?, image_url = ?, "
                + "is_active = ? WHERE package_id = ? AND operator_id = ?";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, pkg.getTitle());
                ps.setString(2, pkg.getDescription());
                ps.setInt(3, pkg.getDestinationId());
                ps.setInt(4, pkg.getDurationDays());
                ps.setInt(5, pkg.getDurationNights());
                ps.setDouble(6, pkg.getBasePricePerPerson());
                ps.setInt(7, pkg.getMaxTravellers());
                ps.setString(8, pkg.getIncludedServices());
                ps.setString(9, pkg.getExcludedServices());
                ps.setString(10, pkg.getAccommodationDetails());
                ps.setString(11, pkg.getTransportationDetails());
                ps.setString(12, pkg.getImageUrl());
                ps.setBoolean(13, pkg.isActive());
                ps.setInt(14, pkg.getPackageId());
                ps.setInt(15, pkg.getOperatorId());
                int updatedRows = ps.executeUpdate();
                if (updatedRows == 0) {
                    conn.rollback();
                    return false;
                }
            }

            // Replace itinerary days if provided
            if (pkg.getItineraryDays() != null) {
                try (PreparedStatement delPs = conn.prepareStatement("DELETE FROM package_itinerary_days WHERE package_id = ?")) {
                    delPs.setInt(1, pkg.getPackageId());
                    delPs.executeUpdate();
                }

                if (!pkg.getItineraryDays().isEmpty()) {
                    String daySql = "INSERT INTO package_itinerary_days (package_id, day_number, title, description, "
                            + "morning_activity, afternoon_activity, evening_activity, meals_included) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement psDay = conn.prepareStatement(daySql)) {
                        for (PackageItineraryDay day : pkg.getItineraryDays()) {
                            psDay.setInt(1, pkg.getPackageId());
                            psDay.setInt(2, day.getDayNumber());
                            psDay.setString(3, day.getTitle() != null ? day.getTitle() : ("Day " + day.getDayNumber()));
                            psDay.setString(4, day.getDescription() != null ? day.getDescription() : "");
                            psDay.setString(5, day.getMorningActivity());
                            psDay.setString(6, day.getAfternoonActivity());
                            psDay.setString(7, day.getEveningActivity());
                            psDay.setString(8, day.getMealsIncluded());
                            psDay.addBatch();
                        }
                        psDay.executeBatch();
                    }
                }
            }

            // Replace departures if provided
            if (pkg.getDepartures() != null && !pkg.getDepartures().isEmpty()) {
                try (PreparedStatement delDep = conn.prepareStatement("DELETE FROM package_departures WHERE package_id = ? AND status = 'OPEN'")) {
                    delDep.setInt(1, pkg.getPackageId());
                    delDep.executeUpdate();
                }
                String depSql = "INSERT INTO package_departures (package_id, start_date, end_date, total_slots, available_slots, status) "
                        + "VALUES (?, ?, ?, ?, ?, 'OPEN')";
                try (PreparedStatement psDep = conn.prepareStatement(depSql)) {
                    for (PackageDeparture dep : pkg.getDepartures()) {
                        psDep.setInt(1, pkg.getPackageId());
                        psDep.setDate(2, Date.valueOf(dep.getStartDate()));
                        psDep.setDate(3, Date.valueOf(dep.getEndDate()));
                        int slots = dep.getTotalSlots() > 0 ? dep.getTotalSlots() : pkg.getMaxTravellers();
                        psDep.setInt(4, slots);
                        psDep.setInt(5, slots);
                        psDep.addBatch();
                    }
                    psDep.executeBatch();
                }
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] updatePackage: " + e.getMessage());
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            return false;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    public boolean deletePackage(int packageId, int operatorId) {
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false);

            // Clean up dependent child records if possible
            try (PreparedStatement psDays = conn.prepareStatement("DELETE FROM package_itinerary_days WHERE package_id = ?")) {
                psDays.setInt(1, packageId);
                psDays.executeUpdate();
            }

            try (PreparedStatement psDeps = conn.prepareStatement("DELETE FROM package_departures WHERE package_id = ?")) {
                psDeps.setInt(1, packageId);
                psDeps.executeUpdate();
            }

            try (PreparedStatement psPkg = conn.prepareStatement("DELETE FROM packages WHERE package_id = ? AND operator_id = ?")) {
                psPkg.setInt(1, packageId);
                psPkg.setInt(2, operatorId);
                int rows = psPkg.executeUpdate();
                if (rows > 0) {
                    conn.commit();
                    return true;
                }
            }

            conn.rollback();
        } catch (SQLException e) {
            System.err.println("[REPO-WARN] deletePackage physical delete, falling back to soft delete: " + e.getMessage());
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }

        // Soft delete fallback in case there are bookings attached
        String softSql = "UPDATE packages SET is_active = FALSE WHERE package_id = ? AND operator_id = ?";
        try (Connection c2 = DatabaseConfig.getConnection();
             PreparedStatement ps = c2.prepareStatement(softSql)) {
            ps.setInt(1, packageId);
            ps.setInt(2, operatorId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] deletePackage: " + e.getMessage());
            return false;
        }
    }

    public List<PackageItineraryDay> findItineraryDaysByPackageId(Connection conn, int packageId) throws SQLException {
        List<PackageItineraryDay> days = new ArrayList<>();
        String sql = "SELECT * FROM package_itinerary_days WHERE package_id = ? ORDER BY day_number ASC";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, packageId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PackageItineraryDay d = new PackageItineraryDay();
                    d.setItineraryDayId(rs.getInt("itinerary_day_id"));
                    d.setPackageId(rs.getInt("package_id"));
                    d.setDayNumber(rs.getInt("day_number"));
                    d.setTitle(rs.getString("title"));
                    d.setDescription(rs.getString("description"));
                    d.setMorningActivity(rs.getString("morning_activity"));
                    d.setAfternoonActivity(rs.getString("afternoon_activity"));
                    d.setEveningActivity(rs.getString("evening_activity"));
                    d.setMealsIncluded(rs.getString("meals_included"));
                    days.add(d);
                }
            }
        }
        return days;
    }

    public List<PackageDeparture> findDeparturesByPackageId(Connection conn, int packageId) throws SQLException {
        List<PackageDeparture> deps = new ArrayList<>();
        String sql = "SELECT * FROM package_departures WHERE package_id = ? AND status = 'OPEN' AND start_date >= CURRENT_DATE ORDER BY start_date ASC";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, packageId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    PackageDeparture dep = new PackageDeparture();
                    dep.setDepartureId(rs.getInt("departure_id"));
                    dep.setPackageId(rs.getInt("package_id"));
                    Date sDate = rs.getDate("start_date");
                    Date eDate = rs.getDate("end_date");
                    dep.setStartDate(sDate != null ? sDate.toString() : "");
                    dep.setEndDate(eDate != null ? eDate.toString() : "");
                    dep.setTotalSlots(rs.getInt("total_slots"));
                    dep.setAvailableSlots(rs.getInt("available_slots"));
                    dep.setStatus(rs.getString("status"));
                    deps.add(dep);
                }
            }
        }
        return deps;
    }

    private Package mapRowToPackage(ResultSet rs) throws SQLException {
        Package p = new Package();
        p.setPackageId(rs.getInt("package_id"));
        p.setOperatorId(rs.getInt("operator_id"));
        p.setOperatorName(rs.getString("operator_name"));
        p.setDestinationId(rs.getInt("destination_id"));
        p.setDestinationName(rs.getString("destination_name"));
        p.setTitle(rs.getString("title"));
        p.setSlug(rs.getString("slug"));
        p.setDescription(rs.getString("description"));
        p.setDurationDays(rs.getInt("duration_days"));
        p.setDurationNights(rs.getInt("duration_nights"));
        p.setBasePricePerPerson(rs.getDouble("base_price_per_person"));
        p.setMaxTravellers(rs.getInt("max_travellers"));
        p.setIncludedServices(rs.getString("included_services"));
        p.setExcludedServices(rs.getString("excluded_services"));
        p.setAccommodationDetails(rs.getString("accommodation_details"));
        p.setTransportationDetails(rs.getString("transportation_details"));
        p.setImageUrl(rs.getString("image_url"));
        p.setRating(rs.getDouble("rating"));
        p.setTotalBookings(rs.getInt("total_bookings"));
        p.setActive(rs.getBoolean("is_active"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        return p;
    }
}

