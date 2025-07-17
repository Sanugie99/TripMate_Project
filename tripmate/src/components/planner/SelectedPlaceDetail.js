// components/planner/PlaceDetailModal.js
import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff;
  padding: 100px;
  border-radius: 16px;
  width: 400px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  padding: 10px;
  cursor: pointer;
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 15px;
  border:none;
`;

const Image = styled.img`
  width: 100%;
  border-radius: 10px;
  margin-top: 1rem;
`;

const PlaceDetailModal = ({ place, onClose }) => {
  if (!place) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✕</CloseButton>

        <Field>
          <Label>장소명</Label>
          <Input value={place.name} readOnly />
        </Field>

        <Field>
          <Label>카테고리</Label>
          <Input value={place.category} readOnly />
        </Field>

        <Field>
          <Label>주소</Label>
          <Input value={place.address} readOnly />
        </Field>

        {place.photoUrl && <Image src={place.photoUrl} alt={place.name} onError={e => e.target.src = '/icons/tourist.png'} />}
      </ModalBox>
    </Overlay>
  );
};

export default PlaceDetailModal;
