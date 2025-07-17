package com.korea.trip.dto;

import com.korea.trip.models.Place;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {
    private String name;
    private String address;
    private double lat;
    private double lng;
    private String date; 
    private String category;
    private String categoryCode;
    private String photoUrl;

    public static PlaceDTO fromEntity(Place place) {
        return PlaceDTO.builder()
                .name(place.getName())
                .address(place.getAddress())
                .lat(place.getLat())
                .lng(place.getLng())
                .date(place.getDate())
                .category(place.getCategory())
                .categoryCode(place.getCategory()) // Assuming categoryCode in DTO maps to category in Entity
                .photoUrl(place.getImageUrl())
                .build();
    }
}
