package com.korea.trip.dto;

import com.korea.trip.models.Place;
import lombok.Data;

@Data
public class PlaceSimpleDTO {
    private Long id;
    private String name;
    private String category;
    private double lat;
    private double lng;

    public static PlaceSimpleDTO fromEntity(Place place) {
        PlaceSimpleDTO dto = new PlaceSimpleDTO();
        dto.setId(place.getId());
        dto.setName(place.getName());
        dto.setCategory(place.getCategory());
        dto.setLat(place.getLat());
        dto.setLng(place.getLng());
        return dto;
    }
}
