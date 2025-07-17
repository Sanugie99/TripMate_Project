package com.korea.trip.dto;

import java.util.List;

import lombok.Data;

@Data
public class TransportResult {
    private List<String> korailOptions;
    private List<String> busOptions;
}
