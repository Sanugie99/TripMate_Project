package com.korea.trip.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.korea.trip.dto.PlaceDTO;
import com.korea.trip.dto.ScheduleCreateRequest;
import com.korea.trip.dto.ScheduleDTO;
import com.korea.trip.dto.ScheduleResponse;
import com.korea.trip.models.Place;
import com.korea.trip.models.Schedule;
import com.korea.trip.models.User;
import com.korea.trip.repositories.PlaceRepository;
import com.korea.trip.repositories.ScheduleRepository;
import com.korea.trip.repositories.UserRepository;

import java.time.format.DateTimeFormatter;
import com.korea.trip.util.GenerateItinerary;
import com.korea.trip.util.KakaoPlaceUtil;

import jakarta.transaction.Transactional;

@Service
public class ScheduleService {

	private final GenerateItinerary generateItinerary;
	private final UserRepository userRepository;
	private final ScheduleRepository scheduleRepository;
	private final PlaceRepository placeRepository;
	private final KakaoPlaceUtil kakaoPlaceUtil; // KakaoPlaceUtil 주입

	@Autowired
	public ScheduleService(GenerateItinerary generateItinerary, UserRepository userRepository,
			ScheduleRepository scheduleRepository, PlaceRepository placeRepository, KakaoPlaceUtil kakaoPlaceUtil) { // 생성자에
																														// 추가
		this.generateItinerary = generateItinerary;
		this.userRepository = userRepository;
		this.scheduleRepository = scheduleRepository;
		this.placeRepository = placeRepository;
		this.kakaoPlaceUtil = kakaoPlaceUtil; // 주입된 객체 할당
	}

	// This method might need updating if GenerateItinerary produces multi-day
	// responses
	public ScheduleResponse generateSchedule(String departure, String arrival, java.time.LocalDateTime startTime,
			java.time.LocalDateTime endTime, String transportType) {
		return generateItinerary.generate(departure, arrival, startTime, endTime, transportType);
	}

	@Transactional
	public void saveScheduleToUser(ScheduleResponse response, Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		Schedule entity = new Schedule();
		entity.setUser(user);
		// Assuming single date from response for now, might need endDate if response
		// changes
		entity.setStartDate(response.getDate());
		entity.setTitle(response.getTitle());
		entity.setDeparture(response.getDeparture());
		entity.setArrival(response.getArrival());
		entity.setTransportType(response.getTransportType());
		entity.setPublic(false);

		if (response.getPlaces() != null) {
			for (PlaceDTO placeDto : response.getPlaces()) {
				Place newPlace = new Place();
				newPlace.setName(placeDto.getName());
				newPlace.setAddress(placeDto.getAddress());
				newPlace.setLat(placeDto.getLat());
				newPlace.setLng(placeDto.getLng());
				newPlace.setDate(response.getDate()); // Assigning the schedule's date to the place
				newPlace.setCategory(placeDto.getCategoryCode()); // Map categoryCode from DTO to category in Entity
				newPlace.setImageUrl(placeDto.getPhotoUrl()); // Map photoUrl from DTO to imageUrl in Entity
				newPlace.setSchedule(entity);
				entity.getPlaces().add(newPlace);
			}
		}

		scheduleRepository.save(entity);
	}

	public List<Schedule> getSharedSchedules() {
		return scheduleRepository.findAllByIsPublicTrue();
	}

	public List<Schedule> getSchedulesByUserId(Long userId) {
		// 기존: return scheduleRepository.findByUserId(userId);
		// 수정: isCopied=false인 일정만 반환
		return scheduleRepository.findByUserIdAndIsCopiedFalse(userId);
	}

	public Schedule getScheduleById(Long id) {
		return scheduleRepository.findByIdWithPlaces(id)
				.orElseThrow(() -> new RuntimeException("Schedule not found with id " + id));
	}

	@Transactional
	public void updateSchedulePublicStatus(Long scheduleId, boolean isPublic) {
		Schedule schedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new RuntimeException("Schedule not found"));
		schedule.setPublic(isPublic);
		scheduleRepository.save(schedule);
	}

	@Transactional
	public void deleteSchedule(Long id) {
		if (!scheduleRepository.existsById(id)) {
			throw new RuntimeException("id를 찾을 수 없습니다");
		}
		scheduleRepository.deleteById(id);
	}

	@Transactional
	public Schedule updateSchedule(Long scheduleId, ScheduleDTO scheduleDTO) {
		Schedule schedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new RuntimeException("Schedule not found with id " + scheduleId));

		schedule.setTitle(scheduleDTO.getTitle());
		schedule.setStartDate(scheduleDTO.getStartDate());
		schedule.setEndDate(scheduleDTO.getEndDate());
		schedule.setDeparture(scheduleDTO.getDeparture());
		schedule.setArrival(scheduleDTO.getArrival());
		schedule.setTransportType(scheduleDTO.getTransportType());
		schedule.setPublic(scheduleDTO.isPublic());

		schedule.getPlaces().clear();

		if (scheduleDTO.getPlaces() != null) {
			for (PlaceDTO placeDto : scheduleDTO.getPlaces()) {
				Place newPlace = new Place();
				newPlace.setName(placeDto.getName());
				newPlace.setAddress(placeDto.getAddress());
				newPlace.setLat(placeDto.getLat());
				newPlace.setLng(placeDto.getLng());
				newPlace.setDate(placeDto.getDate()); // Set the date for each place
				newPlace.setSchedule(schedule);
				schedule.getPlaces().add(newPlace);
			}
		}

		return scheduleRepository.save(schedule);
	}

	public List<ScheduleDTO> getSharedSchedulesByUser(Long userId) {
		System.out.println("Attempting to fetch shared schedules for user ID: " + userId);
		try {
			List<Schedule> schedules = scheduleRepository.findByUserIdAndIsPublicTrue(userId);
			System.out.println("Found " + schedules.size() + " shared schedules for user ID: " + userId);
			List<ScheduleDTO> dtoList = schedules.stream()
					.map(schedule -> {
						try {
							return ScheduleDTO.fromEntity(schedule);
						} catch (Exception e) {
							System.err.println("Error mapping Schedule to ScheduleDTO for schedule ID: " + schedule.getId() + " - " + e.getMessage());
							e.printStackTrace();
							return null; // Or throw a specific exception, or log and skip
						}
					})
					.filter(dto -> dto != null) // Filter out any nulls if mapping failed
					.collect(Collectors.toList());
			System.out.println("Successfully mapped " + dtoList.size() + " shared schedules to DTOs.");
			return dtoList;
		} catch (Exception e) {
			System.err.println("Error in getSharedSchedulesByUser for user ID: " + userId + " - " + e.getMessage());
			e.printStackTrace();
			throw new RuntimeException("Failed to retrieve shared schedules: " + e.getMessage(), e);
		}
	}

	// This method might need review if places are now date-specific
	@Transactional
	public void deletePlace(Long placeId, Long userId) {
		Place place = placeRepository.findById(placeId).orElseThrow(() -> new RuntimeException("장소를 찾을 수 없습니다."));

		Schedule schedule = place.getSchedule();
		if (schedule == null) {
			throw new RuntimeException("장소에 연결된 일정이 없습니다.");
		}

		if (!schedule.getUser().getId().equals(userId)) {
			throw new RuntimeException("권한이 없습니다.");
		}

		schedule.getPlaces().remove(place);
		place.setSchedule(null);
		placeRepository.delete(place);
	}

	// 새로운 여행지 추천 서비스 메서드
	public List<PlaceDTO> getRecommendedPlaces(String keyword) {
		System.out.println("getRecommendedPlaces 호출: " + keyword);
		List<PlaceDTO> result = new ArrayList<>();
		result.addAll(kakaoPlaceUtil.searchPlaces(keyword, null)); // 관광지/명소
		System.out.println("관광지 호출 완료");
		result.addAll(kakaoPlaceUtil.searchPlaces(keyword, "FD6")); // 음식점
		System.out.println("음식점 호출 완료");
		result.addAll(kakaoPlaceUtil.searchPlaces(keyword, "CE7")); // 카페
		System.out.println("카페 호출 완료");
		result.addAll(kakaoPlaceUtil.searchPlaces(keyword, "AD5")); // 숙박
		System.out.println("숙박 호출 완료");
		return result;
	}

	public List<PlaceDTO> getRecommendedPlacesByCategory(String keyword, String category) {
		System.out.println("getRecommendedPlacesByCategory 호출: " + keyword + ", " + category);
		return kakaoPlaceUtil.searchPlaces(keyword, category);
	}

	public ScheduleDTO createSchedule(ScheduleCreateRequest request, Long userId) {
		 System.out.println("Request received: " + request);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Schedule schedule = new Schedule();
        schedule.setUser(user);

        schedule.setDeparture(request.getDeparture());
        schedule.setArrival(request.getArrival());
        schedule.setTransportType(request.getTransportType());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());

        // 날짜 처리: 시작일(date) 기준으로 days를 더해서 종료일 계산
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate startDate = LocalDate.parse(request.getDate(), formatter);
        schedule.setStartDate(request.getDate());

        if (request.getDays() != null && request.getDays() > 1) {
            LocalDate endDate = startDate.plusDays(request.getDays() - 1);
            schedule.setEndDate(endDate.format(formatter));
        } else {
            // days가 없거나 1 이하인 경우 시작일과 동일하게 세팅
            schedule.setEndDate(request.getDate());
        }

        schedule.setTitle(request.getDeparture() + " → " + request.getArrival() + " 일정");
        schedule.setDescription("");

        // places 매핑 처리
        if (request.getPlaces() != null && !request.getPlaces().isEmpty()) {
            List<Place> placeEntities = request.getPlaces().stream()
                .map(dto -> {
                    Place place = new Place();
                    place.setName(dto.getName());
                    place.setCategory(dto.getCategory());
                    place.setLat(dto.getLat());
                    place.setLng(dto.getLng());
                    place.setDate(dto.getDate());
                    place.setSchedule(schedule); // 연관관계 설정
                    return place;
                })
                .collect(Collectors.toList());

            schedule.setPlaces(placeEntities);
        }

        Schedule saved = scheduleRepository.save(schedule);
        return ScheduleDTO.fromEntity(saved);
    }

    @Transactional
    public ScheduleDTO copySchedule(Long originalScheduleId, Long newUserId) {
        Schedule originalSchedule = scheduleRepository.findById(originalScheduleId)
            .orElseThrow(() -> new RuntimeException("원본 일정을 찾을 수 없습니다."));
        
        // 원본 스케줄의 shared 카운트 1 증가
        originalSchedule.setShared(originalSchedule.getShared() + 1);
        scheduleRepository.save(originalSchedule);

        User newUser = userRepository.findById(newUserId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Schedule newSchedule = new Schedule();
        newSchedule.setUser(newUser);
        newSchedule.setTitle(originalSchedule.getTitle());
        newSchedule.setStartDate(originalSchedule.getStartDate());
        newSchedule.setEndDate(originalSchedule.getEndDate());
        newSchedule.setDeparture(originalSchedule.getDeparture());
        newSchedule.setArrival(originalSchedule.getArrival());
        newSchedule.setTransportType(originalSchedule.getTransportType());
        newSchedule.setPublic(false); // 복사된 일정은 기본적으로 비공개
        newSchedule.setCopied(true); // 복사본임을 명시
        newSchedule.setCopiedFromId(originalSchedule.getId()); // 원본 id 저장

        if (originalSchedule.getPlaces() != null) {
            List<Place> newPlaces = originalSchedule.getPlaces().stream().map(originalPlace -> {
                Place newPlace = new Place();
                newPlace.setName(originalPlace.getName());
                newPlace.setAddress(originalPlace.getAddress());
                newPlace.setLat(originalPlace.getLat());
                newPlace.setLng(originalPlace.getLng());
                newPlace.setDate(originalPlace.getDate());
                newPlace.setCategory(originalPlace.getCategory());
                newPlace.setImageUrl(originalPlace.getImageUrl());
                newPlace.setSchedule(newSchedule);
                return newPlace;
            }).collect(Collectors.toList());
            newSchedule.setPlaces(newPlaces);
        }

        Schedule savedSchedule = scheduleRepository.save(newSchedule);
        // DTO를 반환하여 클라이언트가 새 정보를 가질 수 있도록 함
        return ScheduleDTO.fromEntity(originalSchedule);
    }

    @Transactional
    public Schedule likeSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id " + scheduleId));
        schedule.setLikes(schedule.getLikes() + 1);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule dislikeSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new RuntimeException("Schedule not found with id " + scheduleId));
        schedule.setDislikes(schedule.getDislikes() + 1);
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleDTO> getSavedSchedulesByUser(Long userId) {
        // 사용자가 찜한 일정들을 조회 (isCopied=true)
        List<Schedule> savedSchedules = scheduleRepository.findByUserIdAndIsCopiedTrue(userId);
        return savedSchedules.stream()
            .map(ScheduleDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSavedSchedule(Long scheduleId, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new RuntimeException("찜한 일정을 찾을 수 없습니다."));
        
        // 본인이 찜한 일정인지 확인
        if (!schedule.getUser().getId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        
        // isCopied 필드로 찜한 일정 여부 확인
        if (!schedule.isCopied()) {
            throw new RuntimeException("찜한 일정이 아닙니다.");
        }
        
        scheduleRepository.delete(schedule);
    }
}
