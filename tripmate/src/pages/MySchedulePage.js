import { useEffect, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import MapComponent from "../components/map/ScheduleMapComponent";
import PlaceSearchBar from "../components/schedule/PlaceSearchBar";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";
import dayjs from "dayjs";
import SimpleModal from "../components/Modal/SimpleModal";
import SearchPage from "./SearchPage";
import SchedulePage from "./SchedulePage";
import axios from 'axios';
import { saveSchedule } from "../api/scheduleApi";

const CreateScheduleButton = styled.button`
  background: ${(props) => props.bg || "#4CAF50"};
  // ...
  &:hover {
    background: ${(props) => props.$hover || "#45a049"};
  }
`;


const PageContainer = styled.div`
  display: flex;
  height: 90vh;
  padding: 1rem;
`;

const LeftMap = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const RightList = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 12px;
`;

const DateSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const DateButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${(props) => (props.$active ? "#007bff" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.$active ? "#0056b3" : "#eaeaea")};
  }
`;

const NavigationButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #555;
  margin: 0 0.5rem;

  &:hover {
    color: #000;
  }
`;

const Item = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none; /* 드래그 중 텍스트 선택 방지 */
`;


const DeleteButton = styled.button`
  background-color: #ff6b6b;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff4c4c;
  }
`;

const TransportInfo = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const TransportTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
`;

const TransportDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const TransportLabel = styled.span`
  font-weight: 600;
  color: #6c757d;
`;

const TransportValue = styled.span`
  color: #495057;
`;

const BudgetInput = styled.input`
  text-align: right;
  width: 100px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const MySchedulePage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Added useNavigate
    const [schedule, setSchedule] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [prevIndexMap, setPrevIndexMap] = useState({});
    const [transportInfo, setTransportInfo] = useState(null);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [hasCreatedSchedule, setHasCreatedSchedule] = useState(false); // New state

    // 예산 관리를 위한 state 추가
    const [accommodation, setAccommodation] = useState(0);
    const [food, setFood] = useState(0);
    const [other, setOther] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);

    // 교통비 파싱 함수 (가격만 추출)
    const parseTransportCost = (transportStr) => {
        if (!transportStr || typeof transportStr !== 'string') return 0;
        const parts = transportStr.split('|').map(part => part.trim());
        if (parts.length >= 4) {
            const costPart = parts[3].replace('원', '');
            return parseInt(costPart, 10) || 0;
        }
        return 0;
    };

    // 예산 자동 합계 useEffect
    useEffect(() => {
        const goCost = transportInfo?.goTransport ? parseTransportCost(transportInfo.goTransport) : 0;
        const returnCost = transportInfo?.returnTransport ? parseTransportCost(transportInfo.returnTransport) : 0;

        const total =
            (parseInt(accommodation, 10) || 0) +
            (parseInt(food, 10) || 0) +
            (parseInt(other, 10) || 0) +
            goCost +
            returnCost;

        setTotalBudget(total);
    }, [accommodation, food, other, transportInfo]);


    const handlePlaceAddedFromModal = (place) => {
        addCustomPlace(place);
        setOpenSearchModal(false); // Close modal after adding
    };

    // 스케줄 추천 모달에서 받은 데이터를 처리하는 함수
    const handleScheduleRecommendation = (recommendedSchedule) => {
        if (!schedule || !recommendedSchedule || !recommendedSchedule.dailyPlan) {
            console.error("추천된 스케줄 데이터가 올바르지 않습니다.");
            setOpenScheduleModal(false);
            return;
        }

        // 기존 스케줄 정보는 유지하면서 dailyPlan만 교체
        const updatedSchedule = {
            ...schedule,
            dailyPlan: recommendedSchedule.dailyPlan,
            places: Object.values(recommendedSchedule.dailyPlan).flat(), // places 목록도 새것으로 업데이트
        };

        setSchedule(updatedSchedule);
        localStorage.setItem("mySchedule", JSON.stringify(updatedSchedule)); // localStorage도 업데이트
        setOpenScheduleModal(false); // 모달 닫기
    };

    // 4자리 숫자(0630) → 06:30 변환 함수
    const formatTime = (str) => {
        if (!str || str.length !== 4) return str;
        return str.slice(0, 2) + ':' + str.slice(2, 4);
    };

    // 교통편 정보를 파싱하여 종류와 시간을 분리하는 함수
    const parseTransportInfo = (transportStr) => {
        if (!transportStr || typeof transportStr !== 'string') return { type: transportStr, time: '' };

        // "KTX | 서울역 → 부산역 | 0630 → 0930 | 59800원" 형태 파싱
        const parts = transportStr.split('|').map(part => part.trim());

        if (parts.length >= 3) {
            const type = parts[0]; // KTX, ITX, SRT, 버스 등
            const timeMatch = parts[2].match(/(\d{4})\s*→\s*(\d{4})/);

            if (timeMatch) {
                const depTime = formatTime(timeMatch[1]);
                const arrTime = formatTime(timeMatch[2]);
                return {
                    type: type,
                    time: `${depTime} - ${arrTime}`
                };
            }
        }

        return { type: transportStr, time: '' };
    };

    useEffect(() => {
        let newHasCreatedSchedule = false;
        if (location.state) {
            setTransportInfo(location.state);
            if (location.state.goTransport || location.state.returnTransport || location.state.days > 0) {
                newHasCreatedSchedule = true;
            }

            const newScheduleData = {
                departure: location.state.departure || "",
                arrival: location.state.arrival || "",
                startDate: location.state.date || "",
                days: location.state.days || 1,
                goTransport: location.state.goTransport || "",
                returnTransport: location.state.returnTransport || "",
                dailyPlan: {},
                isShared: false,
            };

            const start = dayjs(location.state.date);
            for (let i = 0; i < location.state.days; i++) {
                const dateKey = start.add(i, "day").format("YYYY-MM-DD");
                newScheduleData.dailyPlan[dateKey] = [];
            }

            // dailyPlan 내 모든 장소를 합쳐 places 배열 생성 (초기에는 빈 배열이지만 추후 추가하면 여기서도 갱신 필요)
            newScheduleData.places = Object.values(newScheduleData.dailyPlan).flat();

            setSchedule(newScheduleData);
            localStorage.setItem("mySchedule", JSON.stringify(newScheduleData));
            setSelectedDate(Object.keys(newScheduleData.dailyPlan)[0]);
        } else {
            const saved = localStorage.getItem("mySchedule");
            if (saved) {
                const parsed = JSON.parse(saved);

                // 만약 places 필드가 없으면 dailyPlan로부터 생성
                if (!parsed.places) {
                    parsed.places = Object.values(parsed.dailyPlan).flat();
                }

                setSchedule(parsed);

                const dates = Object.keys(parsed.dailyPlan);
                if (dates.length > 0) setSelectedDate(dates[0]);

                if (parsed.goTransport || parsed.returnTransport || (parsed.dailyPlan && Object.keys(parsed.dailyPlan).length > 0)) {
                    newHasCreatedSchedule = true;
                }
            }
        }
        setHasCreatedSchedule(newHasCreatedSchedule);
    }, [location.state]);

    const addCustomPlace = (place) => {
        if (!selectedDate || !place) return;

        // 기본 구조 예시 (place에 name, category, lat, lng 필드가 있어야 함)
        const newPlace = {
            id: place.id || new Date().getTime(), // 임시 id
            name: place.name || "이름없음",
            category: place.category || "기타",
            lat: place.lat,
            lng: place.lng,
            date: selectedDate, // 날짜 정보 추가
        };

        const updated = { ...schedule };
        updated.dailyPlan[selectedDate] = [...(updated.dailyPlan[selectedDate] || []), newPlace];
        setSchedule(updated);
        localStorage.setItem("mySchedule", JSON.stringify(updated));
    };

    const deletePlace = (date, idx) => {
        const updated = { ...schedule };
        updated.dailyPlan[date] = updated.dailyPlan[date].filter((_, i) => i !== idx);
        setSchedule(updated);
        localStorage.setItem("mySchedule", JSON.stringify(updated));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const updated = { ...schedule };

        const sourceItems = Array.from(updated.dailyPlan[source.droppableId]);
        const [movedItem] = sourceItems.splice(source.index, 1);
        updated.dailyPlan[source.droppableId] = sourceItems;

        // 날짜 이동 시 날짜 속성 업데이트
        if (source.droppableId !== destination.droppableId) {
            movedItem.date = destination.droppableId;
        }

        const destItems = Array.from(updated.dailyPlan[destination.droppableId] || []);
        destItems.splice(destination.index, 0, movedItem);
        updated.dailyPlan[destination.droppableId] = destItems;

        setSchedule(updated);
        localStorage.setItem("mySchedule", JSON.stringify(updated));
    };

    const moveDate = (direction) => {
        if (!schedule || !selectedDate) return;
        const dates = Object.keys(schedule.dailyPlan);
        const currentIndex = dates.indexOf(selectedDate);
        const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < dates.length) {
            setSelectedDate(dates[newIndex]);
            setSelectedPlace(null);
        }
    };

    // 여행 날짜 배열 생성 함수
    const getTravelDates = () => {
        if (transportInfo && transportInfo.date && transportInfo.days) {
            const start = dayjs(transportInfo.date);
            const arr = [];
            for (let i = 0; i < transportInfo.days; i++) {
                arr.push(start.add(i, "day").format("YYYY-MM-DD"));
            }
            return arr;
        }
        // fallback: 기존 dailyPlan의 key 사용
        if (schedule && schedule.dailyPlan) {
            return Object.keys(schedule.dailyPlan);
        }
        return [];
    };
    // 일정 저장 함수 내에서도 places 업데이트
    const handleSaveSchedule = async () => {
        if (!schedule) return;

        // dailyPlan을 기반으로 각 장소에 날짜 정보를 포함하는 새로운 dailyPlan 생성
        const dailyPlanWithDates = Object.entries(schedule.dailyPlan).reduce((acc, [date, placesOnDate]) => {
            acc[date] = placesOnDate.map(place => ({
                ...place,
                date: date // 각 장소 객체에 날짜(YYYY-MM-DD) 정보를 명시적으로 추가
            }));
            return acc;
        }, {});

        const start = dayjs(schedule.startDate || schedule.date);
        const end = start.add(schedule.days - 1, 'day');

        const goCost = transportInfo?.goTransport ? parseTransportCost(transportInfo.goTransport) : 0;
        const returnCost = transportInfo?.returnTransport ? parseTransportCost(transportInfo.returnTransport) : 0;

        const fullSchedule = {
            ...schedule,
            dailyPlan: dailyPlanWithDates, // 날짜 정보가 포함된 새로운 dailyPlan 사용
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            accommodation: parseInt(accommodation, 10) || 0,
            food: parseInt(food, 10) || 0,
            other: parseInt(other, 10) || 0,
            bus: 0,
            train: goCost + returnCost,
            totalBudget: totalBudget,
        };

        try {
            console.log("저장될 최종 스케줄 데이터:", fullSchedule);
            const saved = await saveSchedule(fullSchedule);
            navigate(`/schedule/${saved.id}`);
        } catch (e) {
            console.error("일정 저장 실패:", e);
            alert("일정 저장에 실패했습니다.");
        }
    };
    return (
        <PageContainer>
            <LeftMap>
                <PlaceSearchBar onPlaceSelect={addCustomPlace} />
                <MapComponent
                    dailyPlan={schedule?.dailyPlan || {}}
                    selectedDate={selectedDate}
                    selectedPlace={selectedPlace}
                    onCloseInfo={() => setSelectedPlace(null)}
                />
            </LeftMap>

            <RightList>
                {!hasCreatedSchedule && (
                    <CreateScheduleButton onClick={() => navigate("/start-planner")}>
                        간편 일정 생성하기
                    </CreateScheduleButton>
                )}


                {hasCreatedSchedule && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2>내 일정</h2>
                            <CreateScheduleButton
                                bg="#2563eb"
                                $hover="#1e40af"
                                onClick={handleSaveSchedule}
                            >
                                ✨ 일정 저장하고 상세 보기
                            </CreateScheduleButton>
                        </div>
                        {/* 교통편 정보 표시 */}
                        {transportInfo && (
                            <TransportInfo>
                                <TransportTitle>🚄 교통편 정보</TransportTitle>
                                <TransportDetail>
                                    <TransportLabel>출발지:</TransportLabel>
                                    <TransportValue>{transportInfo.departure}</TransportValue>
                                </TransportDetail>
                                <TransportDetail>
                                    <TransportLabel>도착지:</TransportLabel>
                                    <TransportValue>{transportInfo.arrival}</TransportValue>
                                </TransportDetail>
                                <TransportDetail>
                                    <TransportLabel>출발 날짜:</TransportLabel>
                                    <TransportValue>{transportInfo.date.toLocaleDateString ? transportInfo.date.toLocaleDateString() : transportInfo.date}</TransportValue>
                                </TransportDetail>
                                {transportInfo.goTransport && (
                                    <TransportDetail>
                                        <TransportLabel>가는 교통편:</TransportLabel>
                                        <TransportValue>{parseTransportInfo(transportInfo.goTransport).type} {parseTransportInfo(transportInfo.goTransport).time} ({parseTransportCost(transportInfo.goTransport).toLocaleString()}원)</TransportValue>
                                    </TransportDetail>
                                )}
                                {transportInfo.returnTransport && (
                                    <TransportDetail>
                                        <TransportLabel>오는 교통편:</TransportLabel>
                                        <TransportValue>{parseTransportInfo(transportInfo.returnTransport).type} {parseTransportInfo(transportInfo.returnTransport).time} ({parseTransportCost(transportInfo.returnTransport).toLocaleString()}원)</TransportValue>
                                    </TransportDetail>
                                )}
                            </TransportInfo>
                        )}

                        {/* 예산 입력 UI 추가 */}
                        <TransportInfo>
                            <TransportTitle>💰 예산 입력</TransportTitle>
                            <TransportDetail>
                                <TransportLabel>숙박비:</TransportLabel>
                                <BudgetInput type="number" value={accommodation} onChange={e => setAccommodation(e.target.value)} placeholder="0" />
                            </TransportDetail>
                            <TransportDetail>
                                <TransportLabel>식비:</TransportLabel>
                                <BudgetInput type="number" value={food} onChange={e => setFood(e.target.value)} placeholder="0" />
                            </TransportDetail>
                            <TransportDetail>
                                <TransportLabel>기타:</TransportLabel>
                                <BudgetInput type="number" value={other} onChange={e => setOther(e.target.value)} placeholder="0" />
                            </TransportDetail>
                            <hr />
                            <TransportDetail>
                                <TransportLabel>총 예산:</TransportLabel>
                                <TransportValue>{totalBudget.toLocaleString()} 원</TransportValue>
                            </TransportDetail>
                        </TransportInfo>

                        {/* 여행 날짜 선택 버튼 + 추천 버튼 */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <DateSelector>
                                <NavigationButton onClick={() => moveDate("prev")}>{"<"}</NavigationButton>
                                {getTravelDates().map((date) => (
                                    <DateButton
                                        key={date}
                                        $active={selectedDate === date}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setSelectedPlace(null);
                                        }}
                                    >
                                        {date}
                                    </DateButton>
                                ))}
                                <NavigationButton onClick={() => moveDate("next")}>{">"}</NavigationButton>
                            </DateSelector>
                            <button
                                style={{ marginLeft: 16, padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                                onClick={() => setOpenSearchModal(true)}
                            >
                                여행지 추천
                            </button>
                            <button
                                style={{ marginLeft: 8, padding: "8px 16px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                                onClick={() => setOpenScheduleModal(true)}
                            >
                                스케줄 추천
                            </button>
                        </div>

                        {schedule && selectedDate && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId={selectedDate} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {(schedule.dailyPlan[selectedDate] || []).map((p, idx) => {
                                                const id = `${selectedDate}-${idx}`;
                                                const prevIndex = prevIndexMap[id] ?? idx;
                                                const direction = idx > prevIndex ? "down" : idx < prevIndex ? "up" : "stay";

                                                return (
                                                    <Draggable key={id} draggableId={id} index={idx}>
                                                        {(provided) => (
                                                            <Item
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                initial={{ opacity: 0, y: direction === "down" ? 20 : direction === "up" ? -20 : 0 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                onMouseEnter={() => setSelectedPlace(p)}
                                                                onMouseLeave={() => setSelectedPlace(null)}
                                                            >
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                                    {idx < (schedule.dailyPlan[selectedDate]?.length || 0) - 1 && (
                                                                        <button
                                                                            style={{
                                                                                background: "none",
                                                                                border: "none",
                                                                                cursor: "pointer",
                                                                                color: "#007bff",
                                                                                fontSize: "1.2rem",
                                                                            }}
                                                                            title="다음 장소로 길찾기"
                                                                            onClick={() => {
                                                                                const from = schedule.dailyPlan[selectedDate][idx];
                                                                                const to = schedule.dailyPlan[selectedDate][idx + 1];

                                                                                if (!from || !to) {
                                                                                    alert("출발지 또는 도착지 정보가 부족합니다.");
                                                                                    return;
                                                                                }

                                                                                const url = `https://map.kakao.com/?target=car` +
                                                                                    `&sX=${from.lng}&sY=${from.lat}` +
                                                                                    `&eX=${to.lng}&eY=${to.lat}`;

                                                                                window.open(url, "_blank");
                                                                            }}
                                                                        >
                                                                            <FaArrowDown />
                                                                        </button>
                                                                    )}

                                                                    <div>
                                                                        <span>{p.name}</span>
                                                                        <p style={{ fontSize: "small", color: "gray" }}>{p.category}</p>
                                                                    </div>
                                                                </div>

                                                                <DeleteButton onClick={() => deletePlace(selectedDate, idx)}>
                                                                    삭제
                                                                </DeleteButton>
                                                            </Item>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </>
                )}
                {/* 모달 */}
                <SimpleModal open={openSearchModal} onClose={() => setOpenSearchModal(false)}>
                    <SearchPage
                        defaultDeparture={transportInfo?.departure}
                        defaultArrival={transportInfo?.arrival}
                        onAddPlace={handlePlaceAddedFromModal}
                    />
                </SimpleModal>
                <SimpleModal open={openScheduleModal} onClose={() => setOpenScheduleModal(false)}>
                    <SchedulePage
                        defaultDeparture={transportInfo?.departure}
                        defaultArrival={transportInfo?.arrival}
                        defaultDate={transportInfo?.date ? dayjs(transportInfo.date).format("YYYY-MM-DD") : ""}
                        defaultDays={transportInfo?.days}
                        onScheduleGenerated={handleScheduleRecommendation}
                    />
                </SimpleModal>
            </RightList>
        </PageContainer>
    );
};

export default MySchedulePage;