import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 1rem;
`;

const DateTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.active ? "#4a90e2" : "#eee")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const CardList = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 8px;
`;

const Card = styled.div`
  flex: 0 0 250px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const PlaceImage = styled.img`
  width: 100%;
  height: 140px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 0.75rem;
  background: #eee;
`;

const PlaceName = styled.strong`
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  color: #222;
`;

const Category = styled.span`
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const Address = styled.p`
  font-size: 0.85rem;
  color: #555;
  margin-top: auto;
`;

const NoData = styled.li`
  color: #999;
  font-style: italic;
  padding: 1rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? "#4a90e2" : "#fff")};
  color: ${(props) => (props.$active ? "white" : "#4a90e2")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$active ? "#3a7bc4" : "#e9ecef")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const MultiDayScheduleResult = ({ schedule, selectedDate, setSelectedDate, onPlaceClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const places = schedule.dailyPlan[selectedDate] || [];

  // Reset currentPage when selectedDate changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  // Get current places for pagination
  const indexOfLastPlace = currentPage * itemsPerPage;
  const indexOfFirstPlace = indexOfLastPlace - itemsPerPage;
  const currentPlacesForPage = places.slice(indexOfFirstPlace, indexOfLastPlace);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(places.length / itemsPerPage);

  return (
    <Container>
      <DateTabs>
        {Object.keys(schedule.dailyPlan).map((date) => (
          <TabButton
            key={date}
            active={date === selectedDate}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </TabButton>
        ))}
      </DateTabs>

      {places.length > 0 ? (
        <>
          <CardList>
            {currentPlacesForPage.map((place) => (
              <Card 
                key={place.name} 
                onClick={() => onPlaceClick(place)}  // 클릭 시 부모에 알림
                style={{ cursor: "pointer" }}
              >
                <PlaceImage
                  src={place.photoUrl || "https://via.placeholder.com/250x140?text=No+Image"}
                  alt={place.name}
                  onError={e => e.target.src = '/icons/tourist.png'}
                />
                <PlaceName>{place.name}</PlaceName>
                <Category>{place.category}</Category>
                <Address>주소: {place.address}</Address>
              </Card>
            ))}
          </CardList>
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
      ) : (
        <ul>
          <NoData>추천 일정이 없습니다.</NoData>
        </ul>
      )}
    </Container>
  );
};

export default MultiDayScheduleResult;
