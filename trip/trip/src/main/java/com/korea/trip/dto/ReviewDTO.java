package com.korea.trip.dto;

import com.korea.trip.models.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private String title;
    private String content;
    private int rating;
    private String userId;
    private String username;
    private String createdAt; // createdAt 필드 추가

    public static ReviewDTO fromEntity(Review review) {
        // 날짜 포맷 지정
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String formattedDateTime = review.getCreatedAt() != null ? review.getCreatedAt().format(formatter) : "";

        return ReviewDTO.builder()
                .id(review.getId())
                .title(review.getTitle())
                .content(review.getContent())
                .rating(review.getRating())
                .userId(review.getUser() != null ? review.getUser().getUserId() : null)
                .username(review.getUser() != null ? review.getUser().getUsername() : "알 수 없음")
                .createdAt(formattedDateTime) // 포맷된 날짜 사용
                .build();
    }
}
