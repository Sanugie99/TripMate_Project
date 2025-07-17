package com.korea.trip.util;

public enum TimeRange {
    MORNING(5, 12), // 05:00 ~ 11:59
    AFTERNOON(12, 18), // 12:00 ~ 17:59
    EVENING(18, 23); // 18:00 ~ 22:59

    private final int startHour;
    private final int endHour;

    TimeRange(int startHour, int endHour) {
        this.startHour = startHour;
        this.endHour = endHour;
    }

    public boolean isInRange(String timeStr) {
        if (timeStr == null || timeStr.length() < 12) return false;
        try {
            int hour = Integer.parseInt(timeStr.substring(8, 10));
            return hour >= startHour && hour < endHour;
        } catch (Exception e) {
            return false;
        }
    }
    
    public static TimeRange fromString(String str) {
        if (str == null) return null;
        switch (str.toLowerCase()) {
            case "morning": return MORNING;
            case "afternoon": return AFTERNOON;
            case "evening": return EVENING;
            default: return null;
        }
    }
}
