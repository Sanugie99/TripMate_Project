package com.korea.trip.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.korea.trip.models.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserId(Long userId);
    List<Review> findByScheduleId(Long scheduleId);
    void deleteByUserId(Long userId);
}