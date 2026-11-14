package com.travel.service;

import com.travel.exception.ValidationException;
import com.travel.model.OperatorProfile;
import com.travel.model.User;
import com.travel.repository.UserRepository;
import com.travel.security.PasswordHasher;
import com.travel.security.TokenService;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Service managing user authentication, registration, validation, and session issuance.
 */
public class AuthService {

    private final UserRepository userRepository = new UserRepository();

    public Map<String, Object> registerTourist(String email, String password, String fullName, String phone) {
        validateEmailAndPassword(email, password);

        if (fullName == null || fullName.trim().length() < 2) {
            throw new ValidationException("Full name must be at least 2 characters.");
        }

        if (userRepository.findByEmail(email) != null) {
            throw new ValidationException("An account with this email already exists.");
        }

        String salt = PasswordHasher.generateSalt();
        String hash = PasswordHasher.hashPassword(password, salt);

        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(hash);
        user.setSalt(salt);
        user.setFullName(fullName.trim());
        user.setPhone(phone != null ? phone.trim() : null);
        user.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");

        try {
            User created = userRepository.createTourist(user);
            String token = TokenService.generateToken(created.getUserId(), created.getRole(), created.getEmail());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("token", token);
            result.put("user", sanitizeUser(created));
            return result;
        } catch (SQLException e) {
            throw new RuntimeException("Database error during registration: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> registerOperator(String email, String password, String fullName, String phone,
                                                String companyName, String licenseNumber, int yearsInBusiness,
                                                String officeAddress, String supportPhone, String supportEmail) {
        validateEmailAndPassword(email, password);

        if (companyName == null || companyName.trim().length() < 2) {
            throw new ValidationException("Company name is required.");
        }
        if (licenseNumber == null || licenseNumber.trim().isEmpty()) {
            throw new ValidationException("Travel operator commercial license number is required.");
        }

        if (userRepository.findByEmail(email) != null) {
            throw new ValidationException("An account with this email already exists.");
        }

        String salt = PasswordHasher.generateSalt();
        String hash = PasswordHasher.hashPassword(password, salt);

        User user = new User();
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(hash);
        user.setSalt(salt);
        user.setFullName(fullName != null ? fullName.trim() : companyName.trim());
        user.setPhone(phone != null ? phone.trim() : supportPhone);
        user.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");

        OperatorProfile profile = new OperatorProfile();
        profile.setCompanyName(companyName.trim());
        profile.setLicenseNumber(licenseNumber.trim());
        profile.setYearsInBusiness(yearsInBusiness > 0 ? yearsInBusiness : 1);
        profile.setOfficeAddress(officeAddress);
        profile.setSupportPhone(supportPhone);
        profile.setSupportEmail(supportEmail != null ? supportEmail : email);

        try {
            User created = userRepository.createOperator(user, profile);
            String token = TokenService.generateToken(created.getUserId(), created.getRole(), created.getEmail());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("token", token);
            result.put("user", sanitizeUser(created));
            result.put("message", "Operator registration submitted. Account status is pending administrator approval.");
            return result;
        } catch (SQLException e) {
            throw new RuntimeException("Database error during operator registration: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> login(String email, String password) {
        if (email == null || email.trim().isEmpty() || password == null) {
            throw new ValidationException("Email and password are required.");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ValidationException("Invalid email or password.");
        }

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new ValidationException("Your account has been suspended. Please contact platform support.");
        }

        boolean valid = PasswordHasher.verifyPassword(password, user.getSalt(), user.getPasswordHash());
        if (!valid) {
            throw new ValidationException("Invalid email or password.");
        }

        String token = TokenService.generateToken(user.getUserId(), user.getRole(), user.getEmail());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", token);
        result.put("user", sanitizeUser(user));

        if ("OPERATOR".equalsIgnoreCase(user.getRole())) {
            OperatorProfile prof = userRepository.getOperatorProfile(user.getUserId());
            result.put("operatorProfile", prof);
        }

        return result;
    }

    public Map<String, Object> getProfile(int userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new ValidationException("User not found.");
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("user", sanitizeUser(user));

        if ("OPERATOR".equalsIgnoreCase(user.getRole())) {
            OperatorProfile prof = userRepository.getOperatorProfile(userId);
            result.put("operatorProfile", prof);
        }

        return result;
    }

    public boolean updateProfile(int userId, String fullName, String phone, String avatarUrl) {
        return userRepository.updateProfile(userId, fullName, phone, avatarUrl);
    }

    private void validateEmailAndPassword(String email, String password) {
        if (email == null || !email.contains("@") || !email.contains(".")) {
            throw new ValidationException("A valid email address is required.");
        }
        if (password == null || password.length() < 6) {
            throw new ValidationException("Password must be at least 6 characters.");
        }
    }

    public static Map<String, Object> sanitizeUser(User u) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", u.getUserId());
        map.put("email", u.getEmail());
        map.put("fullName", u.getFullName());
        map.put("phone", u.getPhone());
        map.put("role", u.getRole());
        map.put("status", u.getStatus());
        map.put("avatarUrl", u.getAvatarUrl());
        return map;
    }
}
