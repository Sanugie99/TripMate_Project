import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import api from "../api"; // api 임포트
import styled from "styled-components";

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
} from "../components/common/StyledComponents";

// --- 추가된 Styled Components ---
const CheckButton = styled(Button)`
  background-color: #6c757d;
  margin-left: 10px;
  padding: 0.5rem;
  width: 100px;
  font-size: 0.9rem;
`;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Message = styled.p`
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 10px;
  color: ${props => (props.type === "success" ? "green" : "red")};
`;

function SignUp() {
  const navigate = useNavigate();
  const [signUpData, setSignUpData] = useState({
    userId: "",
    username: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  // 중복 확인 및 유효성 검사 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
    // 입력 시 관련 에러/성공 메시지 초기화
    setErrors({ ...errors, [name]: "" });
    setSuccess({ ...success, [name]: "" });
    if (name === "userId") setIsIdChecked(false);
    if (name === "username") setIsUsernameChecked(false);
  };

  const handleCheckUserId = async () => {
    const { userId } = signUpData;
    if (!/^[A-Za-z0-9]{1,10}$/.test(userId)) {
      setErrors({ ...errors, userId: "아이디는 영문/숫자 포함 10자 이내여야 합니다." });
      return;
    }
    try {
              const response = await api.post("/auth/check-userid", { userId });
      if (response.data.exists) {
        setErrors({ ...errors, userId: "이미 사용 중인 아이디입니다." });
        setIsIdChecked(false);
      } else {
        setSuccess({ ...success, userId: "사용 가능한 아이디입니다." });
        setIsIdChecked(true);
      }
    } catch (error) {
      setErrors({ ...errors, userId: "중복 확인 중 오류가 발생했습니다." });
    }
  };

  const handleCheckUsername = async () => {
    const { username } = signUpData;
    if (!username.trim()) {
        setErrors({ ...errors, username: "이름을 입력해주세요." });
        return;
    }
    try {
              const response = await api.post("/auth/check-username", { username });
      if (response.data.exists) {
        setErrors({ ...errors, username: "이미 사용 중인 이름입니다." });
        setIsUsernameChecked(false);
      } else {
        setSuccess({ ...success, username: "사용 가능한 이름입니다." });
        setIsUsernameChecked(true);
      }
    } catch (error) {
      setErrors({ ...errors, username: "중복 확인 중 오류가 발생했습니다." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, passwordConfirm, email } = signUpData;

    if (!isIdChecked) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }
    if (!isUsernameChecked) {
      alert("이름 중복 확인을 해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrors({ ...errors, passwordConfirm: "비밀번호가 일치하지 않습니다." });
      return;
    }
    if (password.length < 8) {
        setErrors({ ...errors, password: "비밀번호는 최소 8자 이상이어야 합니다." });
        return;
    }
    if (!email.trim() || !email.includes("@")) {
        setErrors({ ...errors, email: "유효한 이메일 주소를 입력를주세요." });
        return;
    }

    try {
      await signup(signUpData);
      alert("회원가입에 성공했습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <Title>회원가입</Title>

        <InputGroup>
          <Label htmlFor="userId">아이디</Label>
          <FieldWrapper>
            <Input
              id="userId"
              name="userId"
              placeholder="영문/숫자 10자 이내"
              value={signUpData.userId}
              onChange={handleChange}
            />
            <CheckButton type="button" onClick={handleCheckUserId}>중복 확인</CheckButton>
          </FieldWrapper>
          {errors.userId && <Message type="error">{errors.userId}</Message>}
          {success.userId && <Message type="success">{success.userId}</Message>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="8자 이상 입력"
            value={signUpData.password}
            onChange={handleChange}
          />
          {errors.password && <Message type="error">{errors.password}</Message>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
          <Input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            placeholder="비밀번호를 다시 입력해주세요."
            value={signUpData.passwordConfirm}
            onChange={handleChange}
          />
          {errors.passwordConfirm && <Message type="error">{errors.passwordConfirm}</Message>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="username">이름</Label>
           <FieldWrapper>
            <Input
                id="username"
                name="username"
                placeholder="이름"
                value={signUpData.username}
                onChange={handleChange}
            />
            <CheckButton type="button" onClick={handleCheckUsername}>중복 확인</CheckButton>
          </FieldWrapper>
          {errors.username && <Message type="error">{errors.username}</Message>}
          {success.username && <Message type="success">{success.username}</Message>}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="이메일"
            value={signUpData.email}
            onChange={handleChange}
          />
          {errors.email && <Message type="error">{errors.email}</Message>}
        </InputGroup>

        <ButtonWrap>
          <Button type="submit">회원가입</Button>
          <FindAccountLink onClick={() => navigate("/login")}>
            로그인 화면으로 돌아가기
          </FindAccountLink>
        </ButtonWrap>
      </Form>
    </Wrapper>
  );
}

export default SignUp;
