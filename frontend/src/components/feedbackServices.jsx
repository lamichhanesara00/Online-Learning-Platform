export const submitFeedback = async (courseId, feedbackData) => {
    return await fetch(`http://localhost:5000/api/course/${courseId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData)
    }).then(res => res.json());
};

export const getFeedback = async (courseId) => {
    return await fetch(`http://localhost:5000/api/course/${courseId}/feedback`).then(res => res.json());
};

export const getCourseRating = async (courseId) => {
    return await fetch(`http://localhost:5000/api/course/${courseId}/rating`).then(res => res.json());
};
