
import React, { useState } from 'react';
import styled from 'styled-components';

const SearchBarBlock = styled.div`
     padding: 3rem 2rem;
     background: #e3f2fd;
     display: flex;
     justify-content: center;
      align-items: center;
    `;

const SearchInput = styled.input`
      width: 100%;
      max-width: 500px;
      padding: 1rem 1.5rem;
      border-radius: 50px;
      border: 2px solid #007bff;
      font-size: 1.1rem;
      outline: none;
      transition: box-shadow 0.2s;
   
      &:focus {
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }
    `;

const SearchButton = styled.button`
  margin-left: 1rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1d4ed8;
  }
`;

function SearchBar({ onSearch }) {
  const [value, setValue] = useState("");
  const handleInputChange = (e) => setValue(e.target.value);
  const handleSearchClick = () => {
    if (onSearch) onSearch(value.trim());
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchClick();
  };
  return (
    <SearchBarBlock>
      <SearchInput
        type="text"
        placeholder="어디로 떠나볼까요? 가고싶은 국내 여행지를 입력해주세요."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <SearchButton onClick={handleSearchClick}>검색</SearchButton>
    </SearchBarBlock>
  );
}

export default SearchBar;