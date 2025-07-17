import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { fetchSchedules } from '../api/UserApi';

const MyCurrentSchedulesContainer = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #fff;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ScheduleItem = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #f8f9fa;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }

  p {
    font-size: 0.9rem;
    color: #6c757d;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

function MyCurrentSchedulesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mySchedules, setMySchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMySchedules = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError('로그인이 필요합니다.');
      return;
    }
    setIsLoading(true);
    try {
      const schedules = await fetchSchedules(user);
      setMySchedules(schedules.filter(schedule => !schedule.isCopied)); // Only show schedules created by the user
    } catch (err) {
      setError('내 여행 계획을 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching my schedules:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMySchedules();
  }, [loadMySchedules]);

  const handleEditSchedule = (scheduleId) => {
    navigate(`/schedule/${scheduleId}?fromMypage=true`); // Use fromMypage flag to enable editing
  };

  if (isLoading) {
    return <MyCurrentSchedulesContainer><p>내 여행 계획을 불러오는 중입니다...</p></MyCurrentSchedulesContainer>;
  }

  if (error) {
    return <MyCurrentSchedulesContainer><p style={{ color: 'red' }}>{error}</p></MyCurrentSchedulesContainer>;
  }

  return (
    <MyCurrentSchedulesContainer>
      <Title>내 현재 여행 계획</Title>
      {mySchedules.length === 0 ? (
        <p>아직 작성된 여행 계획이 없습니다.</p>
      ) : (
        mySchedules.map((schedule) => (
          <ScheduleItem key={schedule.id}>
            <div onClick={() => navigate(`/schedule/${schedule.id}?fromMypage=true`)} style={{ cursor: 'pointer' }}>
              <h3>{schedule.title || '제목 없음'}</h3>
              <p>날짜: {schedule.startDate} ~ {schedule.endDate}</p>
            </div>
            <ButtonGroup>
              <Button onClick={(e) => { e.stopPropagation(); handleEditSchedule(schedule.id); }}>수정하기</Button>
            </ButtonGroup>
          </ScheduleItem>
        ))
      )}
    </MyCurrentSchedulesContainer>
  );
}

export default MyCurrentSchedulesPage;
