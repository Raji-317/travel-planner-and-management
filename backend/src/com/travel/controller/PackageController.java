package com.travel.controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.travel.exception.AppException;
import com.travel.model.Package;
import com.travel.model.PackageDeparture;
import com.travel.model.PackageItineraryDay;
import com.travel.security.AuthFilter;
import com.travel.security.TokenService;
import com.travel.service.PackageService;
import com.travel.util.HttpUtils;
import com.travel.util.JsonParser;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PackageController implements HttpHandler {

    private final PackageService packageService = new PackageService();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> query = HttpUtils.parseQueryParams(exchange);

        try {
            if (path.startsWith("/api/packages")) {
                handlePublicPackageRoutes(exchange, path, method, query);
            } else if (path.startsWith("/api/operator/packages")) {
                handleOperatorPackageRoutes(exchange, path, method);
            } else {
                HttpUtils.sendError(exchange, 404, "Package route not found: " + method + " " + path);
            }
        } catch (AppException e) {
            HttpUtils.sendError(exchange, e.getStatusCode(), e.getMessage());
        } catch (NumberFormatException e) {
            HttpUtils.sendError(exchange, 400, "Invalid identifier in request URL.");
        } catch (Exception e) {
            System.err.println("[PKG-CONTROLLER-ERR] " + e.getMessage());
            e.printStackTrace();
            HttpUtils.sendError(exchange, 500, "Internal error: " + e.getMessage());
        }
    }

    private void handlePublicPackageRoutes(HttpExchange exchange, String path, String method, Map<String, String> query) throws IOException {
        if (!"GET".equals(method)) {
            HttpUtils.sendError(exchange, 405, "Method not allowed for public packages endpoint.");
            return;
        }

        String suffix = HttpUtils.extractPathSuffix(path, "/api/packages");
        if (suffix.isEmpty()) {
            String destination = query.get("destination");
            String priceStr = query.get("maxPrice");
            Double maxPrice = (priceStr != null && !priceStr.isEmpty()) ? Double.parseDouble(priceStr) : null;
            String durationStr = query.get("durationDays");
            Integer durationDays = (durationStr != null && !durationStr.isEmpty()) ? Integer.parseInt(durationStr) : null;
            String search = query.get("search");

            List<Package> list = packageService.getPackages(destination, maxPrice, durationDays, search);
            HttpUtils.sendSuccess(exchange, list);
        } else {
            int id = Integer.parseInt(suffix);
            Package pkg = packageService.getPackageById(id);
            HttpUtils.sendSuccess(exchange, pkg);
        }
    }

    private void handleOperatorPackageRoutes(HttpExchange exchange, String path, String method) throws IOException {
        TokenService.TokenPayload user = AuthFilter.authenticate(exchange);
        if (user == null) return;
        if (!AuthFilter.requireRole(exchange, user, "OPERATOR", "ADMIN")) return;

        String suffix = HttpUtils.extractPathSuffix(path, "/api/operator/packages");

        if ("GET".equals(method) && suffix.isEmpty()) {
            List<Package> list = packageService.getOperatorPackages(user.getUserId());
            HttpUtils.sendSuccess(exchange, list);
        } else if ("POST".equals(method) && suffix.isEmpty()) {
            String body = HttpUtils.readRequestBody(exchange);
            Map<String, Object> req = JsonParser.parseObject(body);
            Package pkg = parsePackageFromJson(req, user.getUserId());
            Package created = packageService.createPackage(pkg);
            HttpUtils.sendCreated(exchange, created);
        } else if ("PUT".equals(method) && !suffix.isEmpty()) {
            int pkgId = Integer.parseInt(suffix);
            String body = HttpUtils.readRequestBody(exchange);
            Map<String, Object> req = JsonParser.parseObject(body);
            Package pkg = parsePackageFromJson(req, user.getUserId());
            pkg.setPackageId(pkgId);
            boolean ok = packageService.updatePackage(pkg);
            if (ok) {
                HttpUtils.sendSuccess(exchange, packageService.getPackageById(pkgId));
            } else {
                HttpUtils.sendError(exchange, 400, "Unable to update package.");
            }
        } else if ("DELETE".equals(method) && !suffix.isEmpty()) {
            int pkgId = Integer.parseInt(suffix);
            boolean ok = packageService.deletePackage(pkgId, user.getUserId());
            if (ok) {
                HttpUtils.sendSuccess(exchange, "Package archived successfully.");
            } else {
                HttpUtils.sendError(exchange, 400, "Unable to delete package.");
            }
        } else {
            HttpUtils.sendError(exchange, 404, "Invalid operator package action: " + method + " " + path);
        }
    }

    @SuppressWarnings("unchecked")
    private Package parsePackageFromJson(Map<String, Object> req, int operatorId) {
        Package p = new Package();
        p.setOperatorId(operatorId);
        Number destIdNum = (Number) req.get("destinationId");
        p.setDestinationId(destIdNum != null ? destIdNum.intValue() : 0);
        p.setTitle((String) req.get("title"));
        p.setDescription((String) req.get("description"));
        Number daysNum = (Number) req.getOrDefault("durationDays", 1);
        p.setDurationDays(daysNum != null ? daysNum.intValue() : 1);
        Number nightsNum = (Number) req.getOrDefault("durationNights", 0);
        p.setDurationNights(nightsNum != null ? nightsNum.intValue() : 0);
        Number priceNum = (Number) req.getOrDefault("basePricePerPerson", 0);
        p.setBasePricePerPerson(priceNum != null ? priceNum.doubleValue() : 0.0);
        Number maxNum = (Number) req.getOrDefault("maxTravellers", 30);
        p.setMaxTravellers(maxNum != null ? maxNum.intValue() : 30);
        p.setIncludedServices((String) req.get("includedServices"));
        p.setExcludedServices((String) req.get("excludedServices"));
        p.setAccommodationDetails((String) req.get("accommodationDetails"));
        p.setTransportationDetails((String) req.get("transportationDetails"));
        p.setImageUrl((String) req.get("imageUrl"));
        p.setActive(true);

        // Itinerary Days
        List<Object> daysRaw = (List<Object>) req.get("itineraryDays");
        if (daysRaw != null) {
            List<PackageItineraryDay> days = new ArrayList<>();
            for (Object dObj : daysRaw) {
                if (dObj instanceof Map) {
                    Map<String, Object> dMap = (Map<String, Object>) dObj;
                    PackageItineraryDay day = new PackageItineraryDay();
                    Number dayNum = (Number) dMap.get("dayNumber");
                    day.setDayNumber(dayNum != null ? dayNum.intValue() : 1);
                    day.setTitle((String) dMap.get("title"));
                    day.setDescription((String) dMap.get("description"));
                    day.setMorningActivity((String) dMap.get("morningActivity"));
                    day.setAfternoonActivity((String) dMap.get("afternoonActivity"));
                    day.setEveningActivity((String) dMap.get("eveningActivity"));
                    day.setMealsIncluded((String) dMap.get("mealsIncluded"));
                    days.add(day);
                }
            }
            p.setItineraryDays(days);
        }

        // Departures
        List<Object> depsRaw = (List<Object>) req.get("departures");
        if (depsRaw != null) {
            List<PackageDeparture> deps = new ArrayList<>();
            for (Object depObj : depsRaw) {
                if (depObj instanceof Map) {
                    Map<String, Object> depMap = (Map<String, Object>) depObj;
                    PackageDeparture dep = new PackageDeparture();
                    dep.setStartDate((String) depMap.get("startDate"));
                    dep.setEndDate((String) depMap.get("endDate"));
                    Number slotsNum = (Number) depMap.get("totalSlots");
                    int slots = slotsNum != null ? slotsNum.intValue() : p.getMaxTravellers();
                    dep.setTotalSlots(slots);
                    dep.setAvailableSlots(slots);
                    deps.add(dep);
                }
            }
            p.setDepartures(deps);
        }

        return p;
    }
}

