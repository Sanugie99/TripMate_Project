import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const ReviewContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #343a40;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 0.5rem;
`;

const ReviewList = styled.div`
  margin-bottom: 1.5rem;
`;

const ReviewItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ReviewInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ReviewAuthor = styled.span`
  font-weight: bold;
  color: #212529;
  margin-right: 0.75rem;
`;

const ReviewTimestamp = styled.span`
  font-size: 0.8rem;
  color: #868e96;
`;

const ReviewContent = styled.p`
  margin: 0;
  color: #495057;
  flex-grow: 1;
`;

const DeleteButton = styled.button`
  background-color: #ff6b6b;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ff4c4c;
  }
`;

const ReviewForm = styled.form`
  display: flex;
  gap: 0.75rem;
`;

const ReviewTextarea = styled.textarea`
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  resize: vertical;
  min-height: 50px;
  font-family: inherit;
  font-size: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ReviewSection = ({ reviews, scheduleId, onCreateReview, onDeleteReview }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    onCreateReview(scheduleId, content);
    setContent('');
  };

  return (
    <ReviewContainer>
      <Title>리뷰</Title>
      <ReviewList>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id}>
              <div>
                <ReviewInfo>
                  <ReviewAuthor>{review.username}</ReviewAuthor>
                  <ReviewTimestamp>{review.createdAt}</ReviewTimestamp>
                </ReviewInfo>
                <ReviewContent>{review.content}</ReviewContent>
              </div>
              {user && user.userId === review.userId && (
                <DeleteButton onClick={() => onDeleteReview(review.id)}>
                  삭제
                </DeleteButton>
              )}
            </ReviewItem>
          ))
        ) : (
          <p>아직 작성된 리뷰가 없습니다.</p>
        )}
      </ReviewList>
      {user && (
        <ReviewForm onSubmit={handleSubmit}>
          <ReviewTextarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰를 남겨보세요..."
            rows="2"
          />
          <SubmitButton type="submit">등록</SubmitButton>
        </ReviewForm>
      )}
    </ReviewContainer>
  );
};

export default ReviewSection;
