import React from "react";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import styled from "styled-components";

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const InfoWindow = styled.div`
  position: relative;
  padding: 10px 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  min-width: 180px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #222;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 7px;
  background: transparent;
  border: none;
  font-weight: bold;
  font-size: 1.1rem;
  color: #555;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const iconMap = {
    FD6: "/icons/restaurant.png",
    CE7: "/icons/cafe.png",
    AT4: "/icons/tourist.png",

};

const ScheduleMapComponent = ({ dailyPlan, selectedDate, selectedPlace, onSelectPlace, onCloseInfo }) => {
    const places = selectedDate ? dailyPlan[selectedDate] || [] : [];

    // 경로용 path 배열 생성 (lat/lng 혹은 latitude/longitude 모두 처리)
    const path = places.map(p => ({
        lat: p.lat ?? p.latitude,
        lng: p.lng ?? p.longitude,
    })).filter(p => p.lat !== undefined && p.lng !== undefined);

    // 중심 좌표 (선택 장소 우선, 없으면 첫 장소, 없으면 서울 중심)
    const center = selectedPlace
        ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
        : path.length > 0
            ? path[0]
            : { lat: 37.5665, lng: 126.978 };


    return (
        <MapWrapper>
            <Map center={center} style={{ width: "100%", height: "100%" }} level={8}>
                {places.map((place, idx) => (
                    <MapMarker
                        key={`${place.name}-${idx}`}
                        position={{ lat: place.lat, lng: place.lng }}
                        title={place.name}
                        image={{
                            src: iconMap[place.categoryCode] || "/icons/default.png",
                            size: { width: 40, height: 40 },
                            options: { anchor: { x: 20, y: 40 } },
                        }}
                        onClick={() => onSelectPlace(place)}
                    />
                ))}

                {selectedPlace && (
                    <MapMarker position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} zIndex={100}>
                        <InfoWindow>
                            <CloseButton onClick={onCloseInfo}>×</CloseButton>
                            <h4 style={{ margin: "0 0 8px 0" }}>{selectedPlace.name}</h4>
                            <p style={{ margin: "0 0 4px 0" }}>{selectedPlace.address}</p>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                                카테고리: {selectedPlace.category}
                            </p>
                        </InfoWindow>
                    </MapMarker>
                )}

                {path.length > 1 && (
                    <Polyline
                        path={path}
                        strokeWeight={5}
                        strokeColor={"#007bff"}
                        strokeOpacity={0.9}
                        strokeStyle={"solid"}
                    />
                )}
            </Map>
        </MapWrapper>
    );
};

export default ScheduleMapComponent;
