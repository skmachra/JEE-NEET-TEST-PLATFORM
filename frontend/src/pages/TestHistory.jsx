import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Chart from "../components/Chart";
import { useMessage } from "../components/Message";
import { getperformanceData } from "../components/getperformanceData";
const TestHistory = () => {
  const showMessage = useMessage()
  // States
  const [testDetails, setTestDetails] = useState(null);
  const [data, setData] = useState(null); // For storing test details data
  const [testHistory, setTestHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // For error handling
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // Example: 60 minutes = 3600 seconds
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [questionTimes, setQuestionTimes] = useState({}); // Stores time spent on each question
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const [performanceData, setPerformanceData] = useState(null)
  const [showPopup, setShowPopup] = useState(false);
  const [tag, setTag] = useState("");
  const { id } = useParams();

  const currentQuestion = testDetails?.questions[currentQuestionIndex];
  const currentUserQuestion = answers.find(answer => answer?.questionId === currentQuestion?.id);




  const getTestDetails = async (testId) => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL+`/api/v1/tests/${testId}`,
        {
          withCredentials: true, // Ensures cookies are sent for authentication
        }
      );

      return response.data; // Return the test details object
    } catch (error) {
      console.error("Error fetching test details:", error.response?.data?.message || error.message);
      throw error; // Throw error to handle it in the calling function
    }
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const data = await getTestDetails(id);
        setData(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch test details");
        setLoading(false);
      }
    };
    fetchTestDetails();
    const fetchTestHistory = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_API_URL+`/api/v1/tests/history/${id}`,
          {
            withCredentials: true, // Ensures cookies are sent for authentication
          }
        );
        setTestHistory(response.data);
        setAnswers(response.data.answers);
        console.log(testHistory);
      } catch (error) {
        console.error("Error fetching test details:", error.response?.data?.message || error.message);
        throw error; // Throw error to handle it in the calling function
      }
    };
    fetchTestHistory();
    const fetchBookmarks = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL+"/api/v1/users/bookmarks", {
          withCredentials: true
        });
        console.log(response);

        setBookmarkedQuestions(response.data.bookmarks); // Assuming bookmarks are objects with `question` and `tag`
        showMessage("success", "Fetched")
      } catch (error) {
        alert(error.response?.data?.message || "Failed to fetch bookmarks");
      }
    };
    fetchBookmarks();
  }, [id]);
  // Load test details
  useEffect(() => {
    if (data) {
      const allQuestions = data?.subjectSections.flatMap((section) =>
        section.questions.map((question) => ({
          ...question,
          subject: section.subject,
        }))
      );
      setTestDetails({ ...data, questions: allQuestions });
      console.log(testDetails);
      setTimeLeft(data?.duration * 60);
    }
  }, [id, data]);


  const handleAnswer = (questionId, answer) => {
    const question = testDetails.questions.find((q) => q.id === questionId);

    if (question.type === "Multiple Correct") {
      setAnswers((prev) => {
        const selectedAnswers = prev[questionId] || [];
        if (selectedAnswers.includes(answer)) {
          // Remove the answer if already selected
          return { ...prev, [questionId]: selectedAnswers.filter((opt) => opt !== answer) };
        } else {
          // Add the answer
          return { ...prev, [questionId]: [...selectedAnswers, answer] };
        }
      });
    } else if (question.type === "Numerical") {
      // Handle numerical input
      setAnswers((prev) => ({ ...prev, [questionId]: answer === null ? null : answer }));
    } else {
      // Single selection
      setAnswers((prev) => ({ ...prev, [questionId]: prev[questionId] === answer ? null : answer }));
    }
  };

  const toggleBookmark = async (questionId, ctag = "") => {
    const isBookmarked = bookmarkedQuestions.some(
      (bookmark) => bookmark?.question?._id?.toString() === questionId
    );

    if (isBookmarked) {
      // Remove bookmark
      setBookmarkedQuestions((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark?.question?._id?.toString() !== questionId)
      );
      await handleRemoveBookmark(questionId);
    } else {
      // Add bookmark
      setBookmarkedQuestions((prevBookmarks) => [
        ...prevBookmarks,
        { question: questionId, tag: ctag },
      ]);
      await handleAddBookmark(questionId, ctag);
    }
  };

  const handleAddBookmark = async (questionId, tag) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL+"/api/v1/users/bookmarks/add", // Replace with your actual API endpoint
        {
          questionId,
          tag,
        },
        {
          withCredentials: true
        }
      );

      setShowPopup(false); // Close the popup
      alert(response.data?.message || "Added");
    } catch (error) {
      // setMessage(error.response?.data?.message || "Error adding bookmark");
    }
  };

  const handleRemoveBookmark = async (questionId) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL+"/api/v1/users/bookmarks/remove", // Replace with your actual endpoint
        { questionId },
        {
          withCredentials: true
        }
      );
      alert(response.data.message); // Show success message
      // Remove bookmark from stat
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove bookmark");
    }
  };


  const formatTimems = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };


  const handleSubmit = () => {

  };


  useEffect(() => {
    const totalQuestions = testDetails?.questions?.length || 0;
  
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "ArrowRight" && currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) =>
          Math.min(prev + 1, totalQuestions - 1)
        );
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, testDetails?.questions?.length]);
  
  useEffect(()=>{
    if (!!testHistory && !!data) {
      const pData = getperformanceData(testHistory, data)
      setPerformanceData(pData)
    }
  },[testHistory, data])
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <>
      <div className="flex flex-col-reverse md:flex-row w-full overflow-hidden">
        {/* Left Panel: Question View */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          {testDetails && currentQuestion && (
            <>
              <h1 className="text-xl font-bold mb-4">{testDetails.title}</h1>
              <div>
                <div className="flex justify-between items-center mb-4">
                  {/* Question Details */}
                  <h2 className="text-lg font-bold">
                    Question {currentQuestionIndex + 1}/{testDetails.questions.length} (
                    {currentQuestion.subject})
                  </h2>

                  {/* Bookmark Button */}
                  <button
                    className="p-2"
                    onClick={() => setShowPopup(true)}
                  >
                    {bookmarkedQuestions.some(
                      (bookmark) =>
                        bookmark?.question?._id?.toString() === currentQuestion.id
                    ) ? (
                      <i
                        className="fa-solid fa-bookmark text-3xl text-gray-800"
                      ></i>
                    ) : (
                      <i
                        className="fa-regular fa-bookmark text-3xl text-gray-800"
                      ></i>
                    )}
                  </button>


                </div>
                <p className="mb-4">{currentQuestion.question}</p>
                {currentQuestion.isPYQ && (
                  <p className="text-sm text-gray-500">
                    (PYQ: {currentQuestion.pyqDetails.session}, {currentQuestion.pyqDetails.year} {currentQuestion.pyqDetails.examName})
                  </p>
                )}
                {currentQuestion.type === "Multiple Correct" ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option._id}
                        className={`block w-full p-2 border rounded ${currentUserQuestion?.userAnswer.includes(option.option) && option.isCorrect
                          ? "bg-green-100 text-green-800"
                          : currentUserQuestion?.userAnswer.includes(option.option)
                            ? "bg-red-100 text-red-800"
                            : option.isCorrect ? "border-2 border-green-600" : ""
                          }`}
                        disabled
                        onClick={() => handleAnswer(currentQuestion.id, option.option)}
                      >
                        {option.option}
                      </button>
                    ))}
                  </div>
                ) : currentQuestion.type === "Single Correct" ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option._id}
                        className={`block w-full p-2 border rounded ${currentUserQuestion?.userAnswer === option.option && option.isCorrect
                          ? "bg-green-100 text-green-800"
                          : currentUserQuestion?.userAnswer === option.option
                            ? "bg-red-100 text-red-800"
                            : option.isCorrect ? "border-2 border-green-600" : ""
                          }`}
                        disabled
                        onClick={() => handleAnswer(currentQuestion.id, option.option)}
                      >
                        {option.option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={`border p-2 w-full ${currentUserQuestion?.isCorrect ? 'border-green-600 bg-green-100' : 'border-red-600 bg-red-100'}`}
                    value={
                      currentUserQuestion?.isCorrect
                        ? currentUserQuestion?.userAnswer || ""
                        : `Your Answer: ${currentUserQuestion?.userAnswer || "No Answer"} | Correct Answer: ${currentQuestion?.correctValue || "N/A"}`
                    }
                    disabled
                    onChange={(e) =>
                      handleAnswer(
                        currentQuestion.id,
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                  />
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  className={`p-2 rounded ${currentQuestionIndex === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-gray-300"
                    }`}
                  disabled={currentQuestionIndex === 0}
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
                  }
                >
                  Previous
                </button>
                {currentQuestionIndex === testDetails.questions.length - 1 ? (
                  <button
                    className="p-2 bg-blue-300 text-white cursor-not-allowed rounded"
                    disabled
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="p-2 bg-blue-500 text-white rounded"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(prev + 1, testDetails.questions.length - 1)
                      )
                    }
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Timer and Navigation */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Time spent</h2>
            <p className="text-xl">{formatTimems(currentUserQuestion?.timeSpent)}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Subjects</h2>
            <select
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => {
                const selectedSubject = e.target.value;
                const firstQuestionIndex = testDetails.questions.findIndex(
                  (q) => q.subject === selectedSubject
                );
                setCurrentQuestionIndex(firstQuestionIndex);
              }}
              value={currentQuestion?.subject || ''} // Default value is the current question's subject
            >
              <option value="" disabled>Select a subject</option>
              {testDetails?.subjectSections.map((section) => (
                <option key={section.subject} value={section.subject}>
                  {section.subject}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="text-lg font-bold">Questions</h2>
            <div className="h-60 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2 mb-4">
                {testDetails?.questions.map((question, index) => (
                  <button
                    key={index}
                    className={`p-2 border rounded ${answers.find((answer) => answer?.questionId === question?.id)?.userAnswer===""
                      ? "bg-gray-300"
                      : answers.find((answer) => answer?.questionId === question?.id)?.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-600 text-white"
                      }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            {/* <button
              className="w-full p-3 bg-red-500 text-white rounded font-bold"
              onClick={handleSubmit}
            >
              Submit Test
            </button> */}
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-7xl w-full">
        {performanceData && (
        <Chart data={performanceData} />)}
      </div>
    </div>
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            {!bookmarkedQuestions.some((bookmark) => bookmark?.question?._id?.toString() === currentQuestion.id) ? (
              <>
                <h2 className="text-lg font-bold mb-4">Add a Tag</h2>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="border p-2 w-full mb-4 rounded"
                  placeholder="Enter a tag"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowPopup(false)} // Close the popup
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                      toggleBookmark(currentQuestion.id, tag); // Add bookmark with tag
                      setShowPopup(false); // Close the popup
                      setTag(""); // Clear tag input
                    }}
                    disabled={!tag.trim()} // Disable button if tag is empty
                  >
                    Add
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">Remove Bookmark</h2>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to remove the bookmark for this question?
                </p>

                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => setShowPopup(false)} // Close the popup
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => {
                      toggleBookmark(currentQuestion.id); // Remove bookmark
                      setShowPopup(false); // Close the popup
                    }}
                  >
                    Remove Bookmark
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </>
  );
};



export default TestHistory;