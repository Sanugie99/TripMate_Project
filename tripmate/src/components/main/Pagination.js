import React from 'react';
import '../../css/Pagination.css';

function Pagination() {
  return (
    <div className="pagination">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((page) => (
        <button key={page}>{page}</button>
      ))}
    </div>
  );
}

export default Pagination;