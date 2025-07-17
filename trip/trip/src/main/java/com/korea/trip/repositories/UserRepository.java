package com.korea.trip.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.korea.trip.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
    Boolean existsByUserId(String userId);
    Boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Optional<User> findByUsernameIgnoreCaseAndEmailIgnoreCase(String username, String email);
}