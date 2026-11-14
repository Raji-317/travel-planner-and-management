package com.travel.planner;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Solves intra-day Traveling Salesperson visiting order using
 * Nearest Neighbor + 2-Opt local search refinement to prevent route crossing.
 */
public class TSPOrderOptimizer {

    public static List<AttractionNode> optimizeDayOrder(List<AttractionNode> dayNodes, AttractionGraph graph, String transportMode) {
        if (dayNodes == null || dayNodes.size() <= 2) {
            return dayNodes != null ? new ArrayList<>(dayNodes) : Collections.emptyList();
        }

        // 1. Start with the attraction that opens earliest or has highest popularity
        List<AttractionNode> unvisited = new ArrayList<>(dayNodes);
        unvisited.sort((a, b) -> {
            int timeCmp = Integer.compare(a.getOpenMinuteOfDay(), b.getOpenMinuteOfDay());
            if (timeCmp != 0) return timeCmp;
            return Double.compare(b.getPopularity(), a.getPopularity());
        });

        List<AttractionNode> route = new ArrayList<>();
        AttractionNode current = unvisited.remove(0);
        route.add(current);

        // 2. Nearest Neighbor Greedy Insertion
        while (!unvisited.isEmpty()) {
            AttractionNode nearest = null;
            int bestTime = Integer.MAX_VALUE;

            for (AttractionNode candidate : unvisited) {
                int t = graph.getTravelTime(current.getId(), candidate.getId(), transportMode);
                if (t < bestTime) {
                    bestTime = t;
                    nearest = candidate;
                }
            }

            if (nearest != null) {
                unvisited.remove(nearest);
                route.add(nearest);
                current = nearest;
            } else {
                route.addAll(unvisited);
                break;
            }
        }

        // 3. 2-Opt Local Search (Swap edges to untangle crossed paths)
        boolean improved = true;
        int n = route.size();
        while (improved) {
            improved = false;
            for (int i = 0; i < n - 1; i++) {
                for (int k = i + 1; k < n; k++) {
                    int currentTime = calculateRouteSegmentTime(route, i, k, graph, transportMode);
                    List<AttractionNode> swapped = twoOptSwap(route, i, k);
                    int newTime = calculateRouteSegmentTime(swapped, i, k, graph, transportMode);

                    if (newTime < currentTime) {
                        route = swapped;
                        improved = true;
                        break;
                    }
                }
                if (improved) break;
            }
        }

        return route;
    }

    private static List<AttractionNode> twoOptSwap(List<AttractionNode> route, int i, int k) {
        List<AttractionNode> newRoute = new ArrayList<>();
        // 1. Take route[0] to route[i-1]
        for (int c = 0; c < i; c++) {
            newRoute.add(route.get(c));
        }
        // 2. Reverse route[i] to route[k]
        for (int c = k; c >= i; c--) {
            newRoute.add(route.get(c));
        }
        // 3. Take route[k+1] to end
        for (int c = k + 1; c < route.size(); c++) {
            newRoute.add(route.get(c));
        }
        return newRoute;
    }

    private static int calculateRouteSegmentTime(List<AttractionNode> route, int i, int k, AttractionGraph graph, String transportMode) {
        int total = 0;
        for (int idx = i; idx < k; idx++) {
            total += graph.getTravelTime(route.get(idx).getId(), route.get(idx + 1).getId(), transportMode);
        }
        return total;
    }
}

