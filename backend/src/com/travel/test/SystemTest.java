package com.travel.test;

import com.travel.planner.*;
import com.travel.security.PasswordHasher;
import com.travel.security.TokenService;
import com.travel.util.JsonParser;

import java.util.*;

/**
 * Built-in Pure Java Unit & Integration Test Suite.
 * Runs without external testing frameworks (No JUnit / No Maven required).
 */
public class SystemTest {

    private static int testsPassed = 0;
    private static int testsFailed = 0;

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   PURE JAVA SYSTEM & ALGORITHM TEST SUITE (ZERO FRAMEWORKS)      ");
        System.out.println("==================================================================");

        testPasswordHashing();
        testHmacTokenService();
        testJsonParserEngine();
        testDijkstraAndTSPOptimization();
        testBudgetEstimator();
        testOperatorLoginSerialization();

        System.out.println("==================================================================");
        System.out.println("   TEST EXECUTION SUMMARY: " + testsPassed + " PASSED, " + testsFailed + " FAILED");
        System.out.println("==================================================================");

        if (testsFailed > 0) {
            System.exit(1);
        }
    }

    private static void testPasswordHashing() {
        System.out.print("[TEST 1] PBKDF2 Password Hashing & Salt Verification: ");
        try {
            String password = "Password@123";
            String salt = PasswordHasher.generateSalt();
            String hash = PasswordHasher.hashPassword(password, salt);

            assertCondition(hash != null && hash.length() > 32, "Hash generated");
            assertCondition(PasswordHasher.verifyPassword(password, salt, hash), "Correct password matches");
            assertCondition(!PasswordHasher.verifyPassword("WrongPassword", salt, hash), "Incorrect password fails");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void testHmacTokenService() {
        System.out.print("[TEST 2] HMAC-SHA256 Stateless Token Authentication: ");
        try {
            int userId = 42;
            String role = "OPERATOR";
            String email = "operator@gotrips.com";

            String token = TokenService.generateToken(userId, role, email);
            assertCondition(token != null && token.contains("."), "Token generated with signature");

            TokenService.TokenPayload payload = TokenService.validateToken(token);
            assertCondition(payload != null, "Token validated");
            assertCondition(payload.getUserId() == 42, "User ID matches");
            assertCondition(payload.getRole().equals("OPERATOR"), "Role matches");

            // Tampered token test
            String tampered = token.substring(0, token.length() - 2) + "xx";
            assertCondition(TokenService.validateToken(tampered) == null, "Tampered token rejected");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void testJsonParserEngine() {
        System.out.print("[TEST 3] Zero-Dependency JsonParser Engine: ");
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("destination", "Visakhapatnam");
            map.put("days", 3);
            map.put("budget", 10000.50);
            map.put("isCustom", true);
            map.put("tags", Arrays.asList("beach", "nature", "heritage"));

            String json = JsonParser.toJson(map);
            assertCondition(json.contains("\"destination\":\"Visakhapatnam\""), "JSON serialization");

            Map<String, Object> parsed = JsonParser.parseObject(json);
            assertCondition("Visakhapatnam".equals(parsed.get("destination")), "Parsed string matches");
            assertCondition(((Number) parsed.get("days")).intValue() == 3, "Parsed int matches");
            assertCondition(Boolean.TRUE.equals(parsed.get("isCustom")), "Parsed boolean matches");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void testDijkstraAndTSPOptimization() {
        System.out.print("[TEST 4] Dijkstra Shortest Path & 2-Opt TSP Route Ordering: ");
        try {
            AttractionGraph graph = new AttractionGraph();
            // Nodes
            AttractionNode rkBeach = new AttractionNode(1, "RK Beach", 4, "Beach", 90, 0.0, "06:00:00", "22:00:00", 17.7142, 83.3235, 4.8);
            AttractionNode submarine = new AttractionNode(2, "Submarine Museum", 3, "Heritage", 75, 70.0, "14:00:00", "20:30:00", 17.7175, 83.3312, 4.9);
            AttractionNode kailasagiri = new AttractionNode(3, "Kailasagiri Hill", 2, "Nature", 120, 50.0, "08:00:00", "20:00:00", 17.7490, 83.3423, 4.8);
            AttractionNode rishikonda = new AttractionNode(4, "Rishikonda Beach", 1, "Adventure", 150, 250.0, "07:00:00", "18:30:00", 17.7818, 83.3852, 4.7);

            graph.addNode(rkBeach);
            graph.addNode(submarine);
            graph.addNode(kailasagiri);
            graph.addNode(rishikonda);

            // Edges
            graph.addEdge(1, 2, 1.2, 5, 40.0);
            graph.addEdge(2, 3, 5.5, 14, 90.0);
            graph.addEdge(3, 4, 7.8, 16, 130.0);

            // 1. Test Dijkstra shortest travel time from RK Beach (1) to Kailasagiri (3)
            int shortestTime = DijkstraRouter.findShortestTravelTime(graph, 1, 3);
            assertCondition(shortestTime == 19, "Dijkstra computed 5 + 14 = 19 minutes");

            // 2. Test TSP 2-Opt ordering
            List<AttractionNode> unorganized = Arrays.asList(rishikonda, rkBeach, kailasagiri, submarine);
            List<AttractionNode> ordered = TSPOrderOptimizer.optimizeDayOrder(unorganized, graph, "CAR");
            assertCondition(ordered.size() == 4, "All 4 places preserved in day itinerary");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void testBudgetEstimator() {
        System.out.print("[TEST 5] Dynamic Budget Feasibility & Cost Estimator: ");
        try {
            // Within budget scenario: 3 days, 2 travelers, ₹25,000 budget
            BudgetEstimator.BudgetBreakdown b1 = BudgetEstimator.calculate(
                    3, 2, 25000.0, 390.0, 45.0, "CAR", 2800.0
            );
            assertCondition(!b1.isExceeded(), "Within budget recognized");
            assertCondition(b1.getRemainingBudget() > 0, "Positive remaining balance");

            // Exceeding budget scenario: 3 days, 2 travelers, low ₹2,000 budget
            BudgetEstimator.BudgetBreakdown b2 = BudgetEstimator.calculate(
                    3, 2, 2000.0, 390.0, 45.0, "CAR", 2800.0
            );
            assertCondition(b2.isExceeded(), "Budget excess detected");
            assertCondition(b2.getAffordabilityMessage().contains("exceeds target budget"), "Advisory generated");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void testOperatorLoginSerialization() {
        System.out.print("[TEST 6] Operator Login & SQL Timestamp Serialization: ");
        try {
            com.travel.service.AuthService auth = new com.travel.service.AuthService();
            Map<String, Object> res = auth.login("operator@gotrips.com", "Password@123");
            String json = JsonParser.toJson(res);
            assertCondition(json != null && json.contains("\"token\":"), "Contains token");
            assertCondition(json.contains("\"role\":\"OPERATOR\""), "Contains operator role");
            pass();
        } catch (Exception e) {
            fail(e.getMessage());
        }
    }

    private static void assertCondition(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError("Assertion failed: " + message);
        }
    }

    private static void pass() {
        testsPassed++;
        System.out.println("PASSED");
    }

    private static void fail(String msg) {
        testsFailed++;
        System.out.println("FAILED (" + msg + ")");
    }
}

