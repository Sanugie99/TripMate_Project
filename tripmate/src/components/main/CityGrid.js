import React, { useState } from 'react';
import {
    CityGridBlock,
    Grid,
    CityItem
} from '../common/StyledComponents';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import SimpleModal from '../Modal/SimpleModal';



const ModalContent = styled.div`
       padding: 2rem;
       text-align: center;
     `;

const ModalTitle = styled.h2`
      font-size: 1.8rem;
       margin-bottom: 1rem;
       color: #333;
     `;

const ModalText = styled.p`
       font-size: 1.1rem;
       margin-bottom: 2rem;
       color: #555;
     `;

const CreateScheduleButton = styled.button`
       background: #2563eb;
       color: white;
       border: none;
       border-radius: 8px;
       padding: 0.8rem 1.5rem;
       font-size: 1rem;
       font-weight: 600;
       cursor: pointer;
       transition: background-color 0.2s;
    
       &:hover {
         background: #1d4ed8;
       }
     `;


const cities = [
    '서울', '부산', '경주', '강릉', '여수', '전주',
    '대전', '인천', '춘천', '가평', '수원', '포항',
    '군산', '목포', '안동', '제천' , '영월'
];

const cityImages = {
    '서울': '/images/cities/seoul.jpg',
    '부산': '/images/cities/busan.jpg',
    '경주': '/images/cities/gyeongju.jpg',
    '강릉': '/images/cities/gangneung.jpg',
    '여수': '/images/cities/yeosu.jpg',
    '전주': '/images/cities/jeonju.jpg',
    '대전': '/images/cities/daejeon.jpg',
    '인천': '/images/cities/incheon.jpg',
    '춘천': '/images/cities/chuncheon.jpg',
    '가평': '/images/cities/gapyeong.jpg',
    '수원': '/images/cities/suwon.jpg',
    '포항': '/images/cities/pohang.jpg',
    '군산': '/images/cities/gunsan.jpg',
    '목포': '/images/cities/mokpo.jpg',
    '안동': '/images/cities/andong.jpg',
    '제천': '/images/cities/jecheon.jpg',
    '영월': '/images/cities/yeongwol.jpg',
};


function CityGrid() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);

    // 도시 클릭 시 모달 열기
    const handleCityClick = (city) => {
        setSelectedCity(city);
        setIsModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCity(null);
    };

    // "일정 생성하기" 버튼 클릭 시 페이지 이동
    const handleCreateSchedule = () => {
        if (selectedCity) {
            navigate('/startPlanner', { state: { arrival: selectedCity } });
        }
    };

    return (
        <>
            <CityGridBlock>
                <Grid>
                    {cities.map((city) => (
                        <CityItem key={city} onClick={() => handleCityClick(city)} $imageUrl={cityImages[city]}>
                            {city}
                        </CityItem>
                    ))}
                </Grid>
            </CityGridBlock>

            {/* 팝업(모달) */}
            <SimpleModal open={isModalOpen} onClose={handleCloseModal}>
                <ModalContent>
                    <ModalTitle>{selectedCity}</ModalTitle>
                    <ModalText>
                        선택하신 '{selectedCity}'(으)로 여행 일정을 만들어 볼까요?
                    </ModalText>
                    <CreateScheduleButton onClick={handleCreateSchedule}>
                        일정 생성하기
                    </CreateScheduleButton>
                </ModalContent>
            </SimpleModal>
        </>
    );
}
export default CityGrid;