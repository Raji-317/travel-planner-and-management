package com.travel.exception;

/**
 * Thrown when client input fails business or structural validation (HTTP 400).
 */
public class ValidationException extends AppException {
    public ValidationException(String message) {
        super(message, 400);
    }
}

