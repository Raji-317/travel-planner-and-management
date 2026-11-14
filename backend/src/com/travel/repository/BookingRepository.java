package com.travel.repository;

import com.travel.config.DatabaseConfig;
import com.travel.exception.ValidationException;
import com.travel.model.Booking;
import com.travel.model.BookingTraveler;
import com.travel.model.Payment;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Pure JDBC repository managing bookings, passenger manifests, simulated payments,
 * and concurrency-safe seat allocation transactions.
 */
public class BookingRepository {

    public Booking createBooking(int userId, int departureId, int numTravelers,
                                 List<BookingTraveler> travelers, String paymentMethod,
                                 String specialRequests) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false); // Begin Strict Atomic Transaction

            // 1. Fetch package pricing and verify departure exists
            double pricePerPerson;
            int packageId;
            java.sql.Date newStartDate;
            java.sql.Date newEndDate;
            String depInfoSql = "SELECT d.package_id, p.base_price_per_person, d.available_slots, d.start_date, d.end_date "
                    + "FROM package_departures d JOIN packages p ON d.package_id = p.package_id "
                    + "WHERE d.departure_id = ? FOR UPDATE";

            try (PreparedStatement psDep = conn.prepareStatement(depInfoSql)) {
                psDep.setInt(1, departureId);
                try (ResultSet rs = psDep.executeQuery()) {
                    if (!rs.next()) {
                        throw new ValidationException("Departure schedule not found for ID: " + departureId);
                    }
                    packageId = rs.getInt("package_id");
                    pricePerPerson = rs.getDouble("base_price_per_person");
                    newStartDate = rs.getDate("start_date");
                    newEndDate = rs.getDate("end_date");
                    int currentSlots = rs.getInt("available_slots");
                    if (currentSlots < numTravelers) {
                        throw new ValidationException("Only " + currentSlots + " seat(s) remaining. Cannot book " + numTravelers + " slot(s).");
                    }
                }
            }

            // 1b. Check for overlapping active bookings by the same tourist
            if (newStartDate != null && newEndDate != null) {
                String overlapSql = "SELECT b.booking_id, b.booking_ref, p.title as package_title, d.start_date, d.end_date "
                        + "FROM bookings b "
                        + "JOIN package_departures d ON b.departure_id = d.departure_id "
                        + "JOIN packages p ON d.package_id = p.package_id "
                        + "WHERE b.user_id = ? "
                        + "  AND b.booking_status IN ('CONFIRMED', 'PENDING') "
                        + "  AND d.start_date <= ? AND d.end_date >= ?";

                try (PreparedStatement psOverlap = conn.prepareStatement(overlapSql)) {
                    psOverlap.setInt(1, userId);
                    psOverlap.setDate(2, newEndDate);
                    psOverlap.setDate(3, newStartDate);
                    try (ResultSet rsO = psOverlap.executeQuery()) {
                        if (rsO.next()) {
                            int conflictId = rsO.getInt("booking_id");
                            String conflictRef = rsO.getString("booking_ref");
                            String conflictPkg = rsO.getString("package_title");
                            String cStart = rsO.getString("start_date");
                            String cEnd = rsO.getString("end_date");
                            throw new ValidationException("SCHEDULE_CONFLICT:" + conflictId + ":"
                                    + "You already have a tour booked on overlapping dates: \"" + conflictPkg
                                    + "\" (" + cStart + " to " + cEnd + ", Ref: " + conflictRef + "). "
                                    + "Please cancel or manage that existing tour before booking this trip.");
                        }
                    }
                }
            }

            // 2. Concurrency-Safe Atomic Decrement (Prevents Overbooking)
            String decrementSql = "UPDATE package_departures SET available_slots = available_slots - ? "
                    + "WHERE departure_id = ? AND available_slots >= ?";

            try (PreparedStatement psDec = conn.prepareStatement(decrementSql)) {
                psDec.setInt(1, numTravelers);
                psDec.setInt(2, departureId);
                psDec.setInt(3, numTravelers);
                int rowsUpdated = psDec.executeUpdate();
                if (rowsUpdated == 0) {
                    throw new ValidationException("Concurrent booking collision: Seats are no longer available.");
                }
            }

            // 3. Insert Booking Record
            double totalAmount = pricePerPerson * numTravelers;
            String bookingRef = "BK-" + System.currentTimeMillis() / 1000 + "-" + (int)(Math.random() * 900 + 100);
            int bookingId;

            String insertBookingSql = "INSERT INTO bookings (booking_ref, user_id, departure_id, num_travelers, "
                    + "price_per_person, total_amount, booking_status, special_requests) "
                    + "VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)";

            try (PreparedStatement psBook = conn.prepareStatement(insertBookingSql, Statement.RETURN_GENERATED_KEYS)) {
                psBook.setString(1, bookingRef);
                psBook.setInt(2, userId);
                psBook.setInt(3, departureId);
                psBook.setInt(4, numTravelers);
                psBook.setDouble(5, pricePerPerson);
                psBook.setDouble(6, totalAmount);
                psBook.setString(7, specialRequests);
                psBook.executeUpdate();

                try (ResultSet rs = psBook.getGeneratedKeys()) {
                    if (rs.next()) {
                        bookingId = rs.getInt(1);
                    } else {
                        throw new SQLException("Failed to retrieve booking generated key.");
                    }
                }
            }

            // 4. Insert Travelers
            if (travelers != null && !travelers.isEmpty()) {
                String insertTravSql = "INSERT INTO booking_travelers (booking_id, full_name, age, gender, id_proof_type, id_proof_number) "
                        + "VALUES (?, ?, ?, ?, ?, ?)";
                try (PreparedStatement psTrav = conn.prepareStatement(insertTravSql)) {
                    for (BookingTraveler t : travelers) {
                        psTrav.setInt(1, bookingId);
                        psTrav.setString(2, t.getFullName());
                        psTrav.setInt(3, t.getAge());
                        psTrav.setString(4, t.getGender() != null ? t.getGender() : "OTHER");
                        psTrav.setString(5, t.getIdProofType() != null ? t.getIdProofType() : "ID_CARD");
                        psTrav.setString(6, t.getIdProofNumber() != null ? t.getIdProofNumber() : "N/A");
                        psTrav.addBatch();
                    }
                    psTrav.executeBatch();
                }
            }

            // 5. Insert Simulated Payment Record
            String txnRef = "TXN-SIM-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
            String insertPaySql = "INSERT INTO payments (booking_id, transaction_ref, amount, payment_method, payment_status, paid_at) "
                    + "VALUES (?, ?, ?, ?, 'SUCCESS', NOW())";
            try (PreparedStatement psPay = conn.prepareStatement(insertPaySql)) {
                psPay.setInt(1, bookingId);
                psPay.setString(2, txnRef);
                psPay.setDouble(3, totalAmount);
                psPay.setString(4, paymentMethod != null ? paymentMethod : "CARD_SIMULATED");
                psPay.executeUpdate();
            }

            // 6. Update Package Booking Counter
            String updatePkgSql = "UPDATE packages SET total_bookings = total_bookings + 1 WHERE package_id = ?";
            try (PreparedStatement psUpPkg = conn.prepareStatement(updatePkgSql)) {
                psUpPkg.setInt(1, packageId);
                psUpPkg.executeUpdate();
            }

            conn.commit(); // Commit Transaction

            return findById(bookingId);
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

    public List<Booking> findUserBookings(int userId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.email as user_email, u.full_name as user_full_name, "
                + "d.start_date, d.end_date, p.package_id, p.title as package_title, dest.name as destination_name "
                + "FROM bookings b "
                + "JOIN users u ON b.user_id = u.user_id "
                + "JOIN package_departures d ON b.departure_id = d.departure_id "
                + "JOIN packages p ON d.package_id = p.package_id "
                + "JOIN destinations dest ON p.destination_id = dest.destination_id "
                + "WHERE b.user_id = ? "
                + "ORDER BY b.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Booking b = mapRowToBooking(rs);
                    b.setTravelers(findTravelersByBookingId(conn, b.getBookingId()));
                    b.setPayment(findPaymentByBookingId(conn, b.getBookingId()));
                    list.add(b);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findUserBookings: " + e.getMessage());
        }
        return list;
    }

    public List<Booking> findOperatorBookings(int operatorId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.email as user_email, u.full_name as user_full_name, "
                + "d.start_date, d.end_date, p.package_id, p.title as package_title, dest.name as destination_name "
                + "FROM bookings b "
                + "JOIN users u ON b.user_id = u.user_id "
                + "JOIN package_departures d ON b.departure_id = d.departure_id "
                + "JOIN packages p ON d.package_id = p.package_id "
                + "JOIN destinations dest ON p.destination_id = dest.destination_id "
                + "WHERE p.operator_id = ? "
                + "ORDER BY b.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, operatorId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Booking b = mapRowToBooking(rs);
                    b.setTravelers(findTravelersByBookingId(conn, b.getBookingId()));
                    b.setPayment(findPaymentByBookingId(conn, b.getBookingId()));
                    list.add(b);
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findOperatorBookings: " + e.getMessage());
        }
        return list;
    }

    public List<Booking> findAllBookings() {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.email as user_email, u.full_name as user_full_name, "
                + "d.start_date, d.end_date, p.package_id, p.title as package_title, dest.name as destination_name, "
                + "u_op.full_name as operator_name, op.company_name as operator_company "
                + "FROM bookings b "
                + "JOIN users u ON b.user_id = u.user_id "
                + "JOIN package_departures d ON b.departure_id = d.departure_id "
                + "JOIN packages p ON d.package_id = p.package_id "
                + "JOIN destinations dest ON p.destination_id = dest.destination_id "
                + "JOIN users u_op ON p.operator_id = u_op.user_id "
                + "LEFT JOIN operator_profiles op ON u_op.user_id = op.operator_id "
                + "ORDER BY b.created_at DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Booking b = mapRowToBooking(rs);
                b.setOperatorName(rs.getString("operator_name"));
                b.setOperatorCompany(rs.getString("operator_company"));
                b.setTravelers(findTravelersByBookingId(conn, b.getBookingId()));
                b.setPayment(findPaymentByBookingId(conn, b.getBookingId()));
                list.add(b);
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] findAllBookings: " + e.getMessage());
        }
        return list;
    }

    public Booking findById(int bookingId) {
        String sql = "SELECT b.*, u.email as user_email, u.full_name as user_full_name, "
                + "d.start_date, d.end_date, p.package_id, p.title as package_title, dest.name as destination_name "
                + "FROM bookings b "
                + "JOIN users u ON b.user_id = u.user_id "
                + "JOIN package_departures d ON b.departure_id = d.departure_id "
                + "JOIN packages p ON d.package_id = p.package_id "
                + "JOIN destinations dest ON p.destination_id = dest.destination_id "
                + "WHERE b.booking_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Booking b = mapRowToBooking(rs);
                    b.setTravelers(findTravelersByBookingId(conn, bookingId));
                    b.setPayment(findPaymentByBookingId(conn, bookingId));
                    return b;
                }
            }
        } catch (SQLException e) {
            System.err.println("[REPO-ERR] BookingRepository.findById: " + e.getMessage());
        }
        return null;
    }

    public boolean cancelBooking(int bookingId, int userId, String reason) throws SQLException {
        Connection conn = null;
        try {
            conn = DatabaseConfig.getConnection();
            conn.setAutoCommit(false);

            // Verify booking ownership and status
            int departureId;
            int numTravelers;
            double totalAmount;
            String statusSql = "SELECT departure_id, num_travelers, total_amount, booking_status "
                    + "FROM bookings WHERE booking_id = ? AND user_id = ? FOR UPDATE";

            try (PreparedStatement ps = conn.prepareStatement(statusSql)) {
                ps.setInt(1, bookingId);
                ps.setInt(2, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        throw new ValidationException("Booking not found or not owned by current user.");
                    }
                    if ("CANCELLED".equalsIgnoreCase(rs.getString("booking_status"))) {
                        throw new ValidationException("This booking is already cancelled.");
                    }
                    departureId = rs.getInt("departure_id");
                    numTravelers = rs.getInt("num_travelers");
                    totalAmount = rs.getDouble("total_amount");
                }
            }

            // Update booking status
            String updateBkSql = "UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(updateBkSql)) {
                ps.setInt(1, bookingId);
                ps.executeUpdate();
            }

            // Restore available slots
            String restoreSlotsSql = "UPDATE package_departures SET available_slots = available_slots + ? WHERE departure_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(restoreSlotsSql)) {
                ps.setInt(1, numTravelers);
                ps.setInt(2, departureId);
                ps.executeUpdate();
            }

            // Insert Cancellation & Refund record
            String insertCancelSql = "INSERT INTO cancellations (booking_id, reason, refund_amount, refund_status) VALUES (?, ?, ?, 'PROCESSED')";
            try (PreparedStatement ps = conn.prepareStatement(insertCancelSql)) {
                ps.setInt(1, bookingId);
                ps.setString(2, reason != null ? reason : "Requested by traveler");
                ps.setDouble(3, totalAmount); // Full simulated refund
                ps.executeUpdate();
            }

            // Update payment record
            String updatePaySql = "UPDATE payments SET payment_status = 'REFUNDED' WHERE booking_id = ?";
            try (PreparedStatement ps = conn.prepareStatement(updatePaySql)) {
                ps.setInt(1, bookingId);
                ps.executeUpdate();
            }

            conn.commit();
            return true;
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

    private List<BookingTraveler> findTravelersByBookingId(Connection conn, int bookingId) throws SQLException {
        List<BookingTraveler> list = new ArrayList<>();
        String sql = "SELECT * FROM booking_travelers WHERE booking_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    BookingTraveler t = new BookingTraveler();
                    t.setTravelerId(rs.getInt("traveler_id"));
                    t.setBookingId(rs.getInt("booking_id"));
                    t.setFullName(rs.getString("full_name"));
                    t.setAge(rs.getInt("age"));
                    t.setGender(rs.getString("gender"));
                    t.setIdProofType(rs.getString("id_proof_type"));
                    t.setIdProofNumber(rs.getString("id_proof_number"));
                    list.add(t);
                }
            }
        }
        return list;
    }

    private Payment findPaymentByBookingId(Connection conn, int bookingId) throws SQLException {
        String sql = "SELECT * FROM payments WHERE booking_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Payment p = new Payment();
                    p.setPaymentId(rs.getInt("payment_id"));
                    p.setBookingId(rs.getInt("booking_id"));
                    p.setTransactionRef(rs.getString("transaction_ref"));
                    p.setAmount(rs.getDouble("amount"));
                    p.setPaymentMethod(rs.getString("payment_method"));
                    p.setPaymentStatus(rs.getString("payment_status"));
                    p.setPaidAt(rs.getTimestamp("paid_at"));
                    p.setFailureReason(rs.getString("failure_reason"));
                    return p;
                }
            }
        }
        return null;
    }

    private Booking mapRowToBooking(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setBookingId(rs.getInt("booking_id"));
        b.setBookingRef(rs.getString("booking_ref"));
        b.setUserId(rs.getInt("user_id"));
        b.setUserEmail(rs.getString("user_email"));
        b.setUserFullName(rs.getString("user_full_name"));
        b.setDepartureId(rs.getInt("departure_id"));
        b.setPackageId(rs.getInt("package_id"));
        b.setPackageTitle(rs.getString("package_title"));
        b.setDestinationName(rs.getString("destination_name"));
        Date sDate = rs.getDate("start_date");
        Date eDate = rs.getDate("end_date");
        b.setStartDate(sDate != null ? sDate.toString() : "");
        b.setEndDate(eDate != null ? eDate.toString() : "");
        b.setNumTravelers(rs.getInt("num_travelers"));
        b.setPricePerPerson(rs.getDouble("price_per_person"));
        b.setTotalAmount(rs.getDouble("total_amount"));
        b.setBookingStatus(rs.getString("booking_status"));
        b.setSpecialRequests(rs.getString("special_requests"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        return b;
    }
}

