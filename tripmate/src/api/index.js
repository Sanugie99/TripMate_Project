import axios from "axios";

const api = axios.create({
  baseURL: "https://tripmateweb.store/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 가져와 모든 요청 헤더에 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Content-Type을 명시적으로 application/json으로 설정
  config.headers['Content-Type'] = 'application/json';
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("토큰을 찾을 수 없다.");
  }
  console.log("헤더 요청:", config.headers);
  return config;
});


export default api;
