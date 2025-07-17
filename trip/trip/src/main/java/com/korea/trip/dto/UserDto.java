package com.korea.trip.dto;

import com.korea.trip.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String userId;
    private String username;
    private String email;

    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getUserId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
