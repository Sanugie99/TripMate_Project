package com.korea.trip.controller;

import com.korea.trip.dto.ReviewDTO;
import com.korea.trip.models.Review;
import com.korea.trip.models.UserPrincipal;
import com.korea.trip.security.CurrentUser;
import com.korea.trip.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"https://www.tripmateweb.store", "https://tripmateweb.store"}, allowCredentials = "true")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsBySchedule(@PathVariable("scheduleId") Long scheduleId) {
        List<Review> reviews = reviewService.getReviewsBySchedule(scheduleId);
        List<ReviewDTO> reviewDTOs = reviews.stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviewDTOs);
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody Map<String, String> payload, @CurrentUser UserPrincipal currentUser) {
        Long scheduleId = Long.parseLong(payload.get("scheduleId"));
        String content = payload.get("content");
        
        Review newReview = reviewService.createReview(scheduleId, content, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ReviewDTO.fromEntity(newReview));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable("reviewId") Long reviewId, @CurrentUser UserPrincipal currentUser) {
        try {
            reviewService.deleteReview(reviewId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
