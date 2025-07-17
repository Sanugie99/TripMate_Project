import React, { useState, useEffect } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import styled from "styled-components";

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const InfoWindowContent = styled.div`
  padding: 10px;
  max-width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  font-size: 0.9rem;
`;

const PlaceImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
`;

const MapComponent = ({ places, selectedPlaceId, setSelectedPlaceId }) => {
  // 기본 중심 좌표: 첫 장소 or 서울 중심
  const center = places.length
    ? { lat: places[0].lat, lng: places[0].lng }
    : { lat: 37.5665, lng: 126.9780 };

  const [infoPosition, setInfoPosition] = useState(null);
  const [infoData, setInfoData] = useState(null);

  // selectedPlaceId가 바뀌면 위치 및 데이터 설정
  useEffect(() => {
    if (!selectedPlaceId) {
      setInfoPosition(null);
      setInfoData(null);
      return;
    }
    const place = places.find((p) => p.id === selectedPlaceId);
    if (place) {
      setInfoPosition({ lat: place.lat, lng: place.lng });
      setInfoData(place);
    }
    console.log(places);
  }, [selectedPlaceId, places]);
  console.log("MapComponent 렌더링!", places);

  return (
    <MapWrapper>
      <Map
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={5}
      >
        {places.map((place) => (
          <MapMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            clickable={true}
            onClick={() => {
              if (setSelectedPlaceId) setSelectedPlaceId(place.id);
            }}
          />
        ))}

        {/* 선택된 장소에만 말풍선 띄우기 */}
        {infoPosition && infoData && (
          <CustomOverlayMap position={infoPosition}>
            <InfoWindowContent>
              <strong>{infoData.name}</strong>
              <br />
              <small>{infoData.address}</small>
              {infoData.place_url && (
                <div style={{ marginTop: '8px' }}>
                  <a href={infoData.place_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3182f6', textDecoration: 'underline', fontSize: '0.95em' }}>
                    카카오맵 상세보기
                  </a>
                </div>
              )}
            </InfoWindowContent>
          </CustomOverlayMap>
        )}
      </Map>
    </MapWrapper>
  );
};

export default MapComponent;
