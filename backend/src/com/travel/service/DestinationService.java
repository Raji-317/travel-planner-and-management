package com.travel.service;

import com.travel.exception.ValidationException;
import com.travel.model.Attraction;
import com.travel.model.AttractionCategory;
import com.travel.model.Destination;
import com.travel.repository.DestinationRepository;

import java.util.List;

public class DestinationService {

    private final DestinationRepository destinationRepository = new DestinationRepository();

    public List<Destination> getDestinations(String search, String season, Double maxBudget, Boolean featured) {
        return destinationRepository.findAll(search, season, maxBudget, featured);
    }

    public Destination getDestinationById(int id) {
        Destination d = destinationRepository.findById(id);
        if (d == null) {
            throw new ValidationException("Destination not found with id: " + id);
        }
        return d;
    }

    public List<Attraction> getAttractions(int destinationId, Integer categoryId) {
        return destinationRepository.findAttractionsByDestination(destinationId, categoryId);
    }

    public List<AttractionCategory> getCategories() {
        return destinationRepository.findAllCategories();
    }
}

