package com.korea.trip.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {
    public static final DateTimeFormatter KORAIL_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    public static LocalDateTime parseKorailDateTime(String korailDateTime) {
        return LocalDateTime.parse(korailDateTime, KORAIL_FORMATTER);
    }
    
    public static LocalDateTime parseBusDateTime(String busDateTime) {
        return LocalDateTime.parse(busDateTime, KORAIL_FORMATTER);
    }
}
