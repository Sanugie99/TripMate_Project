package com.korea.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpRequest {

	@NotBlank
	@Size(min = 3, max = 20)
	private String userId;
	@NotBlank
	@Size(min = 6, max = 40)
	private String password;
	
	private String username;
	private String email; 
}
