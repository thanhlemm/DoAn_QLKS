/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { api } from '../utils/ApiFunctions';
import './BranchFeedback.css'; 

const BranchFeedback = ({ branchId }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState({});

    useEffect(() => {    
        const fetchFeedbacks = async () => {
            try {
                const response = await api.get(`/hotel/feedback/get_by_branch/?branch_id=${branchId}`);
                let feedbackData = Array.isArray(response) ? response : response.data;

                setFeedbacks(feedbackData);
                setLoading(false);

                const userIds = feedbackData.map(feedback => feedback.user);
                const uniqueUserIds = [...new Set(userIds)]; // Lọc ID duy nhất

                // Fetch thông tin người dùng từ các ID
                const userResponses = await Promise.all(
                    uniqueUserIds.map(id => api.get(`/auth/user/${id}/`))
                );
                const userMap = userResponses.reduce((acc, userResponse) => {
                    acc[userResponse.data.id] = userResponse.data;
                    return acc;
                }, {});

                setUsers(userMap);
            } catch (error) {
                console.error('Error fetching feedbacks:', error.message);
                setLoading(false);
            }
        };
        
        fetchFeedbacks();
    }, [branchId]);

    if (loading) {
        return <p>Loading feedback...</p>;
    }

    if (!Array.isArray(feedbacks)) {
        return <p>No feedback available</p>;
    }

    return (
        <div id="webcrumbs" className="feedback-container">
            {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <img
                                src={users[feedback.user]?.avatar || 'https://via.placeholder.com/50'}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <p className="font-semibold">
                                    {users[feedback.user]?.username || 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-500">{feedback.feedback_date}</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="flex items-center mb-2" css={StyledRating}>
                                {/* Hiển thị số sao theo rating */}
                                <div className="rating-display">
                                    {[...Array(5)].map((_, index) => (
                                        <svg
                                            key={index}
                                            viewBox="0 0 576 512"
                                            height="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`star-solid ${index < feedback.rating ? 'filled' : 'empty'}`}
                                        >
                                            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            {feedback.comment}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const StyledRating = css`
  .rating-display {
    display: flex;
    gap: 0.2rem;
  }

  .star-solid {
    width: 1.5rem;
    height: 1.5rem;
    fill: #ddd; /* Màu xám cho sao chưa chọn */
  }

  .star-solid.filled {
    fill: #ffa723; /* Màu vàng cho sao đã chọn */
  }

  .star-solid.empty {
    fill: #ccc; /* Màu xám nhạt cho sao chưa chọn */
  }
`;

export default BranchFeedback;
