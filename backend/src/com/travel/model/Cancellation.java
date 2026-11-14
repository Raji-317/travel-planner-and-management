package com.travel.model;

import java.sql.Timestamp;

public class Cancellation {
    private int cancellationId;
    private int bookingId;
    private String reason;
    private double refundAmount;
    private String refundStatus; // PROCESSED, PENDING, REJECTED
    private Timestamp cancelledAt;

    public Cancellation() {}

    public int getCancellationId() { return cancellationId; }
    public void setCancellationId(int cancellationId) { this.cancellationId = cancellationId; }

    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }

    public Timestamp getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Timestamp cancelledAt) { this.cancelledAt = cancelledAt; }
}

