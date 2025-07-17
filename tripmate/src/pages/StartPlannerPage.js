import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import DateRangeModal from "../components/Modal/DateRangeModal";
import TimeSelectModal from "../components/Modal/TimeSelectModal";
import TransportSelectModal from "../components/Modal/TransportSelectModal";
import { getTransportInfo } from "../api/transportApi";
import dayjs from "dayjs";
import SimpleModal from "../components/common/SimpleModal";
import SearchPage from "./SearchPage";
import SchedulePage from "./SchedulePage";
import { autoGenerateSchedule } from "../api/scheduleApi";

// 스타일 정의
const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d3748;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a5568;
  text-align: center;
  margin-bottom: 3rem;
`;

const StartButton = styled.button`

  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: background-color 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const LocationInfo = styled.div`
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.2rem;
      padding: 1rem;
      background-color: #f3f4f6;
      border-radius: 8px;
    `;

const LocationLabel = styled.span`
      font-weight: 600;
      color: #4a5568;
    `;

const LocationValue = styled.span`
      font-weight: 700;
      color: #2563eb;
      margin-left: 0.5rem;
    `;

const ChangeButton = styled.button`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  cursor: pointer;

  &:hover {
    background: #e5e7eb;
  }
`;

const StartPlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 모달 상태
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState({ visible: false, mode: "go" });
  const [openSearchModal, setOpenSearchModal] = useState({ open: false, departure: "서울", arrival: "부산" });
  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  // 선택값
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState(null);
  const [selectedGoTransport, setSelectedGoTransport] = useState(null);
  const [selectedReturnTransport, setSelectedReturnTransport] = useState(null);

  // 단계 상태
  const [currentStep, setCurrentStep] = useState(1);

  // 교통편 데이터 캐시 및 로딩
  const [transportCache, setTransportCache] = useState({});
  const [currentTransportData, setCurrentTransportData] = useState(null);
  const [loadingGo, setLoadingGo] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);

  const [departure, setDeparture] = useState("서울");
  const [arrival, setArrival] = useState("부산");
  const [isEditingDeparture, setIsEditingDeparture] = useState(false);

  // 날짜 선택 완료
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange(dateRange);
    setShowDateModal(false);
    setShowTimeModal(true);
    setCurrentStep(2);
    setTransportCache({});
    setSelectedGoTransport(null);
    setSelectedReturnTransport(null);
  };

  // 시간 선택 완료
  const handleTimeSelect = (times) => {
    setSelectedTimes(times);
    setShowTimeModal(false);
  };

  const fetchAndCacheTransport = async (params, mode) => {
    const key = JSON.stringify(params);
    if (transportCache[key]) {
      setCurrentTransportData(transportCache[key]);
      return transportCache[key];
    }
    if (mode === "go") setLoadingGo(true);
    else setLoadingReturn(true);
    setCurrentTransportData(null);
    const data = await getTransportInfo(params);
    setTransportCache(prev => ({ ...prev, [key]: data }));
    setCurrentTransportData(data);
    if (mode === "go") setLoadingGo(false);
    else setLoadingReturn(false);
    return data;
  };

  const location = useLocation();
  useEffect(()=>{
    if(location.state?.arrival){
      setArrival(location.state.arrival);
    }
  },[location]);

  const openTransportModal = async (mode) => {
    const date = mode === "go" ? selectedDateRange.startDate : selectedDateRange.endDate;
    const time = mode === "go" ? selectedTimes.startDepart : selectedTimes.endDepart;
    // 출발지와 도착지를 상태 값으로 사용
    const dep = mode === "go" ? departure : arrival;
    const arr = mode === "go" ? arrival : departure;

    const params = {
      departure: dep,
      arrival: arr,
      date: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String
        (date.getDate()).padStart(2, "0")}`,
      departureTime: time
    };
    setShowTransportModal({ visible: true, mode });
    await fetchAndCacheTransport(params, mode);
  };

  useEffect(() => {
    if (selectedTimes && currentStep === 2) {
      const showGoModal = async () => {
        await openTransportModal("go");
        setCurrentStep(3);
      };
      showGoModal();
    }
  }, [selectedTimes, currentStep]);

  const handleTransportNext = (goTransport) => {
    setSelectedGoTransport(goTransport);
    setShowTransportModal({ visible: false, mode: "go" });
    setTimeout(() => {
      setShowTransportModal({ visible: true, mode: "return" });
      openTransportModal("return").then(() => setCurrentStep(4));
    }, 0);
  };

  const handleTransportSelect = (returnTransport) => {
    setSelectedReturnTransport(returnTransport);
    setShowTransportModal({ visible: false, mode: "return" });
    navigate("/my-schedule", {
      state: {
        departure: departure,
        arrival: arrival,
        date: selectedDateRange.startDate,
        days: dayjs(selectedDateRange.endDate).diff(dayjs(selectedDateRange.startDate), "day")
          + 1,
        goTransport: selectedGoTransport,
        returnTransport
      }
    });
  };

  const handleBack = () => {
    if (currentStep === 4) {
      setShowTransportModal({ visible: false, mode: "return" });
      setTimeout(() => {
        setShowTransportModal({ visible: true, mode: "go" });
        openTransportModal("go").then(() => setCurrentStep(3));
      }, 0);
    } else if (currentStep === 3) {
      setShowTransportModal({ visible: false, mode: "go" });
      setShowTimeModal(true);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setShowTimeModal(false);
      setShowDateModal(true);
      setCurrentStep(1);
    }
  };

  const handleOpenSearchModal = () => {
    setOpenSearchModal({ open: true, departure: departure, arrival: arrival });
  };

  const handleOpenScheduleModal = () => {
    if (!selectedDateRange?.startDate || !selectedDateRange?.endDate) {
      alert("여행 날짜를 먼저 선택해 주세요");
      return;
    }
    const startDate = selectedDateRange.startDate;
    const endDate = selectedDateRange.endDate;
    const days = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
    const date = dayjs(startDate).format("YYYY-MM-DD");
    setOpenScheduleModal({
      open: true,
      date: date,
      days: days
    });
  };

  return (
    <PageWrapper>
      <Title>여행 계획 시작하기</Title>
      <Description>간단한 몇 단계를 거쳐 최적의 여행 일정을 만들어보세요</Description>

      {/* 도착지가 선택되었을 때만 출발지/도착지 정보 표시 */}
      {arrival && (
        <LocationInfo>
          <LocationLabel>출발지:</LocationLabel>
          {isEditingDeparture ? (
            <>
              <input 
                type="text" 
                value={departure} 
                onChange={(e) => setDeparture(e.target.value)} 
              />
              <ChangeButton onClick={() => setIsEditingDeparture(false)}>저장</ChangeButton>
            </>
          ) : (
            <>
              <LocationValue>{departure}</LocationValue>
              <ChangeButton onClick={() => setIsEditingDeparture(true)}>변경</ChangeButton>
            </>
          )}
          <LocationLabel style={{ marginLeft: '1.5rem' }}>도착지:</LocationLabel>
          <LocationValue>{arrival}</LocationValue>
        </LocationInfo>
      )}

      {/* 도착지가 없으면 버튼 비활성화, 있으면 날짜 선택 버튼 표시 */}
      <StartButton onClick={() => {
        if (!user) {
          navigate("/login");
        } else {
          setShowDateModal(true);
        }
      }} disabled={!arrival}>
        {arrival ? "여행 날짜 선택하기" : "도착지를 먼저 선택해주세요"}
      </StartButton>

      {/* --- 아래는 기존 모달 로직과 동일합니다 --- */}
      {showDateModal && (
        <DateRangeModal onClose={() => setShowDateModal(false)} onSelect={handleDateSelect} />
      )}

      {showTimeModal && selectedDateRange && (
        <TimeSelectModal
          startDate={selectedDateRange.startDate}
          endDate={selectedDateRange.endDate}
          onClose={() => setShowTimeModal(false)}
          onSelect={handleTimeSelect}
        />
      )}

      {showTransportModal.visible && selectedTimes && selectedDateRange && (
        <TransportSelectModal
          date={
            showTransportModal.mode === "go"
              ? selectedDateRange.startDate
              : selectedDateRange.endDate
          }
          time={
            showTransportModal.mode === "go"
              ? selectedTimes.startDepart
              : selectedTimes.endDepart
          }
          mode={showTransportModal.mode}
          onSelect={handleTransportSelect}
          onNext={showTransportModal.mode === "go" ? handleTransportNext : undefined}
          onBack={currentStep === 4 ? handleBack : undefined}
          onClose={() => setShowTransportModal({
            visible: false, mode: showTransportModal.mode
          })}
          transportData={currentTransportData}
          loading={showTransportModal.mode === "go" ? loadingGo : loadingReturn}
        />
      )}

      <SimpleModal open={openSearchModal.open} onClose={() => setOpenSearchModal({
        ...openSearchModal, open: false
      })}>
        <SearchPage defaultDeparture={openSearchModal.departure}
          defaultArrival={openSearchModal.arrival} />
      </SimpleModal>

      <SimpleModal open={openScheduleModal.open} onClose={() => setOpenScheduleModal({
        ...openScheduleModal, open: false
      })}>
        <SchedulePage
          defaultDeparture={selectedGoTransport?.departure || currentTransportData?.departure
            || "서울"}
          defaultArrival={selectedGoTransport?.arrival || currentTransportData?.arrival ||
            "부산"}
          defaultDate={openScheduleModal.date}
          defaultDays={openScheduleModal.days}
        />
      </SimpleModal>
    </PageWrapper>
  );
}
export default StartPlannerPage;
