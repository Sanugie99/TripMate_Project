import React, { useState } from "react";
import styled from "styled-components";
import { searchPlacesByKeyword } from "../../api/kakaoApi";

const Wrapper = styled.div`
  margin-bottom: 1rem;
`;

const SearchRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Button = styled.button`
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Results = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  background: white;
  box-shadow: 0 0 6px rgb(0 0 0 / 0.1);
`;

const ResultItem = styled.li`
  border-bottom: 1px solid #eee;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: default;

  &:hover {
    background-color: #f0f8ff;
  }
`;

const AddBtn = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const PlaceSearchBar = ({ onPlaceSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const places = await searchPlacesByKeyword(query);
    setResults(places || []);
  };

  return (
    <Wrapper>
      <SearchRow>
        <Input
          type="text"
          placeholder="장소를 검색하세요 (예: 부산역, 카페, 맛집 등)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button onClick={handleSearch}>검색</Button>
      </SearchRow>

      <Results>
        {results.length === 0 && <li style={{ padding: "1rem", color: "#666" }}>검색 결과가 없습니다.</li>}
        {results.map((place, idx) => (
          <ResultItem key={idx}>
            <div>
              <strong>{place.place_name}</strong>
              <p style={{ fontSize: "0.8rem", color: "gray", marginTop: 4 }}>
                {place.road_address_name || place.address_name}
              </p>
            </div>
            <AddBtn
              onClick={() =>
                onPlaceSelect({
                  name: place.place_name,
                  lat: parseFloat(place.y), // 위도
                  lng: parseFloat(place.x), // 경도
                  category: place.category_group_name || "",
                  categoryCode: place.category_group_code || "",
                  address: place.road_address_name || place.address_name || "",
                })
              }
            >
              추가
            </AddBtn>
          </ResultItem>
        ))}
      </Results>
    </Wrapper>
  );
};

export default PlaceSearchBar;
