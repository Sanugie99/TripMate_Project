package com.korea.trip.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ScheduleCreateRequest {
    private String departure;
    private String arrival;
    private String date;
    private Integer days; // 여행 기간(일수)
    private String transportType; // 예: "korail" or "bus"
    private LocalDateTime startTime;
	private LocalDateTime endTime;
	private List<PlaceDTO> places;
}

