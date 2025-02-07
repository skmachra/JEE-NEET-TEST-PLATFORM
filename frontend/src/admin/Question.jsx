import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Question = () => {
    const [questions, setQuestions] = useState([]);
    const [subjectFilter, setSubjectFilter] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("");
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [popupQuestion, setPopupQuestion] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

    useEffect(() => {
        (async () => {
            const response = await axios.get(import.meta.env.VITE_API_URL+"/api/v1/admin/questions", {
                withCredentials: true, // Ensure cookies are sent for authentication
            });
            console.log(response.data);
            setQuestions(response.data); // Set the fetched questions to the state variable
        })();
    }, []);
    const filteredQuestions = questions.filter((question) => {
        const subjectMatch = subjectFilter ? question.subject === subjectFilter : true;
        const difficultyMatch = difficultyFilter ? question.difficultyLevel === difficultyFilter : true;
        return subjectMatch && difficultyMatch;
    });
    const openDetailsPopup = (question) => {
        setPopupQuestion(question);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupQuestion(null);
    };
    const handleDeleteQuestion = async () => {
        
        try {
            await axios.delete(import.meta.env.VITE_API_URL+`/api/v1/admin/question/${questionToDelete}`, {
                withCredentials: true, // Ensure cookies are sent for authentication
            });
            setShowDeletePopup(false);
            setQuestionToDelete(null);
            const updatedQuestions = questions.filter((q) => q._id !== questionToDelete);
            setQuestions(updatedQuestions);
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6">Manage Questions</h1>
            <div className="flex justify-between mb-4">
                <button
                    onClick={() => navigate('/admin/upload-question')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
                >
                    Create New Question
                </button>
            </div>
            <h2 className="text-xl font-semibold text-center mb-4">Available Questions</h2>
            <div className="mb-6 p-1 border rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Subject</option>
                        {/* Replace with dynamic subjects or static values */}
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Mathematics">Mathematics</option>
                    </select>
                    <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuestions?.map((question) => (
                    <div
                        key={question._id}
                        className={`border p-4 rounded shadow-md`}
                    >
                        <p className="font-bold">{question.question}</p>
                        <p>Subject: {question.subject}</p>
                        <p>Difficulty: {question.difficultyLevel}</p>
                        <p>Marks: {question.marks}</p>

                        {/* Add/Remove Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/update-question/${question._id}`);
                            }}
                            className={`mt-2 mr-2 bg-green-500 text-white px-4 py-2 rounded`}
                        >
                            Update
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setQuestionToDelete(question?._id);
                                setShowDeletePopup(true);
                            }}
                            className={`mt-2 mr-2 bg-red-500 text-white px-4 py-2 rounded`}
                        >
                            Delete
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openDetailsPopup(question);
                            }}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
            {showPopup && popupQuestion && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-2xl">
                        <h2 className="text-xl font-semibold mb-4">Question Details</h2>
                        <p><strong>Question:</strong> {popupQuestion.question}</p>
                        <p><strong>Subject:</strong> {popupQuestion.subject}</p>
                        <p><strong>Difficulty:</strong> {popupQuestion.difficultyLevel}</p>
                        <p><strong>Marks:</strong> {popupQuestion.marks}</p>
                        <p><strong>Negative Marks:</strong> {popupQuestion.negativeMarks}</p>
                        {popupQuestion.type && <p><strong>Type:</strong> {popupQuestion.type}</p>}
                        {popupQuestion.options && popupQuestion.options.length > 0 && (
                            <div>
                                <strong>Options:</strong>
                                <ul>
                                    {popupQuestion.options.map((option, index) => (
                                        <li key={index}>
                                            {option.option} - {option.isCorrect ? "Correct" : "Incorrect"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {popupQuestion.correctValue && (
                            <p><strong>Correct Value:</strong> {popupQuestion.correctValue}</p>
                        )}
                        {popupQuestion.isPYQ && popupQuestion.pyqDetails && (
                            <div>
                                <strong>Previous Year Question Details:</strong>
                                <p><strong>Exam:</strong> {popupQuestion.pyqDetails.examName}</p>
                                <p><strong>Year:</strong> {popupQuestion.pyqDetails.year}</p>
                                <p><strong>Session:</strong> {popupQuestion.pyqDetails.session}</p>
                            </div>
                        )}
                        <button
                            onClick={closePopup}
                            className="mt-4 bg-gray-500 text-white px-6 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Are you sure you want to delete this Question?
                        </h2>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteQuestion}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Question;