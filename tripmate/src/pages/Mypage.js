import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import api from '../api/index';
import {
  fetchSchedules,
  fetchSharedSchedules,
  fetchUserProfile,
  shareSchedule,
  unshareSchedule,
  fetchSavedSchedules,
} from '../api/UserApi';
import ScheduleEditModal from './ScheduleDetail';

// ... Styled Components 생략 (기존 코드 유지)

// localStorage helpers
const getLocalSavedSchedule = () => {
  try {
    const saved = localStorage.getItem('mySchedule');
    if (saved) return JSON.parse(saved);
    return null;
  } catch {
    return null;
  }
};

const getLocalSavedSchedules = () => {
  try {
    const arr = localStorage.getItem('mySavedSchedules');
    if (arr) return JSON.parse(arr);
    return [];
  } catch {
    return [];
  }
};

function Mypage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'my';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();

  const [localUser, setLocalUser] = useState(null);
  const [mySchedules, setMySchedules] = useState([]);
  const [sharedSchedules, setSharedSchedules] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSavedSchedule, setLocalSavedSchedule] = useState(getLocalSavedSchedule());
  const [localSavedSchedules, setLocalSavedSchedules] = useState(getLocalSavedSchedules());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTargetSchedule, setEditTargetSchedule] = useState(null);

  const fetchAllData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const [schedules, shared, saved] = await Promise.all([
        fetchSchedules(currentUser, paramUserId),
        fetchSharedSchedules(currentUser.userId),
        fetchSavedSchedules(),
      ]);
      setMySchedules(schedules);
      setSharedSchedules(shared);
      setSavedSchedules(saved);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [paramUserId]);

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await fetchUserProfile(paramUserId, user);
      if (profile) {
        const sanitizedProfile = {
          ...profile,
          username: profile.username || '',
          email: profile.email || '',
        };
        setLocalUser(sanitizedProfile);
        setEditUsername(sanitizedProfile.username);
        setEditEmail(sanitizedProfile.email);
        await fetchAllData(sanitizedProfile);
      } else {
        setError('사용자 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [paramUserId, user, fetchAllData]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (activeTab === 'saved') {
      setLocalSavedSchedules(getLocalSavedSchedules());
    }
  }, [activeTab]);

  const isOwner = user && localUser && String(user.userId || user.id) === String(localUser.userId);

  const handleLogout = () => {
    logout();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const handleWithdraw = async () => {
    if (!isOwner) return;
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까?')) {
      try {
        await api.delete('/users/me');
        logout();
        alert('회원 탈퇴가 완료되었습니다.');
        navigate('/');
      } catch (error) {
        alert('회원 탈퇴 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!isOwner) return;
    if (window.confirm('정말로 이 여행 계획을 삭제하시겠습니까?')) {
      try {
        await api.delete(`/schedule/${scheduleId}`);
        setMySchedules(mySchedules.filter(schedule => schedule.id !== scheduleId));
        alert('여행 계획이 삭제되었습니다.');
      } catch (error) {
        alert('여행 계획 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleShare = async (scheduleId) => {
    if (!isOwner) return;
    if (window.confirm('이 여행 계획을 공유하시겠습니까?')) {
      try {
        await shareSchedule(scheduleId);
        alert('공유 완료');
        await fetchAllData(localUser);
      } catch (error) {
        alert(error.message || '공유 실패');
      }
    }
  };

  const handleUnshare = async (scheduleId) => {
    if (!isOwner) return;
    if (window.confirm('이 공유를 취소하시겠습니까?')) {
      try {
        await unshareSchedule(scheduleId);
        alert('공유 취소 완료');
        await fetchAllData(localUser);
      } catch (error) {
        alert(error.message || '공유 취소 실패');
      }
    }
  };

  const handleSaveEditedSchedule = async (editedSchedule) => {
    setEditModalOpen(false);
    await fetchAllData(localUser);
  };

  const handleDeleteSavedSchedule = async (scheduleId, isFromDB = false) => {
    if (!window.confirm('정말로 이 여행 계획을 삭제하시겠습니까?')) return;
    try {
      if (isFromDB) {
        await api.delete(`/schedule/saved/${scheduleId}`);
        setSavedSchedules(prev => prev.filter(s => s.id !== scheduleId));
      } else {
        const key = 'mySavedSchedules';
        const prev = getLocalSavedSchedules();
        const updated = prev.filter(s => String(s.id) !== String(scheduleId));
        localStorage.setItem(key, JSON.stringify(updated));
        setLocalSavedSchedules(updated);
      }
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 이후 JSX 렌더링 부분은 기존 스타일 유지하며 병합된 상태로 구성

  return (
    <MypageContainer>
      {/* 생략: 렌더링 부분은 병합된 스타일로 작성 */}
    </MypageContainer>
  );
}

export default Mypage;