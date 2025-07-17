package com.korea.trip.dto;

import com.korea.trip.models.Schedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleDTO {

    private Long id;
    private String title;
    private String description;
    private String startDate;
    private String endDate;
    private String departure;
    private String arrival;
    private String transportType;
    private boolean isPublic;
    private int likes;
    private int dislikes;
    private int shared;

    private List<PlaceDTO> places;
    private List<ReviewDTO> reviews;

    private String userId;
    private String username;
    private boolean isCopied;
    private Long copiedFromId;

    public static ScheduleDTO fromEntity(Schedule schedule) {
        List<PlaceDTO> placeDTOs = (schedule.getPlaces() != null) ?
                schedule.getPlaces().stream()
                        .map(PlaceDTO::fromEntity)
                        .collect(Collectors.toList()) :
                Collections.emptyList(); // Return empty list if null

        List<ReviewDTO> reviewDTOs = (schedule.getReviews() != null) ?
                schedule.getReviews().stream()
                        .map(ReviewDTO::fromEntity)
                        .collect(Collectors.toList()) :
                Collections.emptyList(); // Return empty list if null

        String userId = schedule.getUser() != null ? schedule.getUser().getUserId() : null;
        String username = schedule.getUser() != null ? schedule.getUser().getUsername() : "알 수 없음";

        return ScheduleDTO.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .description(schedule.getDescription())
                .startDate(schedule.getStartDate())
                .endDate(schedule.getEndDate())
                .departure(schedule.getDeparture())
                .arrival(schedule.getArrival())
                .transportType(schedule.getTransportType())
                .isPublic(schedule.isPublic())
                .likes(schedule.getLikes())
                .dislikes(schedule.getDislikes())
                .shared(schedule.getShared())
                .places(placeDTOs)
                .reviews(reviewDTOs)
                .userId(userId)
                .username(username)
                .isCopied(schedule.isCopied())
                .copiedFromId(schedule.getCopiedFromId())
                .build();
    }
}