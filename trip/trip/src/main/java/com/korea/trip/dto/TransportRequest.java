package com.korea.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransportRequest {
	private String transportType;
    private String departure;
    private String arrival;
    private String date;
    private String departureTime; // 출발시간 (HH:mm 형식)
}