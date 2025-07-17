package com.korea.trip.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.korea.trip.models.User;
import com.korea.trip.repositories.UserRepository;
import com.korea.trip.util.PasswordUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void sendTemporaryPassword(String userId,String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 1. 임시 비밀번호 생성
        String tempPassword = PasswordUtil.generateTempPassword(10);

        // 2. 비밀번호 암호화 후 저장
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // 3. 이메일 내용 작성
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("TripMate 임시 비밀번호 안내");
        message.setText("안녕하세요.\n\n임시 비밀번호는 다음과 같습니다:\n\n" + tempPassword + "\n\n로그인 후 꼭 비밀번호를 변경해주세요.");

        // 4. 이메일 전송
        mailSender.send(message);
    }
}