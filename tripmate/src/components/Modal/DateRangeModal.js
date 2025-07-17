import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { ko } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// 날짜 범위 선택 모달 컴포넌트
const DateRangeModal = ({ onClose, onSelect }) => {
  // 날짜 범위 state
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  return (
    // 모달 배경
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      {/* 모달 카드 */}
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #cccccc",
        padding: 32, minWidth: 420, textAlign: "center"
      }}>
        {/* 타이틀 */}
        <h2 style={{ marginBottom: 8 }}>여행 기간이 어떻게 되시나요?</h2>
        {/* 안내 문구 */}
        <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
          여행 일자는 최대 10일까지 선택 가능합니다.
        </div>
        {/* 날짜 범위 선택 달력 */}
        <DateRange
          locale={ko}
          editableDateInputs={true}
          onChange={item => setRange([item.selection])}
          moveRangeOnFirstSelection={false}
          ranges={range}
          minDate={new Date()}
          maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
          renderStaticRangeLabel={() => null}
          // 커스텀 헤더 적용
          calendarHeaderRenderer={({ date, decreaseMonth, increaseMonth }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <button onClick={decreaseMonth} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}>{'<'}</button>
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                {date.getFullYear()}년 {date.getMonth() + 1}월
              </span>
              <button onClick={increaseMonth} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer' }}>{'>'}</button>
            </div>
          )}
        />
        {/* 버튼 영역 */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          {/* 선택 버튼 */}
          <button
            style={{
              background: "#111", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: "pointer",
              marginRight: 16
            }}
            onClick={() => onSelect(range[0])}
          >
            선택
          </button>
          {/* 닫기 버튼 */}
          <button
            style={{
              background: "none", color: "#888", border: "1px solid #ccc",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: "pointer"
            }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeModal;