import React, { useState, useEffect } from "react";
import { getTransportInfo } from "../../api/transportApi";
import TransportForm from "../transport/TransportForm";

// 날짜 포맷 함수
const formatDate = (date) => {
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
};

// 교통편 선택 모달 컴포넌트
const TransportSelectModal = ({ date, time, onSelect, onNext, mode = "go", onClose, onBack, transportData, loading }) => {
  const [selected, setSelected] = useState(null);
  const [busList, setBusList] = useState([]);
  const [trainList, setTrainList] = useState([]);
  const [tab, setTab] = useState("train");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  // transportData가 바뀔 때만 리스트 갱신, API 호출 X
  useEffect(() => {
    if (transportData) {
      setTrainList(transportData.korailOptions || []);
      setBusList(transportData.busOptions || []);
    } else {
      setTrainList([]);
      setBusList([]);
    }
    setPage(0);
  }, [transportData]);

  // 탭 변경 시 페이지 초기화
  const handleTab = (type) => {
    setTab(type);
    setPage(0);
    setSelected(null);
  };

  // 탭에 따라 리스트 분기
  const currentList = tab === "bus" ? busList : trainList;
  const totalPages = Math.ceil(currentList.length / PAGE_SIZE);

  // 다음/완료 버튼 핸들러
  const handleNext = () => {
    if (!selected) return;
    if (mode === "go" && onNext) {
      onNext(selected);
    } else if (mode === "return" && onSelect) {
      onSelect(selected);
    }
  };

  return (
    // 모달 배경
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      {/* 모달 카드 */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #cccccc", padding: 32, minWidth: 420, textAlign: "center", position: "relative" }}>
        {/* 타이틀 */}
        <h1 style={{ marginBottom: 8 }}>{mode === "go" ? "가는날 교통편 선택" : "오는날 교통편 선택"}</h1>
        {/* 선택한 날짜/시간 정보 */}
        <div style={{ fontSize: 20, color: "#333", marginBottom: 16 }}>
          <b>{mode === "go" ? "가는 날:" : "오는 날:"}</b> {formatDate(date)}<br />
          <b>출발시간:</b> {time}
        </div>
        {/* 탭 버튼 */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={() => handleTab("train")}
            style={{
              fontWeight: tab === "train" ? "bold" : "normal",
              borderBottom: tab === "train" ? "2px solid #333" : "none",
              marginRight: 8,
              padding: "6px 18px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: tab === "train" ? "#fff" : "#eee",
              color: "#333",
              fontSize: 16,
              cursor: "pointer",
              minWidth: 80
            }}
          >
            기차
          </button>
          <button
            onClick={() => handleTab("bus")}
            style={{
              fontWeight: tab === "bus" ? "bold" : "normal",
              borderBottom: tab === "bus" ? "2px solid #333" : "none",
              padding: "6px 18px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: tab === "bus" ? "#fff" : "#eee",
              color: "#333",
              fontSize: 16,
              cursor: "pointer",
              minWidth: 80
            }}
          >
            버스
          </button>
        </div>
        {/* 로딩 중일 때 메시지 */}
        {loading ? (
          <div style={{ margin: "32px 0" }}>교통편 정보를 불러오는 중입니다...</div>
        ) : currentList.length > 0 ? (
          <TransportForm
            key={mode + tab}
            list={currentList}
            selected={selected}
            onSelect={setSelected}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        ) : (
          <div style={{ margin: "32px 0" }}>해당 날짜에 교통편이 없습니다.</div>
        )}
        {/* 완료/다음, 닫기 버튼을 아래쪽에 배치 */}
        <div style={{ marginTop: 32 }}>
          <button
            style={{
              marginTop: 8, background: selected ? "#111" : "#ccc", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: selected ? "pointer" : "not-allowed", margin: 10
            }}
            onClick={handleNext}
            disabled={!selected}
          >
            {mode === "go" ? "다음" : "완료"}
          </button>
          <button
            style={{
              marginTop: 8, background: "none", color: "#888", border: "1px solid #ccc",
              borderRadius: 8, padding: "10px 32px", fontSize: 16, cursor: "pointer", margin: 10
            }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        {/* onBack이 있으면 이전 버튼을 아래쪽에 표시 (중앙 정렬, 배경/테두리 없음) */}
        {onBack && mode === "return" && (
          <button
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: "#333",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: 24,
              textAlign: "center",
              display: "block"
            }}
            onClick={onBack}
          >
            ← 가는날로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default TransportSelectModal; 