package com.korea.trip.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Place {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String name;
	private double lat;
	private double lng;
	
	@Column(name="date")
	private String date; // YYYY-MM-DD format

	@JsonProperty("categoryCode")
	private String category;
	
	private String address;
	private String phone;
	private String imageUrl;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")  // FK 컬럼명 지정
	@JsonIgnore
    private Schedule schedule;
}
