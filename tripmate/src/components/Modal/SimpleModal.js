import React from "react";
import { FiX } from "react-icons/fi";

const modalStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "#0000004D",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};
const contentStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    minWidth: 1200,
    minHeight: 800,
    maxHeight: "90vh",
    overflowY: "auto"
};

const closeBtnStyle = {
  position: "absolute",
  top: 18,
  right: 24,
  background: "none",
  border: "none",
  fontSize: "28px",
  color: "#444",
  cursor: "pointer",
  zIndex: 10
};

const SimpleModal = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={{...contentStyle, position: 'relative'}} onClick={e => e.stopPropagation()}>
                <button
                    style={closeBtnStyle}
                    onClick={onClose}
                    onMouseOver={e => e.currentTarget.style.color = '#222'}
                    onMouseOut={e => e.currentTarget.style.color = '#444'}
                    aria-label="닫기"
                >
                    <FiX />
                </button>
                {children}
            </div>
        </div>
    );
};

export default SimpleModal; 