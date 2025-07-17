package com.korea.trip.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ReviewResponse {
	private Long id;
	private Long placeId;
	private String content;
	private int rating;
	private String authorNickname;
	private String createdAt;
}
