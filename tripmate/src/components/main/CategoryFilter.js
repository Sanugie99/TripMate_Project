import React, { useState } from 'react';
import '../../css/CategoryFilter.css';

const categories = ['전체', '음식점', '데이트여행', '쇼핑', '문화/예술', '숙박'];

function CategoryFilter({ onChange }) {
  const [selected, setSelected] = useState(['전체']);

  const handleClick = (cat) => {
    let next;
    if (cat === '전체') {
      next = ['전체'];
    } else {
      next = selected.includes(cat)
        ? selected.filter(c => c !== cat && c !== '전체')
        : [...selected.filter(c => c !== '전체'), cat];
      if (next.length === 0) next = ['전체'];
    }
    setSelected(next);
    onChange && onChange(next);
  };

  return (
    <div className="category-filter">
      {categories.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => handleClick(cat)}
          style={{
            border: selected.includes(cat) ? '2.5px solid #4caf50' : '1.5px solid #ddd',
            background: selected.includes(cat) ? '#e8f5e9' : '#fff',
            color: selected.includes(cat) ? '#388e3c' : '#333',
            fontWeight: selected.includes(cat) ? 700 : 400,
            borderRadius: 8,
            marginRight: 8,
            padding: '0.5rem 1.2rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;