import React, { useState } from "react";

// 시간 선택 모달 컴포넌트
const TimeSelectModal = ({ startDate, endDate, onClose, onSelect }) => {
  // 출발 시간 state만 사용
  const [startDepart, setStartDepart] = useState("10:00");
  const [endDepart, setEndDepart] = useState("10:00");

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
        <h2 style={{ marginBottom: 8 }}>여행 출발 시간 선택</h2>
        {/* 안내 문구 */}
        <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
          각 날짜별 출발 시간을 선택해 주세요.
        </div>
        {/* 시간 입력 카드 */}
        <div style={{
          background: "#f8f8f8", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px #cccccc"
        }}>
          {/* 가는 날 출발시간 입력 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              {startDate.toLocaleDateString()} (가는 날)
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <label style={{ fontSize: 15, marginRight: 4 }}>출발시간</label>
              <input
                type="time"
                value={startDepart}
                onChange={e => setStartDepart(e.target.value)} // 출발시간 변경
                style={{
                  padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 15
                }}
              />
            </div>
          </div>
          {/* 오는 날 출발시간 입력 */}
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              {endDate.toLocaleDateString()} (오는 날)
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <label style={{ fontSize: 15, marginRight: 4 }}>출발시간</label>
              <input
                type="time"
                value={endDepart}
                onChange={e => setEndDepart(e.target.value)} // 출발시간 변경
                style={{
                  padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 15
                }}
              />
            </div>
          </div>
        </div>
        {/* 버튼 영역 */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          {/* 완료 버튼 */}
          <button
            style={{
              background: "#111", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: "pointer",
              marginRight: 16
            }}
            onClick={() => onSelect({
              startDepart, endDepart
            })} // 완료 시 부모로 값 전달
          >
            완료
          </button>
          {/* 닫기 버튼 */}
          <button
            style={{
              background: "none", color: "#888", border: "1px solid #ccc",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: "pointer"
            }}
            onClick={onClose} // 닫기 시 부모로 알림
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectModal;