import api from './index';

// 유저 프로필 조회
export const fetchUserProfile = async (paramUserId, user) => {
    if (paramUserId) {
        const response = await api.get(`/users/${paramUserId}`);
        return response.data;
    }
    if (user) {
        return user;
    }
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
};

// 스케줄 목록 조회
export const fetchSchedules = async (localUser) => {
    if (!localUser) {
        console.warn("localUser 없음, fetchSchedules 중단");
        return [];
    }

    const endpoint = '/schedule/my-schedules';

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("🚫 토큰 없음, 요청 중단");
        return [];
    }

    try {
        const response = await api.get(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(" 응답 데이터:", response.data);

        if (!Array.isArray(response.data)) {
            throw new Error('여행 계획 데이터가 올바르지 않습니다.');
        }

        return response.data;
    } catch (error) {
        console.error("🚨 fetchSchedules 에러:", error);
        throw error;
    }
};

// 여행 계획 일정 공유
export const fetchSharedSchedules = async (userId) => {
    if (!userId) {
        console.warn("userId 없음, fetchSharedSchedules 중단");
        return [];
    }

    const endpoint = `/schedule/shared/my`; // userId가 필요하다면 경로 수정 필요

    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("🚫 토큰 없음, 요청 중단");
        return [];
    }

    try {
        const response = await api.get(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!Array.isArray(response.data)) {
            throw new Error('내가 공유한 여행 계획 데이터가 올바르지 않습니다.');
        }

        return response.data;
    } catch (error) {
        console.error("🚨 fetchSharedSchedules 에러:", error);
        throw error;
    }
};

// 스케줄 공유
export const shareSchedule = async (scheduleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("로그인이 필요합니다.");
    }
    try {
        const response = await api.put(`/schedule/${scheduleId}/share`, { isPublic: true }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("🚨 shareSchedule 에러:", error);
        throw error;
    }
};

// 스케줄 공유 취소
export const unshareSchedule = async (scheduleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("로그인이 필요합니다.");
    }
    try {
        const response = await api.put(`/schedule/${scheduleId}/share`, { isPublic: false }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("🚨 unshareSchedule 에러:", error);
        throw error;
    }
};

// 스케줄 업데이트
export const updateSchedule = async (scheduleId, scheduleData) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("로그인이 필요합니다.");
    }
    try {
        const response = await api.put(`/schedule/${scheduleId}`, scheduleData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data;
    } catch (error) {
        console.error("🚨 updateSchedule 에러:", error);
        throw error;
    }
};

// 스케줄 ID로 조회
export const fetchScheduleById = async (scheduleId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("로그인이 필요합니다.");
    }
    try {
        const response = await api.get(`/schedule/${scheduleId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`🚨 fetchScheduleById 에러 (ID: ${scheduleId}):`, error);
        throw error;
    }
};

// 찜한 일정 목록 조회
export const fetchSavedSchedules = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("🚫 토큰 없음, fetchSavedSchedules 중단");
        return [];
    }

    try {
        const response = await api.get('/schedule/saved/my', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("찜한 일정 응답 데이터:", response.data);

        if (!Array.isArray(response.data)) {
            throw new Error('찜한 일정 데이터가 올바르지 않습니다.');
        }

        return response.data;
    } catch (error) {
        console.error("🚨 fetchSavedSchedules 에러:", error);
        throw error;
    }
};

// --- Review API ---

export const getReviewsBySchedule = async (scheduleId) => {
    try {
        const response = await api.get(`/reviews/schedule/${scheduleId}`);
        return response.data;
    } catch (error) {
        console.error(`🚨 getReviewsBySchedule 에러 (Schedule ID: ${scheduleId}):`, error);
        throw error;
    }
};

export const createReview = async (scheduleId, content) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("로그인이 필요합니다.");
    try {
        const response = await api.post('/reviews', { scheduleId, content }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("🚨 createReview 에러:", error);
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("로그인이 필요합니다.");
    try {
        await api.delete(`/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        console.error(`🚨 deleteReview 에러 (Review ID: ${reviewId}):`, error);
        throw error;
    }
};

