import React from "react";

// 교통편 리스트 + 페이지네이션 컴포넌트 (탭/상태는 상위에서 관리)
const TransportForm = ({ list, selected, onSelect, page, setPage, totalPages }) => {
  // 한 페이지에 보여줄 아이템 수는 상위에서 관리한다고 가정
  // list, page, setPage, totalPages 모두 props로 받음

  // 현재 페이지에 보여줄 리스트 슬라이스
  const PAGE_SIZE = 5;
  const pagedList = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // 4자리 숫자(0630) → 06:30 변환 함수
  function formatTime(str) {
    if (!str || str.length !== 4) return str;
    return str.slice(0, 2) + ':' + str.slice(2, 4);
  }

  return (
    <div>
      {/* 교통편 리스트 렌더링 */}
      <div>
        {pagedList.map((item, idx) => {
          // item이 문자열이면 파싱
          let type = "-", dep = "-", arr = "-", depTime = "-", arrTime = "-";
          if (typeof item === "string") {
            const parts = item.split("|").map(s => s.trim());
            const trainTypes = ["KTX", "SRT", "ITX"];
            const isTrain = trainTypes.some(t => (parts[0] || "").toUpperCase().includes(t));

            if (parts.length === 4) {
              // 버스/기차: 시간은 parts[3]
              type = parts[0] || "-";
              const stationStr = parts[1];
              let timeStr = parts[3];
              const [depStation, arrStation] = stationStr.split("→").map(s => s.trim());
              dep = depStation || "-";
              arr = arrStation || "-";
              if (timeStr && timeStr.includes("→")) {
                const [depT, arrT] = timeStr.split("→").map(s => s.trim());
                depTime = depT || "-";
                arrTime = arrT || "-";
              } else if (timeStr && timeStr.length >= 8) {
                depTime = timeStr.slice(0, 4);
                arrTime = timeStr.slice(4, 8);
              } else {
                // 전체 문자열에서 4자리 숫자 2개를 찾아서 시간으로 사용
                const timeMatches = item.match(/(\d{4})/g);
                if (timeMatches && timeMatches.length >= 2) {
                  depTime = timeMatches[0];
                  arrTime = timeMatches[1];
                } else {
                  depTime = arrTime = '-';
                }
              }
            } else if (parts.length >= 3) {
              // 기차: 시간은 parts[2]
              type = parts[0] || "-";
              const stationStr = parts[1];
              let timeStr = parts[2];
              const [depStation, arrStation] = stationStr.split("→").map(s => s.trim());
              dep = depStation || "-";
              arr = arrStation || "-";
              if (timeStr && timeStr.includes("→")) {
                const [depT, arrT] = timeStr.split("→").map(s => s.trim());
                depTime = depT || "-";
                arrTime = arrT || "-";
              } else if (timeStr && timeStr.length >= 8) {
                depTime = timeStr.slice(0, 4);
                arrTime = timeStr.slice(4, 8);
              } else {
                const timeMatches = item.match(/(\d{4})/g);
                if (timeMatches && timeMatches.length >= 2) {
                  depTime = timeMatches[0];
                  arrTime = timeMatches[1];
                } else {
                  depTime = arrTime = '-';
                }
              }
            } else {
              dep = item;
              arr = "";
              depTime = "";
              arrTime = "";
            }
          }
          return (
            <div
              key={idx}
              onClick={() => onSelect(item)}
              style={{
                border: selected === item ? "2px solid #111" : "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                cursor: "pointer",
                background: selected === item ? "#e6f0ff" : "#fafbfc"
              }}
            >
              <div style={{ fontWeight: 600, color: "#2a4d8f", marginBottom: 4 }}>{type}</div>
              <div>{dep} → {arr}</div>
              <div style={{ color: "#555", marginTop: 4 }}>
                {formatTime(depTime)} - {formatTime(arrTime)}
              </div>
            </div>
          );
        })}
      </div>
      {/* 페이지네이션 버튼 */}
      <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          style={{ marginRight: 8, padding: "6px 18px", borderRadius: 6, border: "1px solid #ccc", background: page === 0 ? "#eee" : "#fff", color: "#333", cursor: page === 0 ? "not-allowed" : "pointer" }}
        >
          이전
        </button>
        <span style={{ alignSelf: "center", fontSize: 15 }}>{page + 1} / {totalPages === 0 ? 1 : totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages - 1}
          style={{ marginLeft: 8, padding: "6px 18px", borderRadius: 6, border: "1px solid #ccc", background: page >= totalPages - 1 ? "#eee" : "#fff", color: "#333", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default TransportForm;