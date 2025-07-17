import api from "./index";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  
  // 백엔드에서 보내주는 'token'과 'user'를 직접 사용하도록 수정
  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    // 토큰이 없는 경우 에러 처리
    throw new Error("Login failed: No token received");
  }

  return response.data;
};

export const signup = async (userData) => {
  return await api.post("/auth/signup", userData);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getMe = async () => {
  // 이 함수는 이제 직접 사용되지 않을 수 있지만, 유효성 검사 용도로 남겨둘 수 있습니다.
  // AuthController에 /me 엔드포인트를 추가해야 정상 동작합니다.
  return await api.get("/auth/me");
};