package com.korea.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KorailInfo {
    private String trainGrade;       // 예: KTX, ITX
    private String trainNumber;      // 열차 번호
    private String depPlandTime;     // 출발 시간 (yyyyMMddHHmm)
    private String arrPlandTime;     // 도착 시간 (yyyyMMddHHmm)
    private String depStationName;   // 출발역명
    private String arrStationName;   // 도착역명
    private int adultcharge; 		 // 요금
}
