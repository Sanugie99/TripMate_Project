import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Card = styled.div`
  max-width: 400px;
  margin: 4px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
`;

const Input = styled.input`
  padding: 0.6rem 0.8rem;
  border: 1.8px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  &:focus {
    outline: none;
    border-color: #0077ff;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: #0077ff;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease;
  &:hover {
    background-color: #005fcc;
  }
`;

const ScheduleForm = ({
  onSubmit,
  defaultDeparture = "",
  defaultArrival = "",
  defaultDate = "",
  defaultDays = 3,
}) => {
  const [departure, setDeparture] = useState(defaultDeparture);
  const [arrival, setArrival] = useState(defaultArrival);
  const [date, setDate] = useState(defaultDate);
  const [days, setDays] = useState(defaultDays);

  useEffect(() => { setDeparture(defaultDeparture); }, [defaultDeparture]);
  useEffect(() => { setArrival(defaultArrival); }, [defaultArrival]);
  useEffect(() => { setDate(defaultDate); }, [defaultDate]);
  useEffect(() => { setDays(defaultDays); }, [defaultDays]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!departure || !arrival || !date || !days) {
      alert("출발지, 도착지, 날짜, 여행 기간 모두 입력해주세요.");
      return;
    }
    onSubmit({ departure, arrival, date, days });
  };

  return (
    <Card>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>출발지:</Label>
          <Input
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="서울"
          />
        </FormGroup>

        <FormGroup>
          <Label>도착지:</Label>
          <Input
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            placeholder="부산"
          />
        </FormGroup>

        <FormGroup>
          <Label>출발 날짜:</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>여행 기간(박수):</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value) || 1)}
          />
        </FormGroup>

        <Button type="submit">일정 생성</Button>
      </Form>
    </Card>
  );
};

export default ScheduleForm;