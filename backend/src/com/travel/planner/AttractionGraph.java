package com.travel.planner;

import java.util.*;

/**
 * Weighted Graph representation of attractions in a destination.
 * Supports Dijkstra's algorithm for shortest transit times.
 */
public class AttractionGraph {

    public static class Edge {
        private final int targetId;
        private final double distanceKm;
        private final int travelTimeMin;
        private final double fare;

        public Edge(int targetId, double distanceKm, int travelTimeMin, double fare) {
            this.targetId = targetId;
            this.distanceKm = distanceKm;
            this.travelTimeMin = travelTimeMin;
            this.fare = fare;
        }

        public int getTargetId() { return targetId; }
        public double getDistanceKm() { return distanceKm; }
        public int getTravelTimeMin() { return travelTimeMin; }
        public double getFare() { return fare; }
    }

    private final Map<Integer, AttractionNode> nodes = new HashMap<>();
    private final Map<Integer, List<Edge>> adjacencyList = new HashMap<>();

    public void addNode(AttractionNode node) {
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    public void addEdge(int originId, int destId, double distanceKm, int travelTimeMin, double fare) {
        adjacencyList.putIfAbsent(originId, new ArrayList<>());
        adjacencyList.get(originId).add(new Edge(destId, distanceKm, travelTimeMin, fare));
    }

    public AttractionNode getNode(int id) {
        return nodes.get(id);
    }

    public Collection<AttractionNode> getAllNodes() {
        return nodes.values();
    }

    public List<Edge> getNeighbors(int nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    /**
     * Retrieves travel time between any two nodes.
     * Uses explicit edge if present, otherwise estimates via Haversine geographic distance.
     */
    public int getTravelTime(int originId, int destId, String transportMode) {
        if (originId == destId) return 0;

        List<Edge> edges = adjacencyList.get(originId);
        if (edges != null) {
            for (Edge e : edges) {
                if (e.getTargetId() == destId) {
                    return e.getTravelTimeMin();
                }
            }
        }

        // Fallback: Haversine distance estimation
        AttractionNode n1 = nodes.get(originId);
        AttractionNode n2 = nodes.get(destId);
        if (n1 == null || n2 == null) return 15; // default 15 min

        double distKm = haversine(n1.getLatitude(), n1.getLongitude(), n2.getLatitude(), n2.getLongitude());
        double speedKmh = getAverageSpeedKmh(transportMode);
        int timeMin = (int) Math.round((distKm / speedKmh) * 60.0);
        return Math.max(5, timeMin); // Minimum 5 mins
    }

    public double getTravelDistance(int originId, int destId) {
        if (originId == destId) return 0.0;
        List<Edge> edges = adjacencyList.get(originId);
        if (edges != null) {
            for (Edge e : edges) {
                if (e.getTargetId() == destId) {
                    return e.getDistanceKm();
                }
            }
        }

        AttractionNode n1 = nodes.get(originId);
        AttractionNode n2 = nodes.get(destId);
        if (n1 == null || n2 == null) return 5.0;
        return haversine(n1.getLatitude(), n1.getLongitude(), n2.getLatitude(), n2.getLongitude());
    }

    private double getAverageSpeedKmh(String transportMode) {
        if ("WALKING".equalsIgnoreCase(transportMode)) return 4.5;
        if ("BIKE".equalsIgnoreCase(transportMode)) return 22.0;
        if ("PUBLIC_TRANSPORT".equalsIgnoreCase(transportMode)) return 18.0;
        if ("TRAIN".equalsIgnoreCase(transportMode)) return 55.0; // Intercity/suburban train
        return 30.0; // CAR / CAB city traffic
    }

    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in kilometers
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100.0) / 100.0;
    }
}

