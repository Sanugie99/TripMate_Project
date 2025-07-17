package com.korea.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BusInfo {
	private String gradeNm;
	private String routeId;
	private String depPlandTime;
	private String arrPlandTime;
	private String depPlaceNm;
	private String arrPlaceNm;
	private int charge;
}
