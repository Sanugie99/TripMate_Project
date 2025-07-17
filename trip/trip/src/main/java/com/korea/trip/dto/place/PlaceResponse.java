package com.korea.trip.dto.place;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PlaceResponse {
	private Long id;
	private String name;
	private double lat;
	private double lng;
	private String category;
	private String address;
	private String phone;
	private String imageUrl;
}
