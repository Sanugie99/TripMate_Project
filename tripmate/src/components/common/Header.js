import React from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

// 아래 HeaderBlock, Logo, NavLinks는 StyledComponents.js에 추가할 스타일입니다.
// 여기서는 임시로 선언하여 사용합니다. 실제 스타일은 마지막 단계에서 추가합니다.
const HeaderBlock = styled.header`
        display: flex;
      justify-content: space-between;
      align-items: center;
     padding: 1rem 2rem;
      border-bottom: 1px solid #e9ecef;
     background: white;
    `;

const Logo = styled(Link)`
      font-size: 1.5rem;
      font-weight: bold;
    color: #333;
    text-decoration: none;
   `;

const NavLinks = styled.nav`
    a {
        margin-left: 1.5rem;
        font-size: 1rem;
       color: #333;
      text-decoration: none;
       &:hover {
          color: #007bff;
   
       }
          
    }
    `;

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get current location
    const { id: scheduleId } = useParams(); // Get scheduleId from URL params

    // Determine the path for "내 일정"
    // If we are currently on a /myschedule/:id path, use that ID.
    // Otherwise, default to /my-schedule (which will load from local storage or be new)
    const mySchedulePath = location.pathname.startsWith('/myschedule/') && scheduleId
        ? `/myschedule/${scheduleId}`
        : '/my-schedule';

    const handleLogout = () => {
        logout();
        alert("로그아웃 되었습니다.");
        navigate("/"); // 로그아웃 후 메인 페이지로 이동
    };

    return (
        <HeaderBlock>
            <Logo to="/">TripMate</Logo>
            <NavLinks>
                <Link to="/travel">공유 여행지</Link>
                {user ? (
                    <>
                        <Link to={'/'}>일정 생성</Link>
                        <Link to={mySchedulePath}>내 일정</Link>
                        <Link to={`/user/${user.userId}`}>마이페이지</Link>
                        <Link to="/" onClick={handleLogout}>로그아웃</Link>
                    </>

                ) : (
                    <Link to="/login">로그인</Link>
                )}
            </NavLinks>
        </HeaderBlock>
    );
}

export default Header;