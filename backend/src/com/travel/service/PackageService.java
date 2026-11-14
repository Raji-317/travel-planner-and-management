package com.travel.service;

import com.travel.exception.ValidationException;
import com.travel.model.Package;
import com.travel.repository.PackageRepository;

import java.sql.SQLException;
import java.util.List;

public class PackageService {

    private final PackageRepository packageRepository = new PackageRepository();

    public List<Package> getPackages(String destination, Double maxPrice, Integer durationDays, String search) {
        return packageRepository.findAll(destination, maxPrice, durationDays, search);
    }

    public Package getPackageById(int id) {
        Package pkg = packageRepository.findById(id);
        if (pkg == null) {
            throw new ValidationException("Package not found with id: " + id);
        }
        return pkg;
    }

    public List<Package> getOperatorPackages(int operatorId) {
        return packageRepository.findByOperatorId(operatorId);
    }

    public Package createPackage(Package pkg) {
        if (pkg.getTitle() == null || pkg.getTitle().trim().length() < 3) {
            throw new ValidationException("Package title must be at least 3 characters.");
        }
        if (pkg.getDestinationId() <= 0) {
            throw new ValidationException("Valid destination is required.");
        }
        if (pkg.getBasePricePerPerson() <= 0) {
            throw new ValidationException("Base price per person must be greater than zero.");
        }
        if (pkg.getDurationDays() <= 0) {
            throw new ValidationException("Package duration in days must be at least 1.");
        }

        try {
            return packageRepository.createPackage(pkg);
        } catch (SQLException e) {
            throw new RuntimeException("Database error creating travel package: " + e.getMessage(), e);
        }
    }

    public boolean updatePackage(Package pkg) {
        return packageRepository.updatePackage(pkg);
    }

    public boolean deletePackage(int packageId, int operatorId) {
        return packageRepository.deletePackage(packageId, operatorId);
    }
}

