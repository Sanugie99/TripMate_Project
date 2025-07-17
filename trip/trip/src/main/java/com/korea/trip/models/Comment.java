package com.korea.trip.models;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
	
	@Id @GeneratedValue
    private Long id;

    @ManyToOne
    private Review review;

    @ManyToOne
    private User user;

    private String text;
    private Date createdAt;

}
