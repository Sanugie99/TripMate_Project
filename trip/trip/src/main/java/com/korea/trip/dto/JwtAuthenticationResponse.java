package com.korea.trip.dto;

import lombok.Getter;

@Getter
public class JwtAuthenticationResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private boolean temporaryPassword;

    public JwtAuthenticationResponse(String accessToken, boolean temporaryPassword) {
        this.accessToken = accessToken;
        this.temporaryPassword = temporaryPassword;
    }
}

