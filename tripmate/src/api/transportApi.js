import api from './index'; // 이게 axios 인스턴스임 (토큰 포함)
const BASE_URL = '/transport'; // api 인스턴스는 baseURL이 이미 포함됨

export const searchTransport = async ({ departure, arrival, date }) => {
  const response = await api.post(`${BASE_URL}/search`, {
    departure,
    arrival,
    date,
  });
  return response.data;
};

export const getSeoulToBusanTransport = async () => {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const response = await api.get(
      `${BASE_URL}/search?departure=서울&arrival=부산&date=${today}`
    );
    return response.data;
  } catch (error) {
    console.error('교통수단 정보 조회 실패:', error);
    throw error;
  }
};

export const getTransportInfo = async (params) => {
  try {
    const response = await api.post(`${BASE_URL}/search`, params);
    return response.data;
  } catch (error) {
    console.error('교통수단 정보 조회 실패:', error);
    throw error;
  }
};

export const getTransportInfoByQuery = async (departure, arrival, date) => {
  try {
    const response = await api.get(`${BASE_URL}/search`, {
      params: {
        departure,
        arrival,
        date,
      },
    });
    return response.data;
  } catch (error) {
    console.error('교통수단 정보 조회 실패:', error);
    throw error;
  }
};
