
import React, { useState } from 'react';
import SearchBar from '../components/main/SearchBar';
import CityGrid from '../components/main/CityGrid'; 
import Footer from '../components/main/Footer';
import SimpleModal from '../components/Modal/SimpleModal';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ModalContent = styled.div`
  padding: 2rem;
  text-align: center;
`;
const ModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
`;
const ModalText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #555;
`;
const CreateScheduleButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background: #1d4ed8;
  }
`;

function MainPage() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchRegion, setSearchRegion] = useState("");
  const navigate = useNavigate();

  // SearchBar에서 입력값과 버튼 클릭 이벤트를 받음
  const handleSearch = (region) => {
    if (!region) return;
    setSearchRegion(region);
    setSearchModalOpen(true);
  };
  const handleCloseModal = () => {
    setSearchModalOpen(false);
    setSearchRegion("");
  };
  const handleCreateSchedule = () => {
    if (searchRegion) {
      navigate('/startPlanner', { state: { arrival: searchRegion } });
    }
  };
  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <CityGrid />
      <SimpleModal open={searchModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalTitle>{searchRegion}</ModalTitle>
          <ModalText>
            선택하신 '{searchRegion}'(으)로 여행 일정을 만들어 볼까요?
          </ModalText>
          <CreateScheduleButton onClick={handleCreateSchedule}>
            일정 생성하기
          </CreateScheduleButton>
        </ModalContent>
      </SimpleModal>
    </div>
  );
}

export default MainPage;