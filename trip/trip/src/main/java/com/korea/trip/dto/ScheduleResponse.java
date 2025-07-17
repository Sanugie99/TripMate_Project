package com.korea.trip.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
	private String title;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
    private String departure;
    private String arrival;
    private String transportType;
    private List<PlaceDTO> places;
	public String date;
}

