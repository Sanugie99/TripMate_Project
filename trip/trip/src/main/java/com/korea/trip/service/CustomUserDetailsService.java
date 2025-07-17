package com.korea.trip.service;

import com.korea.trip.models.User;
import com.korea.trip.models.UserPrincipal;
import com.korea.trip.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // 로그인 시 호출됨 (userId 기준으로 조회)
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with userId: " + userId));
        return UserPrincipal.create(user);
    }

    // JWT 토큰 인증 시 호출됨 (id 기준)
    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with id: " + id));
        return UserPrincipal.create(user);
    }
}
