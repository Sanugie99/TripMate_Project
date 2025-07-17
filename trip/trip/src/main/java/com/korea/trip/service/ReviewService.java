package com.korea.trip.service;

import com.korea.trip.models.Review;
import com.korea.trip.models.Schedule;
import com.korea.trip.models.User;
import com.korea.trip.repositories.ReviewRepository;
import com.korea.trip.repositories.ScheduleRepository;
import com.korea.trip.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, ScheduleRepository scheduleRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
    }

    public List<Review> getReviewsBySchedule(Long scheduleId) {
        return reviewRepository.findByScheduleId(scheduleId);
    }

    @Transactional
    public Review createReview(Long scheduleId, String content, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        Review review = new Review();
        review.setUser(user);
        review.setSchedule(schedule);
        review.setContent(content);
        
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException("You do not have permission to delete this review");
        }

        reviewRepository.delete(review);
    }
}
