package com.korea.trip.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.trip.models.Place;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long>, JpaSpecificationExecutor<Place> {
	List<Place> findByNameContainingAndCategoryAndAddressContaining(String name, String category, String address);

	@Modifying
	@Query("DELETE FROM Place p WHERE p.schedule.id = :scheduleId")
	void deleteByScheduleId(@Param("scheduleId") Long scheduleId);
}
