import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ScheduleForm from "../components/schedule/ScheduleForm";
import MultiDayScheduleResult from "../components/schedule/MultiDayScheduleResult";
import ScheduleMapComponent from "../components/map/ScheduleMapComponent";
import { fetchRecommendedPlaces, generateMultiSchedule } from "../api/scheduleApi";

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  min-height: 800px;
  padding: 1rem;
  background: #f9faff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const TopRow = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
`;

const FormBox = styled.div`
  flex: 1;
  min-width: 280px;
`;

const MapBox = styled.div`
  flex: 1;
  min-width: 300px;
  height: 410px;
`;

const ResultBox = styled.div`
  margin-top: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #222;
`;

const Message = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.error ? "red" : "#555")};
  font-weight: ${(props) => (props.error ? "700" : "400")};
`;

const SchedulePage = ({
    defaultDeparture = "",
    defaultArrival = "",
    defaultDate = "",
    defaultDays = 1,
    onScheduleGenerated // 부모로부터 받을 콜백 함수
}) => {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);

    // 일정이 생성되면 첫 번째 날짜를 자동 선택
    useEffect(() => {
        if (schedule && schedule.dailyPlan) {
            const dates = Object.keys(schedule.dailyPlan);
            if (dates.length > 0) {
                setSelectedDate(dates[0]);
            }
        }
    }, [schedule]);

    const handleGenerate = async (formData) => {
        setLoading(true);
        setError("");
        setSchedule(null);
        setSelectedPlaceId(null);

        try {
            const recommendRes = await fetchRecommendedPlaces(formData.arrival);
            console.log("추천 장소:", recommendRes);
            const scheduleRes = await generateMultiSchedule({
                departure: formData.departure,
                arrival: formData.arrival,
                date: formData.date,
                days: formData.days,
            });
            console.log("생성된 일정:", scheduleRes);

            const places = recommendRes.places || recommendRes;
            setFilteredPlaces(places);

            setSchedule({
                places,
                dailyPlan: scheduleRes.dailyPlan,
            });
        } catch (err) {
            setError("일정 생성 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = () => {
        if (onScheduleGenerated) {
            // 모달로 사용될 경우: 콜백 함수를 호출하여 데이터를 부모에게 전달
            onScheduleGenerated(schedule);
        } else {
            // 독립 페이지로 사용될 경우: 기존 방식대로 동작
            localStorage.setItem("mySchedule", JSON.stringify(schedule));
            window.location.href = "/my-schedule";
        }
    };


    return (
        <Container>
            <Title>
                <span role="img" aria-label="지구">🌏</span>
                여행 일정 추천
            </Title>
            <TopRow>
                <FormBox>
                    <ScheduleForm
                        onSubmit={handleGenerate}
                        defaultDeparture={defaultDeparture}
                        defaultArrival={defaultArrival}
                        defaultDate={defaultDate}
                        defaultDays={defaultDays}
                    />
                </FormBox>
                <MapBox>
                    <ScheduleMapComponent
                        dailyPlan={schedule?.dailyPlan || {}}
                        selectedDate={selectedDate}
                        selectedPlace={selectedPlace}
                        onCloseInfo={() => setSelectedPlace(null)}
                    />
                </MapBox>
            </TopRow>
            <ResultBox>
                {loading && <Message>⏳ 일정을 생성 중입니다...</Message>}
                {error && <Message error>{error}</Message>}
                {schedule && (
                    <>
                        <MultiDayScheduleResult
                            schedule={schedule}
                            selectedDate={selectedDate}
                            setSelectedDate={(date) => {
                                setSelectedDate(date);
                                setSelectedPlace(null);
                            }}
                            onPlaceClick={(place) => setSelectedPlace(place)}
                        />
                        <button
                            onClick={handleAddSchedule} // 수정된 핸들러 연결
                            style={{
                                marginTop: "1rem",
                                padding: "0.5rem 1rem",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            내 일정에 추가하기
                        </button>
                    </>
                )}
            </ResultBox>
        </Container>
    );
};

export default SchedulePage;
