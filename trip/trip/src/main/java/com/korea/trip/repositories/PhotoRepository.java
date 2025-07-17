package com.korea.trip.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.korea.trip.models.Photo;
import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByScheduleId(Long scheduleId);
}
