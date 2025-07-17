package com.korea.trip.controller;

import com.korea.trip.models.Photo;
import com.korea.trip.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/photos")

public class PhotoController {

    private final PhotoService photoService;

    @Autowired
    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping("/upload/{scheduleId}")
    public ResponseEntity<Photo> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @PathVariable("scheduleId") Long scheduleId) {
        try {
            Photo photo = photoService.uploadPhoto(file, scheduleId);
            return ResponseEntity.ok(photo);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(null); // 또는 더 구체적인 오류 응답
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 스케줄을 찾을 수 없는 경우
        }
    }

    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<Photo>> getPhotosBySchedule(@PathVariable("scheduleId") Long scheduleId) {
        List<Photo> photos = photoService.getPhotosByScheduleId(scheduleId);
        return ResponseEntity.ok(photos);
    }
}
