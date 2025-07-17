package com.korea.trip.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MultiDayScheduleResponse {
	private String title;
	private Map<String, List<PlaceDTO>> dailyPlan; // 날짜별 장소 리스트
}
