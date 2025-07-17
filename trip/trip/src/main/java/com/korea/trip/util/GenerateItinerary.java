package com.korea.trip.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.korea.trip.dto.BusInfo;
import com.korea.trip.dto.KorailInfo;
import com.korea.trip.dto.MultiDayScheduleResponse;
import com.korea.trip.dto.PlaceDTO;
import com.korea.trip.dto.ScheduleResponse;

@Component
public class GenerateItinerary {

    private final KakaoPlaceUtil kakaoPlaceUtil;
    private final BusUtil busUtil;
    private final KorailUtil korailUtil;

    public GenerateItinerary(KakaoPlaceUtil kakaoPlaceUtil, BusUtil busUtil, KorailUtil korailUtil) {
        this.kakaoPlaceUtil = kakaoPlaceUtil;
        this.busUtil = busUtil;
        this.korailUtil = korailUtil;
    }

    public ScheduleResponse generate(String departure, String arrival, LocalDateTime startTime, LocalDateTime endTime, String transportType) {
        String dateString = startTime.toLocalDate().toString();

        // 1. 교통편 호출 (korail 또는 bus)
        if ("korail".equalsIgnoreCase(transportType)) {
            List<KorailInfo> korailInfos = korailUtil.fetchKorail(departure, arrival, startTime.format(DateTimeUtil.KORAIL_FORMATTER));
            
            // 예시: 첫 번째 열차 출발시간/도착시간 변환 후 로그 출력
            if (!korailInfos.isEmpty()) {
                KorailInfo firstTrain = korailInfos.get(0);
                LocalDateTime depTrainTime = DateTimeUtil.parseKorailDateTime(firstTrain.getDepPlandTime());
                LocalDateTime arrTrainTime = DateTimeUtil.parseKorailDateTime(firstTrain.getArrPlandTime());
                System.out.println("첫 번째 기차 출발: " + depTrainTime + ", 도착: " + arrTrainTime);
                // 여기서 depTrainTime, arrTrainTime 활용 가능 (예: 일정 필터링, 시간 계산 등)
            }

        } else if ("bus".equalsIgnoreCase(transportType)) {
            List<BusInfo> busInfos = busUtil.fetchBus(departure, arrival, startTime.format(DateTimeUtil.KORAIL_FORMATTER));
            if (!busInfos.isEmpty()) {
                BusInfo firstBus = busInfos.get(0);
                LocalDateTime depBusTime = DateTimeUtil.parseBusDateTime(firstBus.getDepPlandTime());
                LocalDateTime arrBusTime = DateTimeUtil.parseBusDateTime(firstBus.getArrPlandTime());
                System.out.println("첫 번째 버스 출발: " + depBusTime + ", 도착: " + arrBusTime);
                // TODO: 출발/도착 시간 활용 일정 로직
            }
        }

        // 2. 관광지(AT4) 검색
        List<PlaceDTO> attractions = kakaoPlaceUtil.searchPlaces(arrival + "관광지", "AT4");
        if (attractions.isEmpty()) {
            return buildScheduleResponse(departure, arrival, dateString, List.of());
        }

        // 3. 기준점: 첫 번째 관광지
        PlaceDTO base = attractions.get(0);
        double MAX_DISTANCE_KM = 20.0;

        // 4. 관광지 필터링
        List<PlaceDTO> selectedAttractions = attractions.stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        // 5. 음식점(FD6), 카페(CE7) 검색 및 필터링
        List<PlaceDTO> selectedRestaurants = kakaoPlaceUtil.searchPlaces(arrival, "FD6").stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        List<PlaceDTO> selectedCafes = kakaoPlaceUtil.searchPlaces(arrival, "CE7").stream()
                .filter(p -> getDistance(base, p) <= MAX_DISTANCE_KM)
                .limit(10)
                .collect(Collectors.toList());

        // 6. 장소 통합 및 우선순위 정렬
        List<PlaceDTO> all = new ArrayList<>();
        all.addAll(selectedAttractions);
        all.addAll(selectedRestaurants);
        all.addAll(selectedCafes);

        Map<String, Integer> priority = Map.of("AT4", 1, "FD6", 2, "CE7", 3);
        all.sort(Comparator.comparingInt(p -> priority.getOrDefault(p.getCategoryCode(), 99)));

        // 7. 최종 일정 반환
        return buildScheduleResponse(departure, arrival, dateString, all);
    }

    private ScheduleResponse buildScheduleResponse(String departure, String arrival, String date,
                                                   List<PlaceDTO> places) {
        ScheduleResponse response = new ScheduleResponse();
        response.setTitle(departure + " → " + arrival + " 추천 장소");
        response.setDate(date);
        response.setPlaces(places);
        return response;
    }

    // 거리 계산 (Haversine 공식)
    private double getDistance(PlaceDTO p1, PlaceDTO p2) {
        final int EARTH_RADIUS = 6371;

        double lat1 = Math.toRadians(p1.getLat());
        double lng1 = Math.toRadians(p1.getLng());
        double lat2 = Math.toRadians(p2.getLat());
        double lng2 = Math.toRadians(p2.getLng());

        double dLat = lat2 - lat1;
        double dLng = lng2 - lng1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

	// 하루 일정 추천 (관광지2, 음식점3, 카페2)
	private List<PlaceDTO> recommendDailyPlaces(String locationKeyword, int offset) {
		List<PlaceDTO> places = new ArrayList<>();
		places.addAll(selectDistinctPlaces(kakaoPlaceUtil.searchPlaces(locationKeyword + " 관광지", "AT4"), 2, offset));
		places.addAll(selectDistinctPlaces(kakaoPlaceUtil.searchPlaces(locationKeyword + " 맛집", "FD6"), 3, offset));
		places.addAll(selectDistinctPlaces(kakaoPlaceUtil.searchPlaces(locationKeyword + " 카페", "CE7"), 2, offset));
		return places;
	}

	private List<PlaceDTO> selectDistinctPlaces(List<PlaceDTO> places, int maxCount, int offset) {
		if (places == null || places.isEmpty()) return Collections.emptyList();
		int start = offset * maxCount;
		int size = places.size();
		List<PlaceDTO> selected = new ArrayList<>();
		for (int i = 0; i < maxCount; i++) {
			int idx = (start + i) % size;
			selected.add(places.get(idx));
		}
		return selected;
	}

	public MultiDayScheduleResponse generateMultiDaySchedule(String departure, String arrival, String startDateStr, int days) {
		LocalDate startDate = LocalDate.parse(startDateStr);
		Map<String, List<PlaceDTO>> dailyPlan = new LinkedHashMap<>();
		for (int i = 0; i < days; i++) {
			LocalDate currentDate = startDate.plusDays(i);
			List<PlaceDTO> dayPlaces = recommendDailyPlaces(arrival, i);
			dailyPlan.put(currentDate.toString(), dayPlaces);
		}
		MultiDayScheduleResponse response = new MultiDayScheduleResponse();
		response.setTitle(departure + " → " + arrival + " " + days + "일 여행 일정");
		response.setDailyPlan(dailyPlan);
		return response;
	}
}
