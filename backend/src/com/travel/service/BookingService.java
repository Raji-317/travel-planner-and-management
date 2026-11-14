package com.travel.service;

import com.travel.exception.ValidationException;
import com.travel.model.Booking;
import com.travel.model.BookingTraveler;
import com.travel.model.Review;
import com.travel.repository.BookingRepository;
import com.travel.repository.ReviewRepository;

import java.sql.SQLException;
import java.util.List;

public class BookingService {

    private final BookingRepository bookingRepository = new BookingRepository();
    private final ReviewRepository reviewRepository = new ReviewRepository();

    public Booking createBooking(int userId, int departureId, int numTravelers,
                                 List<BookingTraveler> travelers, String paymentMethod, String specialRequests) {
        if (departureId <= 0) {
            throw new ValidationException("A valid departure schedule must be selected.");
        }
        if (numTravelers <= 0 || numTravelers > 15) {
            throw new ValidationException("Number of travelers must be between 1 and 15.");
        }
        if (travelers == null || travelers.size() != numTravelers) {
            throw new ValidationException("Traveler passenger manifest details must match number of travelers (" + numTravelers + ").");
        }

        for (BookingTraveler t : travelers) {
            if (t.getFullName() == null || t.getFullName().trim().length() < 2) {
                throw new ValidationException("Each traveler must have a valid full name.");
            }
            if (t.getAge() <= 0 || t.getAge() > 120) {
                throw new ValidationException("Invalid age entered for traveler: " + t.getFullName());
            }
        }

        try {
            return bookingRepository.createBooking(userId, departureId, numTravelers, travelers, paymentMethod, specialRequests);
        } catch (SQLException e) {
            throw new RuntimeException("Booking transaction failed: " + e.getMessage(), e);
        }
    }

    public List<Booking> getUserBookings(int userId) {
        return bookingRepository.findUserBookings(userId);
    }

    public List<Booking> getOperatorBookings(int operatorId) {
        return bookingRepository.findOperatorBookings(operatorId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllBookings();
    }

    public Booking getBookingById(int bookingId, int requestingUserId, String role) {
        Booking b = bookingRepository.findById(bookingId);
        if (b == null) {
            throw new ValidationException("Booking not found with id: " + bookingId);
        }
        if (!"ADMIN".equalsIgnoreCase(role) && !"OPERATOR".equalsIgnoreCase(role) && b.getUserId() != requestingUserId) {
            throw new ValidationException("Access denied: You can only view your own bookings.");
        }
        return b;
    }

    public boolean cancelBooking(int bookingId, int userId, String reason) {
        try {
            return bookingRepository.cancelBooking(bookingId, userId, reason);
        } catch (SQLException e) {
            throw new RuntimeException("Cancellation transaction failed: " + e.getMessage(), e);
        }
    }

    public Review addReview(int userId, int packageId, int rating, String title, String comment) {
        if (rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5 stars.");
        }
        if (comment == null || comment.trim().length() < 5) {
            throw new ValidationException("Review comment must be at least 5 characters.");
        }

        Review r = new Review();
        r.setUserId(userId);
        r.setPackageId(packageId);
        r.setRating(rating);
        r.setReviewTitle(title);
        r.setComment(comment.trim());

        try {
            return reviewRepository.addReview(r);
        } catch (SQLException e) {
            if (e.getMessage() != null && e.getMessage().contains("uq_user_package_review")) {
                throw new ValidationException("You have already submitted a review for this package.");
            }
            throw new RuntimeException("Error submitting review: " + e.getMessage(), e);
        }
    }

    public List<Review> getPackageReviews(int packageId) {
        return reviewRepository.findPackageReviews(packageId);
    }
}

