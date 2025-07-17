package com.korea.trip.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.trip.dto.UserDto;
import com.korea.trip.models.User;
import com.korea.trip.repositories.ReviewRepository;
import com.korea.trip.repositories.ScheduleRepository;
import com.korea.trip.repositories.UserRepository;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable("userId") String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserDto.from(user));
    }

    @Transactional
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> body) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userId = userDetails.getUsername();

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update username if provided
        if (body.containsKey("username")) {
            user.setUsername(body.get("username"));
        }

        // Update email if provided
        if (body.containsKey("email")) {
            user.setEmail(body.get("email"));
        }

        // Update password if provided
        if (body.containsKey("password")) {
            String newPassword = body.get("password");
            if (newPassword != null && !newPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
                // If password is changed, it's no longer a temporary one
                user.setTemporaryPassword(false);
            }
        }

        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }

    @Transactional
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userIdString = userDetails.getUsername();

        User user = userRepository.findByUserId(userIdString)
                .orElseThrow(() -> new RuntimeException("User not found with userId: " + userIdString));

        Long userId = user.getId();

        // 1. 사용자와 관련된 리뷰 삭제
        reviewRepository.deleteByUserId(userId);

        // 2. 사용자와 관련된 스케줄 삭제
        scheduleRepository.deleteByUserId(userId);

        // 3. 사용자 삭제
        userRepository.delete(user);

        return ResponseEntity.ok("User account deleted successfully.");
    }
}
