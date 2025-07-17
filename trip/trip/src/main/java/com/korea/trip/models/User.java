package com.korea.trip.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String userId;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(nullable = false)
	private String password;

	@Column
	private String email;

	private boolean temporaryPassword;

	
	// 연관관계
	@JsonIgnore
	@OneToMany(mappedBy = "user")
	private List<Schedule> schedules = new ArrayList<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user")
	private List<Review> reviews = new ArrayList<>();

	public User(String userId, String username, String password, String email) {
		this.userId = userId;
		this.username = username;
		this.password = password;
		this.email = email;
	}
}
