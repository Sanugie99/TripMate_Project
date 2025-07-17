import React from 'react';
import '../../css/ItemGrid.css';

const items = [
  { title: '동복양', img: '동복양.jpg' },
  { title: '용호2거리', img: '용호2거리.jpg' },
  { title: '아트앤제주', img: '아트앤제주.jpg' },
  // ...이미지 경로는 나중에 실제 URL로 대체
];

function ItemGrid() {
  return (
    <div className="item-grid">
      {items.map((item, idx) => (
        <div key={idx} className="grid-item">
          <img src={process.env.PUBLIC_URL + '/icons/' + (item.img || 'tourist.png')} alt={item.title} onError={e => e.target.src = process.env.PUBLIC_URL + '/icons/tourist.png'} />
          <p>{item.title}</p>
        </div>
      ))}
    </div>
  );
}

export default ItemGrid;