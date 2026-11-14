package com.travel.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Generates and validates tamper-proof HMAC-SHA256 authentication tokens
 * without external JWT libraries.
 */
public class TokenService {

    private static final String SECRET_KEY = "TravelTourismSystemSecureHmacKey2026!PureJavaBTechProject";
    private static final String HMAC_ALGO = "HmacSHA256";
    private static final long EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public static class TokenPayload {
        private final int userId;
        private final String role;
        private final String email;
        private final long expiry;

        public TokenPayload(int userId, String role, String email, long expiry) {
            this.userId = userId;
            this.role = role;
            this.email = email;
            this.expiry = expiry;
        }

        public int getUserId() { return userId; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
        public long getExpiry() { return expiry; }
    }

    public static String generateToken(int userId, String role, String email) {
        long expiry = System.currentTimeMillis() + EXPIRATION_MS;
        String rawData = userId + ":" + role + ":" + email + ":" + expiry;
        String encodedData = Base64.getUrlEncoder().withoutPadding().encodeToString(rawData.getBytes(StandardCharsets.UTF_8));
        String signature = computeHmac(encodedData);
        return encodedData + "." + signature;
    }

    public static TokenPayload validateToken(String token) {
        if (token == null || !token.contains(".")) {
            return null;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return null;
        }

        String encodedData = parts[0];
        String expectedSig = parts[1];
        String computedSig = computeHmac(encodedData);

        if (!MessageDigest.isEqual(computedSig.getBytes(StandardCharsets.UTF_8), expectedSig.getBytes(StandardCharsets.UTF_8))) {
            return null; // Tampered token
        }

        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedData);
            String rawData = new String(decodedBytes, StandardCharsets.UTF_8);
            String[] segments = rawData.split(":");
            if (segments.length != 4) {
                return null;
            }

            int userId = Integer.parseInt(segments[0]);
            String role = segments[1];
            String email = segments[2];
            long expiry = Long.parseLong(segments[3]);

            if (System.currentTimeMillis() > expiry) {
                return null; // Expired token
            }

            return new TokenPayload(userId, role, email, expiry);
        } catch (Exception e) {
            return null;
        }
    }

    private static String computeHmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), HMAC_ALGO);
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }
}
