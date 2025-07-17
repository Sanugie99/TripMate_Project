package com.korea.trip.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private int rating; // e.g., 1 to 5

    @JsonIgnore // User 엔티티와의 무한 재귀 방지
    @ManyToOne
    @JoinColumn(name = "user_id") // 외래 키 컬럼 지정
    private User user;

    @ManyToOne
    @JoinColumn(name = "schedule_id") // 외래 키 컬럼 지정
    private Schedule schedule; // 스케줄과의 연관관계 추가

    @Column(nullable = false)
    private String content;

    @Column(nullable = true, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Column
    private int likes = 0;

    @Column
    private int dislikes = 0;
    
    @Column
    private Integer shared = 0;

//    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
//    private List<MyCommentEntity> comments;
}