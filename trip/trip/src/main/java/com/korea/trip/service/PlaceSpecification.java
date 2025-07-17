package com.korea.trip.service;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.korea.trip.dto.place.PlaceSearchRequest;
import com.korea.trip.models.Place;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Component
public class PlaceSpecification {

    public Specification<Place> search(PlaceSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(request.getKeyword())) {
                predicates.add(criteriaBuilder.like(root.get("name"), "%" + request.getKeyword() + "%"));
            }
            if (StringUtils.hasText(request.getCategory())) {
                predicates.add(criteriaBuilder.equal(root.get("category"), request.getCategory()));
            }
            if (StringUtils.hasText(request.getRegion())) {
                predicates.add(criteriaBuilder.like(root.get("address"), "%" + request.getRegion() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
