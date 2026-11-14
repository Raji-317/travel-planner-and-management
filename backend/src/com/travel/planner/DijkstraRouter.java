package com.travel.planner;

import java.util.*;

/**
 * Dijkstra's shortest path algorithm implementation on AttractionGraph.
 */
public class DijkstraRouter {

    private static class NodeDistance implements Comparable<NodeDistance> {
        int nodeId;
        int distance;

        NodeDistance(int nodeId, int distance) {
            this.nodeId = nodeId;
            this.distance = distance;
        }

        @Override
        public int compareTo(NodeDistance o) {
            return Integer.compare(this.distance, o.distance);
        }
    }

    public static int findShortestTravelTime(AttractionGraph graph, int startId, int targetId) {
        if (startId == targetId) return 0;

        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();
        Map<Integer, Integer> minTime = new HashMap<>();

        pq.add(new NodeDistance(startId, 0));
        minTime.put(startId, 0);

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            if (current.nodeId == targetId) {
                return current.distance;
            }

            if (current.distance > minTime.getOrDefault(current.nodeId, Integer.MAX_VALUE)) {
                continue;
            }

            for (AttractionGraph.Edge edge : graph.getNeighbors(current.nodeId)) {
                int newDist = current.distance + edge.getTravelTimeMin();
                if (newDist < minTime.getOrDefault(edge.getTargetId(), Integer.MAX_VALUE)) {
                    minTime.put(edge.getTargetId(), newDist);
                    pq.add(new NodeDistance(edge.getTargetId(), newDist));
                }
            }
        }

        // If no explicit path in sparse graph, use fallback travel time
        return graph.getTravelTime(startId, targetId, "CAR");
    }
}

