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
  minWidth: 900,
  minHeight: 600,
  maxHeight: "90vh",
  overflowY: "auto"
};

const SimpleModal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <button
          style={{
            float: "right",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#555"
          }}
          aria-label="닫기"
          onClick={onClose}
        >
          <FiX />
        </button>
        {children}
      </div>
    </div>
  );
};

export default SimpleModal; 