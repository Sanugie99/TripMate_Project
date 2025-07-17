import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate,useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { updateSchedule, getReviewsBySchedule, createReview, deleteReview } from '../api/UserApi'; // 리뷰 API 추가
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { FaThumbsUp, FaThumbsDown, FaShareSquare } from 'react-icons/fa';
import ScheduleMapComponent from '../components/map/ScheduleMapComponent';
import PlaceSearchBar from '../components/schedule/PlaceSearchBar';
import { Button } from '../components/common/StyledComponents';
import ReviewSection from '../components/review/ReviewSection'; // 리뷰 컴포넌트 import

// --- Styled Components (기존과 동일) ---
const Container = styled.div`
  display: flex;
  height: 90vh;
  padding: 1rem;
  gap: 1rem;
`;

const LeftSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MapWrapper = styled.div`
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const RightSide = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DetailSection = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
`;

const Title = styled.h1`
  margin-top: 0;
`;

const PlaceItem = styled.div`
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  &:last-child {
    border-bottom: none;
  }
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
  }
`;

const PlaceListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 0.5rem;
`;

const DayTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #eee;
`;

const DayTab = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: ${props => (props.$active ? '#007bff' : '#666')};
  border-bottom: ${props => (props.$active ? '2px solid #007bff' : '2px solid transparent')};
  margin-bottom: -2px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SmallButton = styled(Button)`
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  min-width: 100px;
  width: 60px;
`;


// --- Edit Modal Component ---
function getDates(startDate, endDate) {
  const dates = [];
  let currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);
  while (currentDate.isBefore(lastDate) || currentDate.isSame(lastDate)) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate = currentDate.add(1, 'day');
  }
  return dates;
}

function ScheduleEditModal({ schedule, onClose, onSave }) {
  const [editableSchedule, setEditableSchedule] = useState(() => {
    const places = schedule.places || [];
    let minDateStr = schedule.startDate;
    let maxDateStr = schedule.endDate;

    if (places.length > 0) {
      const validDates = places.map(p => dayjs(p.date)).filter(d => d.isValid());
      if (validDates.length > 0) {
        const minDate = validDates.reduce((min, p) => p.isBefore(min) ? p : min, validDates[0]);
        const maxDate = validDates.reduce((max, p) => p.isAfter(max) ? p : max, validDates[0]);
        minDateStr = minDate.format('YYYY-MM-DD');
        maxDateStr = maxDate.format('YYYY-MM-DD');
      }
    }

    const sanitizedPlaces = places.map(place => ({
      ...place,
      id: place.id || uuidv4(),
    }));

    return {
      ...schedule,
      startDate: dayjs(minDateStr).isValid() ? minDateStr : dayjs().format('YYYY-MM-DD'),
      endDate: dayjs(maxDateStr).isValid() ? maxDateStr : minDateStr,
      places: sanitizedPlaces
    };
  });

  const tripDates = useMemo(() => {
    return getDates(editableSchedule.startDate, editableSchedule.endDate);
  }, [editableSchedule.startDate, editableSchedule.endDate]);

  const [selectedDate, setSelectedDate] = useState(tripDates[0]);

  useEffect(() => {
    if (tripDates.length > 0 && !tripDates.includes(selectedDate)) {
      setSelectedDate(tripDates[0]);
    } else if (tripDates.length === 0) {
      setSelectedDate(null);
    }
  }, [tripDates, selectedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceAdd = (place) => {
    const newPlace = { ...place, id: uuidv4(), date: selectedDate };
    const currentPlaces = editableSchedule.places || [];
    if (currentPlaces.find(p => p.name === newPlace.name && p.address === newPlace.address && p.date === newPlace.date)) {
      alert("이미 해당 날짜에 추가된 장소입니다.");
      return;
    }
    setEditableSchedule(prev => ({ ...prev, places: [...currentPlaces, newPlace] }));
  };

  const removePlace = (placeToRemove) => {
    const newPlaces = editableSchedule.places.filter(p => p.id !== placeToRemove.id);
    setEditableSchedule(prev => ({ ...prev, places: newPlaces }));
  };

  const handleSave = async () => {
    try {
      await onSave(editableSchedule);
      onClose();
    } catch (error) {
      alert('저장에 실패했습니다: ' + error.message);
      console.error('Save failed:', error);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const date = source.droppableId;
    const placesForDate = editableSchedule.places.filter(p => p.date === date);
    const otherPlaces = editableSchedule.places.filter(p => p.date !== date);

    const [movedPlace] = placesForDate.splice(source.index, 1);
    placesForDate.splice(destination.index, 0, movedPlace);

    const newPlaces = [...otherPlaces, ...placesForDate];
    setEditableSchedule(prev => ({ ...prev, places: newPlaces }));
  };

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>일정 수정</h2>
        <FormGroup>
          <label>제목</label>
          <input name="title" value={editableSchedule.title || ''} onChange={handleChange} />
        </FormGroup>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <FormGroup style={{ flex: 1 }}>
            <label>여행 시작일</label>
            <input name="startDate" type="date" value={editableSchedule.startDate || ''} onChange={handleChange} />
          </FormGroup>
          <FormGroup style={{ flex: 1 }}>
            <label>여행 종료일</label>
            <input name="endDate" type="date" value={editableSchedule.endDate || ''} onChange={handleChange} />
          </FormGroup>
        </div>
        <hr style={{ margin: '1rem 0' }} />
        <h3>장소 관리</h3>
        <DayTabs>
          {tripDates.map((date, index) => (
            <DayTab key={date} $active={selectedDate === date} onClick={() => setSelectedDate(date)}>
              Day {index + 1}
            </DayTab>
          ))}
        </DayTabs>
        <PlaceSearchBar onPlaceSelect={handlePlaceAdd} />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={selectedDate}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ marginTop: '1rem', minHeight: '50px' }}
              >
                {(editableSchedule.places || []).filter(p => p.date === selectedDate).map((place, index) => (
                  <Draggable key={place.id} draggableId={place.id} index={index}>
                    {(provided) => (
                      <PlaceListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <span>{place.name} ({place.address})</span>
                        <Button onClick={() => removePlace(place)} style={{ backgroundColor: '#ff6b6b' }}>삭제</Button>
                      </PlaceListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button onClick={onClose} style={{ backgroundColor: '#6c757d' }}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </ModalContent>
    </ModalBackground>
  );
}

function saveScheduleToLocal(schedule) {
  if (!schedule || !schedule.id) return;
  try {
    const key = 'mySavedSchedules';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    if (prev.find(s => String(s.id) === String(schedule.id))) {
      alert('이미 저장된 여행 계획입니다.');
      return;
    }
    localStorage.setItem(key, JSON.stringify([...prev, schedule]));
    alert('여행 계획이 내 여행계획에 저장되었습니다!');
  } catch {
    alert('저장 중 오류가 발생했습니다.');
  }
}

// --- Main Detail Component ---
function ScheduleDetailFull() {
  const { id } = useParams();
  const location = useLocation();
  const fromMypage = new URLSearchParams(location.search).get('fromMypage') === 'true';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(null);

  // fromMypage일 때 localStorage에서 우선 불러오기
  useEffect(() => {
    if (fromMypage) {
      const savedArr = JSON.parse(localStorage.getItem('mySavedSchedules') || '[]');
      const found = savedArr.find(s => String(s.id) === String(id));
      if (found) {
        setSchedule(found);
        setError(null);
        setLoading(false);
        // 날짜 탭 세팅
        const dailyPlanForMap = (found.places || []).reduce((acc, place) => {
          const date = place.date || found.startDate;
          if (!acc[date]) acc[date] = [];
          acc[date].push(place);
          return acc;
        }, {});
        const initialTripDates = Object.keys(dailyPlanForMap).sort();
        if (initialTripDates.length > 0) {
          setSelectedDay(initialTripDates[0]);
        }
        console.log('상세페이지 schedule (localStorage):', found);
        return;
      }
    }
    // 없으면 서버에서 불러오기
    fetchSchedule();
    // eslint-disable-next-line
  }, [id, fromMypage]);


  const setSanitizedSchedule = (rawData) => {
    const sanitized = {
      ...rawData,
      isCopied: rawData.isCopied ?? rawData.copied,
      startDate: rawData.startDate || dayjs().format('YYYY-MM-DD'),
      endDate: rawData.endDate || rawData.startDate || dayjs().format('YYYY-MM-DD'),
      places: rawData.places || [],
      likes: rawData.likes || 0,
      dislikes: rawData.dislikes || 0,
      shared: rawData.shared || 0,
    };
    setSchedule(sanitized);

    const dailyPlanForMap = (sanitized.places || []).reduce((acc, place) => {
      const date = place.date || sanitized.startDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(place);
      return acc;
    }, {});
    const initialTripDates = Object.keys(dailyPlanForMap).sort();
    if (initialTripDates.length > 0) {
      setSelectedDay(initialTripDates[0]);
    }
  };

  const fetchFromServer = useCallback(async () => {
    try {
      setLoading(true);
      // 캐시 우회를 위해 쿼리스트링 추가
      const res = await api.get(`/schedule/${id}?t=${Date.now()}`);
      const rawData = res.data;
      const sanitizedSchedule = {
        ...rawData,
        isCopied: rawData.isCopied ?? rawData.copied,
        startDate: rawData.startDate || dayjs().format('YYYY-MM-DD'),
        endDate: rawData.endDate || rawData.startDate || dayjs().format('YYYY-MM-DD'),
        places: rawData.places || [],
        likes: rawData.likes || 0,
        dislikes: rawData.dislikes || 0,
        shared: rawData.shared || 0,
      };
      setSchedule(sanitizedSchedule);
      setError(null);

      const dailyPlanForMap = (sanitizedSchedule.places || []).reduce((acc, place) => {
        const date = place.date || sanitizedSchedule.startDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(place);
        return acc;
      }, {});
      const initialTripDates = Object.keys(dailyPlanForMap).sort();
      if (initialTripDates.length > 0) {
        setSelectedDay(initialTripDates[0]);
      }
      console.log('상세페이지 schedule (fetch):', sanitizedSchedule);
    } catch (err) {
      setError('스케줄 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdateSchedule = async (dataToSave) => {
    try {
      // places와 dailyPlan 동기화

      let places = dataToSave.places;
      let dailyPlan = {};
      if (places && Array.isArray(places)) {
        places.forEach(place => {
          const date = place.date || dataToSave.startDate;
          if (!dailyPlan[date]) dailyPlan[date] = [];
          dailyPlan[date].push(place);
        });
      }

      const scheduleToSave = {
        ...dataToSave,
        places,
        dailyPlan,
      };
      console.log('PUT /schedule/', id, '보내는 데이터:', scheduleToSave);
      const resp = await updateSchedule(id, scheduleToSave);
      console.log('서버 응답:', resp);
      fetchSchedule(); // 서버에서 최신 데이터 받아오기
    } catch (error) {
      alert('스케줄 업데이트에 실패했습니다.');
    }
  };

  const handleCopySchedule = async () => {
    try {
      // DB에 찜한 일정으로 저장 (copySchedule API 호출)
      await api.post(`/schedule/copy/${schedule.id}`);
      alert('성공적으로 찜한 여행 일정에 추가되었습니다!');
      if (window.confirm('내가 찜한 여행계획으로 이동하시겠습니까?')) {
        navigate(`/user/${user?.userId}?tab=saved`);
      }
    } catch (error) {
      // 서버에서 중복 에러 메시지 반환 시
      if (error.response && error.response.status === 500) {
        alert('이미 찜한 여행 일정입니다!');
      } else {
        alert('찜하기에 실패했습니다.');
      }
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/schedule/${id}/like`);
      setSchedule(prev => ({ ...prev, likes: res.data.likes, dislikes: res.data.dislikes }));
    } catch (err) {
      fetchFromServer();
    }
  };

  const handleDislike = async () => {
    try {
      const res = await api.post(`/schedule/${id}/dislike`);
      setSchedule(prev => ({ ...prev, likes: res.data.likes, dislikes: res.data.dislikes }));
      alert("싫어요!");
    } catch (err) {
      alert("싫어요 처리에 실패했습니다.");
      fetchFromServer();
    }
  };

  const isOwner = user && schedule && schedule.userId === user.userId;

  // 저장된 일정 수정 핸들러 (fromMypage)
  const handleSaveEditedSchedule = async (editedSchedule) => {
    try {
      // places와 dailyPlan 동기화
      let places = editedSchedule.places;
      if (!places || !Array.isArray(places)) {
        places = [];
      }
      // ScheduleCreateRequest에 맞는 필드만 추출
      const payload = {
        departure: editedSchedule.departure,
        arrival: editedSchedule.arrival,
        date: editedSchedule.startDate || editedSchedule.date,
        days: editedSchedule.days || 1,
        transportType: editedSchedule.transportType || editedSchedule.goTransport?.split("|")[0] || "korail",
        startTime: editedSchedule.startTime,
        endTime: editedSchedule.endTime,
        places: places,
      };
      // 실제로 어떤 값이 들어가는지 로그 출력
      console.log('내 일정 저장 payload:', payload);
      const response = await api.post('/schedule', payload);
      console.log('내 일정 저장 성공:', response.data);
      setEditModalOpen(false);
      alert('내 일정에 저장되었습니다!');
      if (window.confirm('마이페이지로 이동하시겠습니까?')) {
        navigate(`/user/${user?.userId}?tab=my`);
      }
    } catch (error) {
      console.error('내 일정 저장 실패:', error);
      alert('내 일정 저장에 실패했습니다.');
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!schedule) return <p>스케줄을 찾을 수 없습니다.</p>;
  console.log('상세페이지 schedule (렌더링 직전):', schedule);

  const dailyPlanForMap = (schedule.places || []).reduce((acc, place) => {
    const date = place.date || schedule.startDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(place);
    return acc;
  }, {});

  const tripDates = Object.keys(dailyPlanForMap).sort();

  return (
    <>
      <Container>
        <LeftSide>
          <MapWrapper>
            <ScheduleMapComponent
              dailyPlan={dailyPlanForMap}
              selectedDate={selectedDay}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              onCloseInfo={() => setSelectedPlace(null)}
            />
          </MapWrapper>
        </LeftSide>

        <RightSide>
          <DetailSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title>{schedule.title || '제목 없음'}</Title>
            </div>
            <p><strong>작성자:</strong> {schedule.username || '알 수 없음'}</p>
            <p><strong>기간:</strong> {schedule.startDate} ~ {schedule.endDate}</p>
            
            <ActionButtons>
              <ActionButton onClick={handleLike}><FaThumbsUp /> {schedule.likes}</ActionButton>
              <ActionButton onClick={handleDislike}><FaThumbsDown /> {schedule.dislikes}</ActionButton>
              <ActionButton><FaShareSquare /> {schedule.shared}</ActionButton>
            </ActionButtons>

            <div style={{marginTop: '1rem'}}>
              {/* 직접 작성한 내 일정(작성자=본인)만 파란 수정 버튼 */}
              {isOwner && !fromMypage && (
                <Button onClick={() => setIsModalOpen(true)}>수정하기</Button>
              )}
              {/* 공유/찜한 일정 상세에서만: 기존 로컬 방식 버튼만 노출 */}
              {user && fromMypage && (
                <>
                  <Button onClick={() => setEditModalOpen(true)} style={{ marginLeft: '0.5rem', background: '#2563eb', color: 'white' }}>수정하기</Button>
                  {schedule.isCopied && (
                    <Button onClick={() => handleSaveEditedSchedule(schedule)} style={{ marginLeft: '0.5rem', background: '#10b981', color: 'white' }}>내 일정에 바로 저장하기</Button>
                  )}
                </>
              )}
              {user && !fromMypage && isOwner && (
                <Button onClick={() => setIsModalOpen(true)}>수정하기</Button>
              )}
              {/* 공유 여행지에서 찜하기 버튼 */}
              {!isOwner && user && !fromMypage && (
                <SmallButton onClick={handleCopySchedule} style={{ marginLeft: '0.5rem' }}>찜하기</SmallButton>
              )}
            </div>
          </DetailSection>

          <DayTabs>
            {tripDates.map((date, index) => (
              <DayTab key={date} $active={selectedDay === date} onClick={() => setSelectedDay(date)}>
                Day {index + 1} ({date})
              </DayTab>
            ))}
          </DayTabs>

          {selectedDay && (
            <DetailSection>
              <h3>Day {tripDates.indexOf(selectedDay) + 1} ({selectedDay})</h3>
              {(dailyPlanForMap[selectedDay] && dailyPlanForMap[selectedDay].length > 0) ? (
                dailyPlanForMap[selectedDay].map((place, pIndex) => (
                  <PlaceItem key={pIndex}>
                    <strong>{pIndex + 1}. {place.name}</strong>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0 0 0' }}>{place.address}</p>
                  </PlaceItem>
                ))
              ) : (
                <p>등록된 장소가 없습니다.</p>
              )}
            </DetailSection>
          )}
          
          {/* 리뷰 섹션 추가 */}
          <ReviewSection 
            reviews={reviews}
            scheduleId={id}
            onCreateReview={handleCreateReview}
            onDeleteReview={handleDeleteReview}
          />

        </RightSide>
      </Container>

      {editModalOpen && (
        <ScheduleEditModal
          schedule={schedule}
          onClose={() => setEditModalOpen(false)}
          onSave={fromMypage ? handleSaveEditedSchedule : handleUpdateSchedule}
        />
      )}
      {editModalOpen && fromMypage && (
        <ScheduleEditModal
          schedule={schedule}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEditedSchedule}
        />
      )}
    </>
  );
}

export default ScheduleDetailFull;
