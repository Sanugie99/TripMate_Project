import React from "react";
import styled from "styled-components";
import PlaceScheduleCard from "./PlaceScheduleCard";

// 전체 타임라인 래퍼
const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* space-y-6 */
`;

// 각 Day 섹션
const DaySection = styled.div`
  display: flex;
  flex-direction: column;
`;

// Day 제목
const DayTitle = styled.h3`
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

// Day 안의 장소 리스트
const PlaceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* space-y-2 */
`;

const ScheduleTimeline = ({ schedule }) => {
  return (
    <TimelineWrapper>
      {schedule.days.map((day, idx) => (
        <DaySection key={idx}>
          <DayTitle>Day {idx + 1}: {day.date}</DayTitle>
          <PlaceList>
            {day.places.map((place, i) => (
              <PlaceScheduleCard key={i} place={place} />
            ))}
          </PlaceList>
        </DaySection>
      ))}
    </TimelineWrapper>
  );
};

export default ScheduleTimeline;
