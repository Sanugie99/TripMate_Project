const ReviewForm = ({ scheduleId, reviews, setReviews }) => {
    return (
        <>
            <P>{reviews.map(review => <span key={review.id}>{review.text}</span>)}</P>
            <p>Id : {scheduleId}</p>
            <p>Reviews : {reviews.length}</p>
            <p>{setReviews}</p>
        </>
    );
};

export default ReviewForm;