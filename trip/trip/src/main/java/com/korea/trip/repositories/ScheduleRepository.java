package com.korea.trip.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.transaction.annotation.Transactional;

import com.korea.trip.models.Schedule;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUserId(Long userId);
    List<Schedule> findAllByIsPublicTrue();
	List<Schedule> findByUserIdAndIsPublicTrue(Long userId);
	List<Schedule> findByUserIdAndTitleContaining(Long userId, String title);
    List<Schedule> findByUserIdAndIsCopiedTrue(Long userId); // 찜한 일정만 조회
    List<Schedule> findByUserIdAndIsCopiedFalse(Long userId); // 직접 작성한 일정만 조회
    
    @Transactional
    void deleteByUserId(Long userId);

    @Query("SELECT s FROM Schedule s LEFT JOIN FETCH s.places WHERE s.id = :id")
    Optional<Schedule> findByIdWithPlaces(@Param("id") Long id);
}
