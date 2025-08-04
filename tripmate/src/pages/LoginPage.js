import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/auth";
import api from "../api"; // api 임포트
import { useAuth } from "../context/AuthContext";
import {
  Wrapper,
  Form,
  Title,
  Input,
  Button,
  ButtonWrap,
  InputGroup,
  Label,
  ErrorMessage,
  FindAccountLink,
  FindAccountWrap,
  Separator,
} from "../components/common/StyledComponents";
import styled from "styled-components";


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
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

// --- Find Account Modal Component ---
const FindAccountModal = ({ type, onClose }) => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(""); // 비밀번호 찾기를 위한 userId 상태 추가
  const [email, setEmail] = useState("");

  const handleFindId = async () => {
    if (!username || !email) {
      alert("이름과 이메일을 모두 입력해주세요.");
      return;
    }
    try {
              const response = await api.post("/auth/find-id", { username, email });
      alert(`회원님의 아이디는 [ ${response.data.userId} ] 입니다.`);
      onClose();
    } catch (error) {
      alert("일치하는 사용자 정보를 찾을 수 없습니다.");
    }
  };

  const handlePasswordReset = async () => {
    if (!userId || !email) {
      alert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }
    try {
      // API 엔드포인트 및 요청 데이터 수정
              await api.post("/auth/find-password", { userId, email });
      alert("임시 비밀번호가 이메일로 발송되었습니다. 로그인 후 비밀번호를 변경해주세요.");
      onClose();
    } catch (error) {
      alert("일치하는 사용자 정보를 찾을 수 없습니다.");
    }
  };

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {type === "findId" ? (
          <>
            <Title>아이디 찾기</Title>
            <InputGroup>
              <Label>이름</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="가입 시 기록한 이름을 입력하세요."
              />
            </InputGroup>
            <InputGroup>
              <Label>이메일</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입 시 등록한 이메일을 입력하세요."
              />
            </InputGroup>
            <Button onClick={handleFindId} style={{ width: "100%", marginTop: "1rem" }}>
              아이디 찾기
            </Button>
          </>
        ) : (
          <>
            <Title>비밀번호 찾기</Title>
            {/* 아이디 입력 필드 추가 */}
            <InputGroup>
              <Label>아이디</Label>
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="가입 시 등록한 아이디를 입력하세요."
              />
            </InputGroup>
            <InputGroup>
              <Label>이메일</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입 시 등록한 이메일을 입력하세요."
              />
            </InputGroup>
            <Button onClick={handlePasswordReset} style={{ width: "100%", marginTop: "1rem" }}>
              임시 비밀번호 발송
            </Button>
          </>
        )}
        <Button onClick={onClose} style={{ width: "100%", marginTop: "1rem", backgroundColor: "#6c757d" }}>
          닫기
        </Button>
      </ModalContent>
    </ModalBackground>
  );
};


const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'findId' or 'findPw'

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockUntil && new Date() < lockUntil) {
      setErrorMsg('로그인 3회 실패');
      return;
    }

    if (!loginData.userId.trim() || !loginData.password.trim()) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await apiLogin(loginData); // response is { token, user }
      login(response.token, response.user); // AuthContext에 토큰과 사용자 정보 전달
      setErrorMsg("");
      setFailCount(0);
      setLockUntil(null);
      
      // user 객체에서 temporaryPassword 확인
      if (response.user.temporaryPassword) {
        alert("임시 비밀번호로 로그인했습니다. 마이페이지로 이동하여 비밀번호를 변경해주세요.");
        navigate("/mypage");
      } else {
        navigate("/");
      }

    } catch (error) {
      alert("아이디나 비밀번호를 잘못 입력하였습니다.");
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
    }
  };

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!lockUntil) return;

    const timer = setInterval(() => {
      if (new Date() > lockUntil) {
        setFailCount(0);
        setLockUntil(null);
        setErrorMsg("");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockUntil]);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
  };

  const isLocked = lockUntil && new Date() < lockUntil;

  return (
    <>
      <Wrapper>
        <Form onSubmit={handleLogin}>
          <Title>로그인</Title>

          <InputGroup>
            <Label htmlFor="userId">아이디</Label>
            <Input
              type="text"
              id="userId"
              name="userId"
              placeholder="아이디를 입력해주세요."
              value={loginData.userId}
              onChange={handleChange}
              disabled={isLocked}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="비밀번호를 입력해주세요."
              value={loginData.password}
              onChange={handleChange}
              disabled={isLocked}
            />
          </InputGroup>

          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

          <ButtonWrap>
            <Button type="submit" disabled={isLocked}>
              로그인
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/signup")}
              style={{ marginTop: "10px" }}
            >
              회원가입
            </Button>
          </ButtonWrap>

          <FindAccountWrap>
            <FindAccountLink onClick={() => openModal('findId')}>아이디 찾기</FindAccountLink>
            <Separator />
            <FindAccountLink onClick={() => openModal('findPw')}>비밀번호 찾기</FindAccountLink>
          </FindAccountWrap>
        </Form>
      </Wrapper>
      {isModalOpen && <FindAccountModal type={modalType} onClose={closeModal} />}
    </>
  );
};

export default Login;
