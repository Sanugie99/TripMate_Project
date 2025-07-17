import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // Added useParams
import MapComponent from "../components/map/ScheduleMapComponent";
import PlaceSearchBar from "../components/schedule/PlaceSearchBar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaArrowDown } from "react-icons/fa";
import dayjs from "dayjs";
import SimpleModal from "../components/Modal/SimpleModal";
import SearchPage from "./SearchPage";
import SchedulePage from "./SchedulePage";
import { saveSchedule, updateSchedule } from "../api/scheduleApi"; // Import updateSchedule
import { fetchScheduleById } from "../api/UserApi"; // Import fetchScheduleById
import { v4 as uuidv4 } from 'uuid'; // uuid 추가

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
  height: 100%; // 추가: 높이 100%로
  min-height: 400px;
  display: flex;
  flex-direction: column;
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
    const { scheduleId } = useParams(); // Destructure scheduleId
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


    // handlePlaceAddedFromModal을 여러 장소 추가로 수정
    const handlePlaceAddedFromModal = (places) => {
        if (!Array.isArray(places) || places.length === 0) return;
        if (!selectedDate) return;
        setSchedule((prev) => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated.dailyPlan = { ...updated.dailyPlan };
            updated.dailyPlan[selectedDate] = [
                ...(updated.dailyPlan[selectedDate] || []),
                ...places.map(p => ({
                    ...p,
                    id: p.id || uuidv4(), // id가 없으면 uuid 부여
                }))
            ];
            return updated;
        });
        setOpenSearchModal(false); // 모달 닫기
    };

    // 스케줄 추천 모달에서 받은 데이터를 처리하는 함수
    const handleScheduleRecommendation = (recommendedSchedule) => {
        if (!schedule || !recommendedSchedule || !recommendedSchedule.dailyPlan) {
            console.error("추천된 스케줄 데이터가 올바르지 않습니다.");
            setOpenScheduleModal(false);
            return;
        }

        // 기존 dailyPlan 복사
        const mergedDailyPlan = { ...schedule.dailyPlan };

        // 추천 일정의 각 날짜별로 place를 합침
        Object.entries(recommendedSchedule.dailyPlan).forEach(([date, places]) => {
            if (!mergedDailyPlan[date]) {
                // 기존에 없는 날짜면 새로 추가
                mergedDailyPlan[date] = [];
            }
            // id 보장해서 추가
            mergedDailyPlan[date] = [
                ...mergedDailyPlan[date],
                ...places.map(p => ({
                    ...p,
                    id: p.id || uuidv4(),
                }))
            ];
        });

        const updatedSchedule = {
            ...schedule,
            dailyPlan: mergedDailyPlan,
            places: Object.values(mergedDailyPlan).flat(),
        };

        setSchedule(updatedSchedule);
        localStorage.setItem("mySchedule", JSON.stringify(updatedSchedule));
        setOpenScheduleModal(false);
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
        const loadSchedule = async () => {
            console.log("MySchedulePage: useEffect triggered.");
            console.log("MySchedulePage: Current scheduleId from useParams:", scheduleId);

            // 상태 초기화
            setSchedule(null);
            setTransportInfo(null);
            setSelectedDate(null);
            setAccommodation(0);
            setFood(0);
            setOther(0);
            setTotalBudget(0);
            setHasCreatedSchedule(false);

            if (scheduleId) {
                console.log(`MySchedulePage: Attempting to fetch schedule with ID: ${scheduleId}`);
                try {
                    const fetchedSchedule = await fetchScheduleById(scheduleId);
                    console.log("MySchedulePage: Fetched schedule by ID successfully:", fetchedSchedule);

                    // 백엔드에서 받은 places 리스트를 dailyPlan 객체로 변환
                    const dailyPlan = {};
                    const start = dayjs(fetchedSchedule.startDate);
                    const end = dayjs(fetchedSchedule.endDate);
                    const days = end.diff(start, 'day') + 1;

                    // 먼저 모든 날짜에 대해 ��� 배열로 초기화
                    for (let i = 0; i < days; i++) {
                        const dateKey = start.add(i, "day").format("YYYY-MM-DD");
                        dailyPlan[dateKey] = [];
                    }

                    // fetchedSchedule.places를 순회하며 dailyPlan에 추가
                    if (fetchedSchedule.places && fetchedSchedule.places.length > 0) {
                        fetchedSchedule.places.forEach(place => {
                            const dateKey = place.date; // PlaceDTO에 date 필드가 있다고 가정
                            if (dailyPlan[dateKey]) {
                                dailyPlan[dateKey].push({ ...place, id: place.id || uuidv4() });
                            }
                        });
                    }
                    
                    fetchedSchedule.dailyPlan = dailyPlan;

                    setSchedule(fetchedSchedule);
                    localStorage.setItem("mySchedule", JSON.stringify(fetchedSchedule));
                    
                    setTransportInfo({
                        departure: fetchedSchedule.departure,
                        arrival: fetchedSchedule.arrival,
                        date: fetchedSchedule.startDate,
                        days: days,
                        goTransport: fetchedSchedule.goTransport,
                        returnTransport: fetchedSchedule.returnTransport,
                    });

                    setAccommodation(fetchedSchedule.accommodation || 0);
                    setFood(fetchedSchedule.food || 0);
                    setOther(fetchedSchedule.other || 0);
                    setHasCreatedSchedule(true);
                    
                    const dates = Object.keys(fetchedSchedule.dailyPlan);
                    if (dates.length > 0) setSelectedDate(dates[0]);
                    
                    console.log("MySchedulePage: State updated with fetched and processed schedule.");

                } catch (error) {
                    console.error("MySchedulePage: Failed to fetch schedule by ID:", error);
                    alert("일정을 불러오는 데 실패했습니다.");
                    navigate("/mypage"); // 에러 발생 시 마이페이지로 이동
                }
            } else if (location.state) {
                // Case 2: location.state is present (new schedule from StartPlannerPage)
                console.log("MySchedulePage: Processing new schedule from location.state:", location.state);
                setTransportInfo(location.state);
                if (location.state.goTransport || location.state.returnTransport || location.state.days > 0) {
                    setHasCreatedSchedule(true);
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

                newScheduleData.places = Object.values(newScheduleData.dailyPlan).flat();

                setSchedule(newScheduleData);
                localStorage.setItem("mySchedule", JSON.stringify(newScheduleData));
                setSelectedDate(Object.keys(newScheduleData.dailyPlan)[0]);
                console.log("MySchedulePage: State updated with new schedule data.");

            } else {
                // Case 3: No scheduleId and no location.state (direct access to /my-schedule)
                console.log("MySchedulePage: No scheduleId or location.state. Checking local storage.");
                const saved = localStorage.getItem("mySchedule");
                if (saved) {
                    let parsed = JSON.parse(saved);
                    console.log("MySchedulePage: Found data in local storage:", parsed);
                    if (parsed.dailyPlan) {
                        Object.keys(parsed.dailyPlan).forEach(date => {
                            parsed.dailyPlan[date] = parsed.dailyPlan[date].map(p => ({
                                ...p,
                                id: p.id || uuidv4(),
                            }));
                        });
                    }
                    if (!parsed.places) {
                        parsed.places = Object.values(parsed.dailyPlan).flat();
                    }

                    setSchedule(parsed);
                    const dates = Object.keys(parsed.dailyPlan);
                    if (dates.length > 0) setSelectedDate(dates[0]);
                    if (parsed.goTransport || parsed.returnTransport || (parsed.dailyPlan && Object.keys(parsed.dailyPlan).length > 0)) {
                        setHasCreatedSchedule(true);
                    }
                    console.log("MySchedulePage: State updated with local storage data.");
                } else {
                    console.log("MySchedulePage: No data in local storage. Starting fresh.");
                }
            }
        };
        loadSchedule();
    }, [scheduleId, location.state, navigate]);

    // 모든 place에 고유 id가 없으면 uuid를 자동 부여
    useEffect(() => {
        if (!schedule || !schedule.dailyPlan) return;
        let changed = false;
        const newDailyPlan = {};
        Object.entries(schedule.dailyPlan).forEach(([date, places]) => {
            newDailyPlan[date] = places.map(p => {
                if (!p) { // If p is null or undefined, return a default valid object or filter it out
                    changed = true;
                    console.warn(`Found null/undefined place in dailyPlan for date ${date}. Filtering it out.`);
                    return null; // Filter out invalid entries
                }
                if (!p.id) {
                    changed = true;
                    return { ...p, id: uuidv4() };
                }
                return p;
            }).filter(Boolean); // Filter out any null entries
        });
        if (changed) {
            const updated = { ...schedule, dailyPlan: newDailyPlan };
            setSchedule(updated);
            localStorage.setItem("mySchedule", JSON.stringify(updated));
        }
    }, [schedule]);

    const addCustomPlace = (place) => {
        if (!selectedDate || !place) return;

        // 기본 구조 예시 (place에 name, category, lat, lng 필드가 있어야 함)
        const newPlace = {
            id: place.id || uuidv4(), // uuid 부여
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

    const selectedDateRef = useRef(selectedDate);
    useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        if (source.index === destination.index) return;
        const dateKey = selectedDateRef.current;
        setSchedule(prev => {
            const items = Array.from(prev.dailyPlan[dateKey]);
            const [moved] = items.splice(source.index, 1);
            items.splice(destination.index, 0, moved);
            const updated = {
                ...prev,
                dailyPlan: {
                    ...prev.dailyPlan,
                    [dateKey]: items,
                },
            };
            localStorage.setItem("mySchedule", JSON.stringify(updated));
            return updated;
        });
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
            let saved;
            if (schedule.id) { // If schedule has an ID, it's an existing schedule
                saved = await updateSchedule(schedule.id, fullSchedule);
                alert("일정이 성공적으로 업데이트되었습니다.");
            } else { // Otherwise, it's a new schedule
                saved = await saveSchedule(fullSchedule);
                alert("일정이 성공적으로 저장되었습니다.");
            }
            navigate(`/schedule/${saved.id}`);
        } catch (e) {
            console.error("일정 저장/업데이트 실패:", e);
            alert("일정 저장/업데이트에 실패했습니다.");
        }
    };

    // 한 칸씩 올리기/내리기 함수 추가
    const movePlace = (from, to) => {
        if (!schedule || !selectedDate) return;
        const items = Array.from(schedule.dailyPlan[selectedDate]);
        if (to < 0 || to >= items.length) return;
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        const updated = {
            ...schedule,
            dailyPlan: {
                ...schedule.dailyPlan,
                [selectedDate]: items,
            },
        };
        setSchedule(updated);
        localStorage.setItem("mySchedule", JSON.stringify(updated));
    };
    return (
        <PageContainer>
            <LeftMap>
                <PlaceSearchBar onPlaceSelect={addCustomPlace} />

                <div style={{ width: '100%', height: '100%', flex: 1 }}>
                  
                  <MapComponent
                      dailyPlan={schedule?.dailyPlan || {}}
                      selectedDate={selectedDate}
                      selectedPlace={selectedPlace}
                      onCloseInfo={() => setSelectedPlace(null)}
                  />
                </div>
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
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <button
                                    style={{ marginLeft: 0, padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
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
                                <CreateScheduleButton
                                    style={{ marginLeft: 8, padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
                                    onClick={handleSaveSchedule}
                                >
                                    ✨ 일정 저장하고 상세 보기
                                </CreateScheduleButton>
                            </div>
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

                        {/* 여행 날짜 선택 바만 표시 (버튼 없음) */}
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
                        </div>

                        {schedule && selectedDate && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId={selectedDate}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={{ minHeight: 40, position: 'relative' }}
                                        >
                                            {(schedule.dailyPlan[selectedDate] || []).map((p, idx) => {
                                                // Ensure p is a valid object and has an id
                                                if (!p) {
                                                    console.warn(`Skipping null/undefined place object at index ${idx} for date ${selectedDate}.`);
                                                    return null; // Skip rendering this item
                                                }
                                                // Ensure dragId is always a unique string
                                                const dragId = p.id ? String(p.id) : uuidv4();
                                                if (!p.id) {
                                                    console.warn(`Place object at index ${idx} for date ${selectedDate} had no ID. Assigning temporary UUID for rendering: ${dragId}`, p);
                                                }
                                                return (
                                                    <Draggable key={dragId} draggableId={dragId} index={idx}>
                                                        {(provided) => (
                                                            <Item
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
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
                        selectedDate={selectedDate}
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