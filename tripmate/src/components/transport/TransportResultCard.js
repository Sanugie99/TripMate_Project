import React, { useState, useEffect } from 'react';
import { getSeoulToBusanTransport } from '../../api/transportApi';
import './TransportResultCard.css';

const TransportResultCard = () => {
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransportData = async () => {
      try {
        setLoading(true);
        const response = await fetch(getSeoulToBusanTransport(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTransportData(data);
        setError(null);
      } catch (err) {
        console.error('교통수단 정보 조회 실패:', err);
        setError('교통수단 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportData();
  }, []);

  if (loading) {
    return (
      <div className="transport-result-card">
        <div className="loading">교통수단 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transport-result-card">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!transportData) {
    return (
      <div className="transport-result-card">
        <div className="no-data">교통수단 정보가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="transport-result-card">
      <h3>서울 → 부산 교통수단 정보</h3>
      
      {/* 기차 정보 */}
      <div className="transport-section">
        <h4>🚄 기차 정보</h4>
        {transportData.korailOptions && transportData.korailOptions.length > 0 ? (
          <div className="transport-list">
            {transportData.korailOptions.map((train, index) => (
              <div key={index} className="transport-item">
                <div className="transport-info">
                  <span className="transport-name">{train.trainGradeName}</span>
                  <span className="transport-number">{train.trainNo}</span>
                </div>
                <div className="transport-time">
                  <span>{train.depPlandTime} → {train.arrPlandTime}</span>
                </div>
                <div className="transport-price">
                  {train.adultCharge ? `${train.adultCharge.toLocaleString()}원` : '가격 정보 없음'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>기차 정보가 없습니다.</p>
        )}
      </div>

      {/* 버스 정보 */}
      <div className="transport-section">
        <h4>🚌 버스 정보</h4>
        {transportData.busOptions && transportData.busOptions.length > 0 ? (
          <div className="transport-list">
            {transportData.busOptions.map((bus, index) => (
              <div key={index} className="transport-item">
                <div className="transport-info">
                  <span className="transport-name">{bus.gradeNm}</span>
                  <span className="transport-number">{bus.routeId}</span>
                </div>
                <div className="transport-time">
                  <span>{bus.depPlandTime} → {bus.arrPlandTiem}</span>
                </div>
                <div className="transport-price">
                  {bus.charge ? `${bus.charge.toLocaleString()}원` : '가격 정보 없음'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>버스 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TransportResultCard; 