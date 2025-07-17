import { useState } from "react";
import styled from "styled-components";
import ScheduleForm from "../components/planner/PlaceRecomendForm";
import ScheduleResult from "../components/planner/ScheduleResult";
import { autoGenerateSchedule, fetchRecommendedPlaces, generateMultiSchedule } from "../api/scheduleApi";
import MapComponent from "../components/map/MapComponent";

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  min-height: 600px;
  margin: 0 auto;
  padding: 2rem 2rem 3rem 2rem;
  background: #f9faff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.1rem;
  font-weight: 700;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const AddScheduleButton = styled.button`
  background-color: #4caf50;
  border: none;
  color: white;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #3a9a38;
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  width: 100%;
  justify-content: center;
`;

const FormBox = styled.div`
  flex: 1;
  min-width: 280px;
`;

const MapBox = styled.div`
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  width: 100%;
  height: 350px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ResultBox = styled.div`
  margin-top: 2.5rem;
  width: 100%;
`;

// error prop을 DOM에 넘기지 않도록 isError로 변경
const Message = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== 'isError',
})`
  text-align: center;
  margin-top: 1rem;
  color: ${(props) => (props.isError ? "red" : "#555")};
  font-weight: ${(props) => (props.isError ? "700" : "400")};
`;

const CATEGORY_LIST = ["전체", "관광", "음식점", "카페", "숙박"];

const CategoryButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: ${props => props.active ? '#4caf50' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#333'};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
`;

const ScheduleListBox = styled.div`
  margin-top: 2rem;
  background: #f4f8f6;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ScheduleDateTitle = styled.h3`
  color: #4caf50;
  margin-bottom: 0.7rem;
`;

// 스타일 컴포넌트 추가/수정
const StyledInput = styled.input`
  padding: 0.6rem 0.8rem;
  border: 1.8px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.3s ease;
  &:focus {
    outline: none;
    border-color: #0077ff;
  }
`;

const GreenButton = styled.button`
  width: 100%;
  background: #4caf50;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #3a9a38;
  }
`;

const PlaceItem = styled.li`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 10px;
  border: 2.5px solid ${props => props.selected ? '#4caf50' : 'transparent'};
  background: ${props => props.selected ? '#f6fff7' : 'transparent'};
  cursor: pointer;
  transition: border 0.2s, background 0.2s;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? '#4caf50' : '#fff')};
  color: ${(props) => (props.$active ? 'white' : '#4caf50')};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$active ? '#3a9a38' : '#e9ecef')};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SearchPage = ({ defaultDeparture = "서울", defaultArrival = "부산", onAddPlace, selectedDate }) => {
  const [departure, setDeparture] = useState(defaultDeparture);
  const [arrival, setArrival] = useState(defaultArrival);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPlaces, setSelectedPlaces] = useState([]); // 선택된 장소 id 리스트
  const [lastRecommendParams, setLastRecommendParams] = useState(null); // 마지막 추천 요청 파라미터

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 출발지/도착지는 props로 고정
  // const departure = defaultDeparture;
  // const arrival = defaultArrival;

  // 추천 장소 조회 (API 호출)
  const fetchRecommend = async (params) => {
    setLoading(true);
    setError("");
    setSelectedPlaceId(null);
    setFilteredPlaces([]);
    setCurrentPage(1); // Reset page on new search
    try {
      const recommendRes = await fetchRecommendedPlaces(params.arrival);
      let places = [];
      if (Array.isArray(recommendRes)) {
        places = recommendRes;
      } else if (recommendRes && Array.isArray(recommendRes.places)) {
        places = recommendRes.places;
      }
      setFilteredPlaces(places);
      setLastRecommendParams(params);
      if (places.length > 0) setSelectedPlaceId(places[0].id);
    } catch (err) {
      setError("추천 장소 조회 중 오류가 발생했습니다. " + (err?.message || JSON.stringify(err)));
      console.error("에러 발생:", err);
    } finally {
      setLoading(false);
    }
  };

  // 추천 버튼 클릭 핸들러
  const handleRecommendClick = () => {
    // 이미 같은 조건으로 추천을 받아온 경우, API를 다시 호출하지 않음
    const params = { departure, arrival, date: selectedDate };
    if (
      lastRecommendParams &&
      lastRecommendParams.departure === params.departure &&
      lastRecommendParams.arrival === params.arrival &&
      lastRecommendParams.date === params.date &&
      filteredPlaces.length > 0
    ) {
      // 이미 추천된 리스트를 사용
      return;
    }
    fetchRecommend(params);
  };

  // 출발지/도착지/날짜가 바뀌면 추천 리스트 초기화
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFilteredPlaces([]);
    setLastRecommendParams(null);
    setSelectedPlaces([]);
    setCurrentPage(1); // Reset page on input change
  };

  // 카테고리 변경 시 선택된 장소가 초기화되지 않도록 handleCategoryChange 함수로 분리
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1); // Reset page on category change
    // setSelectedPlaces([]); // 이 줄은 제거하여 선택 유지
  };

  // 체크박스 핸들러
  const handlePlaceCheck = (key, checked) => {
    setSelectedPlaces(prev =>
      checked ? [...prev, key] : prev.filter(id => id !== key)
    );
  };

  const handleAddScheduleClick = () => {
    if (selectedPlaces.length === 0) {
      alert("추가할 장소를 선택하세요!");
      return;
    }
    // 선택된 장소 객체 추출 (카테고리 상관없이 전체에서)
    const placesToAdd = filteredPlaces.filter(p => selectedPlaces.includes(p.name + p.address));
    if (onAddPlace) {
      onAddPlace(placesToAdd);
    }
    setSelectedPlaces([]); // 선택 초기화
  };

  // 카테고리별 필터링 함수 (페이지네이션 미적용)
  const getFilteredByCategory = () => {
    let places = filteredPlaces;
    if (selectedCategory === "관광") {
      places = filteredPlaces.filter(
        (p) =>
          (p.category && p.category.includes("관광")) ||
          p.categoryCode === "AT4"
      );
    } else if (selectedCategory === "음식점") {
      places = filteredPlaces.filter(
        (p) =>
          (p.category && p.category.includes("음식점")) ||
          p.categoryCode === "FD6"
      );
    } else if (selectedCategory === "카페") {
      places = filteredPlaces.filter(
        (p) =>
          (p.category && p.category.includes("카페")) ||
          p.categoryCode === "CE7"
      );
    } else if (selectedCategory === "숙박") {
      places = filteredPlaces.filter(
        (p) =>
          (p.category && p.category.includes("숙박")) ||
          p.categoryCode === "AD5"
      );
    }
    return places;
  };

  const filteredAndCategorizedPlaces = getFilteredByCategory();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlaces = filteredAndCategorizedPlaces.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAndCategorizedPlaces.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <TitleRow>
        <Title>🌏 여행 일정지 추천</Title>
        <AddScheduleButton onClick={handleAddScheduleClick}>
          일정 추가하기
        </AddScheduleButton>
      </TitleRow>
      <TopRow>
        <FormBox>
          {/* 출발지/도착지 인풋 + 선택된 날짜 텍스트 + 추천 버튼 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>출발지:</label>
              <StyledInput type="text" value={departure} onChange={handleInputChange(setDeparture)} placeholder="서울" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>도착지:</label>
              <StyledInput type="text" value={arrival} onChange={handleInputChange(setArrival)} placeholder="부산" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600, marginRight: 8 }}>선택한 날짜:</label>
              <span style={{ fontWeight: 500 }}>{selectedDate}</span>
            </div>
            <GreenButton onClick={handleRecommendClick}>추천</GreenButton>
          </div>
        </FormBox>
        <MapBox>
          <MapComponent
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            setSelectedPlaceId={setSelectedPlaceId}
          />
        </MapBox>
      </TopRow>
      <ResultBox>
        <CategoryButtonRow>
          {CATEGORY_LIST.map((cat) => (
            <CategoryButton
              key={cat}
              active={selectedCategory === cat}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </CategoryButton>
          ))}
        </CategoryButtonRow>
        {loading && <Message>⏳ 추천 장소를 불러오는 중입니다...</Message>}
        {error && <Message isError>{error}</Message>}
        {!loading && !error && filteredAndCategorizedPlaces.length > 0 && (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {currentPlaces.map((place) => {
                const key = place.name + place.address;
                const selected = selectedPlaces.includes(key);
                return (
                  <PlaceItem
                    key={key}
                    selected={selected}
                    onClick={() => handlePlaceCheck(key, !selected)}
                  >
                    {(!place.photoUrl || place.photoUrl.trim() === "") ? (
                      <img src="/icons/tourist.png" alt={place.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, marginRight: 16 }} />
                    ) : (
                      <img src={place.photoUrl} alt={place.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, marginRight: 16 }} onError={e => e.target.src = '/icons/tourist.png'} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{place.name}</div>
                      <div style={{ color: "#666", fontSize: 14 }}>{place.address}</div>
                    </div>
                  </PlaceItem>
                );
              })}
            </ul>
            <PaginationContainer>
              <PageButton onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>이전</PageButton>
              {(() => {
                  const pageNumbers = [];
                  const maxPagesToShow = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                  if (endPage - startPage + 1 < maxPagesToShow) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(
                          <PageButton key={i} onClick={() => paginate(i)} $active={i === currentPage}>
                              {i}
                          </PageButton>
                      );
                  }
                  return pageNumbers;
              })()}
              <PageButton onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>다음</PageButton>
            </PaginationContainer>
          </>
        )}
        {!loading && !error && filteredAndCategorizedPlaces.length === 0 && (
          <Message>추천 장소가 없습니다.</Message>
        )}
      </ResultBox>
    </Container>
  );
};

export default SearchPage;
