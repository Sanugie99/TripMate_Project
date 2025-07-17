package com.korea.trip.dto;

import java.util.List;

import lombok.Data;

@Data
public class DayPlan {
    private String date;
    private List<PlaceDTO> places;
}