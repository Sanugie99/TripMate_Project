import api from "./index";
import dayjs from "dayjs";

// 단일 일정 자동 생성
export const autoGenerateSchedule = async ({ departure, arrival, date, transportType }) => {
  const response = await api.post("/schedule/auto-generate", {
    departure,
    arrival,
    date,
    transportType
  });
  return response.data; // ScheduleResponse
};

export const fetchRecommendedPlaces = async (keyword, category) => {
  let url = `/schedule/places/recommend?keyword=${keyword}`;
  if (category) url += `&category=${category}`;
  const response = await api.get(url);
  return response.data; // List<PlaceDTO>
};

// 다일정 생성 API
export const generateMultiSchedule = async ({ departure, arrival, date, days }) => {
  const response = await api.post("/schedule/generate-multi", {
    departure,
    arrival,
    date,
    days,
  });
  return response.data;
};

// 일정 저장 (내 일정 추가하기)
export const saveSchedule = async (schedule) => {
  const allPlaces = Object.values(schedule.dailyPlan || {}).flat(); // 모든 날짜의 장소들을 합쳐서 하나의 리스트로

  const payload = {
    departure: schedule.departure,
    arrival: schedule.arrival,
    date: schedule.startDate, // ex: "2025-07-09"
    days: schedule.days || 1,
    transportType: schedule.goTransport?.split("|")[0] || "korail",
    startTime: dayjs(schedule.startDate).hour(9).minute(0).second(0).toISOString(), // 예: 09:00
    endTime: dayjs(schedule.startDate).hour(18).minute(0).second(0).toISOString(), // 예: 18:00
    places: allPlaces,
  };

  const response = await api.post("/schedule", payload);
  return response.data;
};

// 일정 업데이트
export const updateSchedule = async (scheduleId, scheduleData) => {
  const allPlaces = Object.values(scheduleData.dailyPlan || {}).flat();

  const payload = {
    departure: scheduleData.departure,
    arrival: scheduleData.arrival,
    date: scheduleData.startDate,
    days: scheduleData.days || 1,
    transportType: scheduleData.goTransport?.split("|")[0] || "korail",
    startTime: dayjs(scheduleData.startDate).hour(9).minute(0).second(0).toISOString(),
    endTime: dayjs(scheduleData.startDate).hour(18).minute(0).second(0).toISOString(),
    places: allPlaces,
    accommodation: scheduleData.accommodation,
    food: scheduleData.food,
    other: scheduleData.other,
    bus: scheduleData.bus,
    train: scheduleData.train,
    totalBudget: scheduleData.totalBudget,
    isShared: scheduleData.isShared,
  };

  const response = await api.put(`/schedule/${scheduleId}`, payload);
  return response.data;
};