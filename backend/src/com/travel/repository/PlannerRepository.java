package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.model.ItineraryDay;
import com.travel.model.ItineraryPlace;
import com.travel.model.SavedItinerary;
import com.travel.planner.AttractionGraph;
import com.travel.planner.AttractionNode;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PlannerRepository {

    public AttractionGraph loadGraphForDestination(int destinationId) {
        AttractionGraph graph = new AttractionGraph();

        // 1. Load Attractions
        String attSql = "SELECT a.*, c.name as category_name FROM attractions a "
                + "JOIN attraction_categories c ON a.category_id = c.category_id "
                + "WHERE a.destination_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(attSql)) {
            ps.setInt(1, destinationId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int id = rs.getInt("attraction_id");
                    String name = rs.getString("name");
                    int catId = rs.getInt("category_id");
                    String catName = rs.getString("category_name");
                    int dur = rs.getInt("estimated_duration_min");
                    double price = rs.getDouble("ticket_price");
                    Time openTime = rs.getTime("opening_time");
                    Time closeTime = rs.getTime("closing_time");
                    double lat = rs.getDouble("latitude");
                    double lng = rs.getDouble("longitude");
                    double pop = rs.getDouble("popularity_rating");

                    AttractionNode node = new AttractionNode(id, name, catId, catName, dur, price,
                            openTime != null ? openTime.toString() : "09:00:00",
                            closeTime != null ? closeTime.toString() : "18:00:00",
                            lat, lng, pop);
                    graph.addNode(node);
                }
            }

            // 2. Load Distance & Time Edges
            String edgeSql = "SELECT d.* FROM attraction_distances d "
                    + "JOIN attractions a1 ON d.origin_attraction_id = a1.attraction_id "
                    + "WHERE a1.destination_id = ?";
            try (PreparedStatement psEdge = conn.prepareStatement(edgeSql)) {
                psEdge.setInt(1, destinationId);
                try (ResultSet rsEdge = psEdge.executeQuery()) {
                    while (rsEdge.next()) {
                        int orig = rsEdge.getInt("origin_attraction_id");
                        int dest = rsEdge.getInt("dest_attraction_id");
                        double distKm = rsEdge.getDouble("distance_km");
                        int timeMin = rsEdge.getInt("travel_time_min");
                        double fare = rsEdge.getDouble("estimated_fare");
                        graph.addEdge(orig, dest, distKm, timeMin, fare);
                    }
                }
            }

        } catch (SQLException e) {
            System.err.println("[REPO-ERR] loadGraphForDestination: " + e.getMessage());
        }

        return graph;
    }

    public SavedItinerary saveItinerary(SavedItinerary itin) throws SQLException {
        String itinSql = "INSERT INTO saved_itineraries (user_id, share_token, title, starting_location, "
                + "destination_id, destination_name, travel_days, num_travelers, total_budget, estimated_cost, travel_pace, "
                + "preferred_transport, interests_csv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        String daySql = "INSERT INTO itinerary_days (itinerary_id, day_number, estimated_day_cost, estimated_travel_time_min) "
                + "VALUES (?, ?, ?, ?)";

        String placeSql = "INSERT INTO itinerary_places (itinerary_day_id, attraction_id, visit_order, "
                + "time_slot, allocated_duration_min, travel_time_to_next_min, estimated_cost, notes) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false);

            String shareToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            itin.setShareToken(shareToken);

            int itinId;
            try (PreparedStatement psItin = conn.prepareStatement(itinSql, Statement.RETURN_GENERATED_KEYS)) {
                if (itin.getUserId() != null && itin.getUserId() > 0) {
                    psItin.setInt(1, itin.getUserId());
                } else {
                    psItin.setNull(1, Types.INTEGER);
                }
                psItin.setString(2, shareToken);
                psItin.setString(3, itin.getTitle());
                psItin.setString(4, itin.getStartingLocation());
                if (itin.getDestinationId() > 0 && itin.getDestinationId() != 9999) {
                    psItin.setInt(5, itin.getDestinationId());
                } else {
                    psItin.setNull(5, Types.INTEGER);
                }
                psItin.setString(6, itin.getDestinationName());
                psItin.setInt(7, itin.getTravelDays());
                psItin.setInt(8, itin.getNumTravelers());
                psItin.setDouble(9, itin.getTotalBudget());
                psItin.setDouble(10, itin.getEstimatedCost());
                psItin.setString(11, itin.getTravelPace());
                psItin.setString(12, itin.getPreferredTransport());
                psItin.setString(13, itin.getInterestsCsv());
                psItin.executeUpdate();

                try (ResultSet rs = psItin.getGeneratedKeys()) {
                    if (rs.next()) {
                        itinId = rs.getInt(1);
                        itin.setItineraryId(itinId);
                    } else {
                        throw new SQLException("Failed to get generated itinerary key.");
                    }
                }
            }

            for (ItineraryDay day : itin.getDays()) {
                int dayId;
                try (PreparedStatement psDay = conn.prepareStatement(daySql, Statement.RETURN_GENERATED_KEYS)) {
                    psDay.setInt(1, itinId);
                    psDay.setInt(2, day.getDayNumber());
                    psDay.setDouble(3, day.getEstimatedDayCost());
                    psDay.setInt(4, day.getEstimatedTravelTimeMin());
                    psDay.executeUpdate();
                    try (ResultSet rsDay = psDay.getGeneratedKeys()) {
                        if (rsDay.next()) {
                            dayId = rsDay.getInt(1);
                            day.setItineraryDayId(dayId);
                        } else {
                            throw new SQLException("Failed to get generated itinerary day key.");
                        }
                    }
                }

                if (day.getPlaces() != null) {
                    try (PreparedStatement psPlace = conn.prepareStatement(placeSql)) {
                        for (ItineraryPlace p : day.getPlaces()) {
                            psPlace.setInt(1, dayId);
                            if (p.getAttractionId() > 0) {
                                psPlace.setInt(2, p.getAttractionId());
                            } else {
                                psPlace.setNull(2, Types.INTEGER);
                            }
                            psPlace.setInt(3, p.getVisitOrder());
                            psPlace.setString(4, p.getTimeSlot());
                            psPlace.setInt(5, p.getAllocatedDurationMin());
                            psPlace.setInt(6, p.getTravelTimeToNextMin());
                            psPlace.setDouble(7, p.getEstimatedCost());
                            psPlace.setString(8, p.getNotes());
                            psPlace.addBatch();
                        }
                        psPlace.executeBatch();
                    }
                }
            }

            conn.commit();
            return itin;
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

    public List<SavedItinerary> findUserItineraries(int userId) {
        List<SavedItinerary> list = new ArrayList<>();
        String sql = "SELECT i.*, COALESCE(d.name, i.destination_name, 'India Destination') as destination_name FROM saved_itineraries i "
                + "LEFT JOIN destinations d ON i.destination_id = d.destination_id "
                + "WHERE i.user_id = ? ORDER BY i.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    SavedItinerary itin = mapRowToItinerary(rs);
                    itin.setDays(loadDaysForItinerary(conn, itin.getItineraryId()));
                    list.add(itin);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findUserItineraries: " + e.getMessage());
        }
        return list;
    }

    public SavedItinerary findById(int itineraryId) {
        String sql = "SELECT i.*, COALESCE(d.name, i.destination_name, 'India Destination') as destination_name FROM saved_itineraries i "
                + "LEFT JOIN destinations d ON i.destination_id = d.destination_id "
                + "WHERE i.itinerary_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, itineraryId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    SavedItinerary itin = mapRowToItinerary(rs);
                    itin.setDays(loadDaysForItinerary(conn, itineraryId));
                    return itin;
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findById: " + e.getMessage());
        }
        return null;
    }

    private List<ItineraryDay> loadDaysForItinerary(Connection conn, int itineraryId) throws SQLException {
        List<ItineraryDay> days = new ArrayList<>();
        String sql = "SELECT * FROM itinerary_days WHERE itinerary_id = ? ORDER BY day_number ASC";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, itineraryId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ItineraryDay d = new ItineraryDay();
                    int dayId = rs.getInt("itinerary_day_id");
                    d.setItineraryDayId(dayId);
                    d.setItineraryId(rs.getInt("itinerary_id"));
                    d.setDayNumber(rs.getInt("day_number"));
                    Date dDate = rs.getDate("day_date");
                    d.setDayDate(dDate != null ? dDate.toString() : "");
                    d.setEstimatedDayCost(rs.getDouble("estimated_day_cost"));
                    d.setEstimatedTravelTimeMin(rs.getInt("estimated_travel_time_min"));
                    d.setPlaces(loadPlacesForDay(conn, dayId));
                    days.add(d);
                }
            }
        }
        return days;
    }

    private List<ItineraryPlace> loadPlacesForDay(Connection conn, int dayId) throws SQLException {
        List<ItineraryPlace> places = new ArrayList<>();
        String sql = "SELECT p.*, a.name as attraction_name, c.name as category_name, a.image_url "
                + "FROM itinerary_places p "
                + "JOIN attractions a ON p.attraction_id = a.attraction_id "
                + "JOIN attraction_categories c ON a.category_id = c.category_id "
                + "WHERE p.itinerary_day_id = ? ORDER BY p.visit_order ASC";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, dayId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ItineraryPlace pl = new ItineraryPlace();
                    pl.setItineraryPlaceId(rs.getInt("itinerary_place_id"));
                    pl.setItineraryDayId(rs.getInt("itinerary_day_id"));
                    pl.setAttractionId(rs.getInt("attraction_id"));
                    pl.setAttractionName(rs.getString("attraction_name"));
                    pl.setCategoryName(rs.getString("category_name"));
                    pl.setImageUrl(rs.getString("image_url"));
                    pl.setVisitOrder(rs.getInt("visit_order"));
                    pl.setTimeSlot(rs.getString("time_slot"));
                    pl.setAllocatedDurationMin(rs.getInt("allocated_duration_min"));
                    pl.setTravelTimeToNextMin(rs.getInt("travel_time_to_next_min"));
                    pl.setEstimatedCost(rs.getDouble("estimated_cost"));
                    pl.setNotes(rs.getString("notes"));
                    places.add(pl);
                }
            }
        }
        return places;
    }

    private SavedItinerary mapRowToItinerary(ResultSet rs) throws SQLException {
        SavedItinerary itin = new SavedItinerary();
        itin.setItineraryId(rs.getInt("itinerary_id"));
        int uid = rs.getInt("user_id");
        if (!rs.wasNull()) itin.setUserId(uid);
        itin.setShareToken(rs.getString("share_token"));
        itin.setTitle(rs.getString("title"));
        itin.setStartingLocation(rs.getString("starting_location"));
        itin.setDestinationId(rs.getInt("destination_id"));
        itin.setDestinationName(rs.getString("destination_name"));
        itin.setTravelDays(rs.getInt("travel_days"));
        itin.setNumTravelers(rs.getInt("num_travelers"));
        itin.setTotalBudget(rs.getDouble("total_budget"));
        itin.setEstimatedCost(rs.getDouble("estimated_cost"));
        itin.setTravelPace(rs.getString("travel_pace"));
        itin.setPreferredTransport(rs.getString("preferred_transport"));
        itin.setInterestsCsv(rs.getString("interests_csv"));
        itin.setCreatedAt(rs.getTimestamp("created_at"));
        return itin;
    }
}

