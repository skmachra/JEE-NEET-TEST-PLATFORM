import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useMessage } from "../components/Message";
const TestTakingPage = () => {
  // States
  const showMessage = useMessage();
  const [testDetails, setTestDetails] = useState(null);
  const [data, setData] = useState(null); // For storing test details data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // For error handling
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // Example: 60 minutes = 3600 seconds
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [questionTimes, setQuestionTimes] = useState({}); // Stores time spent on each question
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const [showPopup, setShowPopup] = useState(false);
  const [submitPopup, setSubmitPopup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tag, setTag] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();




  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);



  const currentQuestion = testDetails?.questions[currentQuestionIndex];

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
      showMessage(error.response?.data?.message || "Failed to fetch test details", "error");
      console.error("Error fetching test details:", error.response?.data?.message || error.message);
      throw error; // Throw error to handle it in the calling function
    }
  };
  useEffect(() => {
    if (!currentQuestion) return;

    const now = Date.now();

    // Calculate time spent on the previous question
    if (lastChangeTime && currentQuestion?.id) {
      const timeSpent = now - lastChangeTime;

      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent,
      }));
    }

    // Update the last change time
    setLastChangeTime(now);

    // Clean up if necessary (e.g., reset timers)
  }, [currentQuestion?.id, data]);

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const data = await getTestDetails(id); // Call the API function
        setData(data); // Store the test details in state
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch test details");
        setLoading(false);
      }
    };

    fetchTestDetails();
    const fetchBookmarks = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL+"/api/v1/users/bookmarks", {
          withCredentials: true
        });
        console.log(response);

        setBookmarkedQuestions(response.data.bookmarks); // Assuming bookmarks are objects with `question` and `tag`
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
  // const currentQuestion = testDetails?.questions[currentQuestionIndex];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      (bookmark) => bookmark.question._id.toString() === questionId
    );

    if (isBookmarked) {
      // Remove bookmark
      setBookmarkedQuestions((prevBookmarks) =>
        prevBookmarks.filter((bookmark) => bookmark.question._id.toString() !== questionId)
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
      showMessage(error.response?.data?.message || "Error adding bookmark", "error");
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


  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const submitTest = async (testId, answers, questionTimes) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL+`/api/v1/tests/${testId}/submit`,
        { answers, questionTimes },
        {
          withCredentials: true, // Ensures cookies (for authentication) are sent
        }
      );
      setIsSubmitted(true); // Set flag to indicate test has been submitted
      console.log("Test submitted successfully:", response.data);
      return response.data; // Contains score and question results
    } catch (error) {
      console.error("Error submitting test:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const formatTimems = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  const handleSubmit = () => {
    const now = Date.now();
    if (currentQuestion?.id) {
      const timeSpent = now - lastChangeTime;

      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent,
      }));
    }
    console.log("Final time spent on each question:", questionTimes);
    Object.entries(questionTimes).forEach(([questionId, timeSpent]) => {
      console.log(`Question ${questionId}: ${formatTimems(timeSpent)}`);
    });
    submitTest(id, answers, questionTimes);
    console.log("Answers:", answers);
    console.log("Marked for Review:", markedForReview);
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "ArrowRight" && currentQuestionIndex < testDetails?.questions.length - 1) {
        setCurrentQuestionIndex((prev) =>
          Math.min(prev + 1, testDetails?.questions.length - 1)
        );
      }
      if (e.key === "Enter" && currentQuestionIndex === testDetails?.questions.length - 1) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, setCurrentQuestionIndex, testDetails?.questions.length, handleSubmit]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Thank you, Your Test Submitted Successfully.
          </h2>
          <button
            onClick={() => {
              navigate(`/test/history/${id}`);
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600 transition"
          >
            View Result
          </button>
        </div>
      </div>
    );
  }

  
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
                {currentQuestion.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question Diagram"
                    className="lg:w-1/3 w-4/5 h-auto mb-4"
                  />
                )}
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
                        className={`block w-full p-2 border rounded ${answers[currentQuestion.id]?.includes(option.option)
                          ? "bg-blue-500 text-white"
                          : ""
                          }`}
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
                        className={`block w-full p-2 border rounded ${answers[currentQuestion.id] === option.option
                          ? "bg-blue-500 text-white"
                          : ""
                          }`}
                        onClick={() => handleAnswer(currentQuestion.id, option.option)}
                      >
                        {option.option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="border p-2 w-full"
                    placeholder="Enter numerical value"
                    value={answers[currentQuestion.id] || ""}
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
                <button
                  className="p-2 bg-yellow-300 rounded"
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                >
                  {markedForReview[currentQuestion.id] ? "Unmark" : "Mark for Review"}
                </button>
                {currentQuestionIndex === testDetails.questions.length - 1 ? (
                  <button
                    className="p-2 bg-red-500 text-white rounded"
                    onClick={() => setSubmitPopup(true)}
                  >
                    Submit
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
            <h2 className="text-lg font-bold">Time left</h2>
            <p className="text-xl">{formatTime(timeLeft)}</p>
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
                    className={`p-1 border h-[40px] w-[40px] ${answers[question.id] !== undefined &&
                      answers[question.id] !== null &&
                      markedForReview[question.id]
                      ? "bg-[#5B2CA5] rounded-full relative text-white"
                      : answers[question.id] !== undefined &&
                        answers[question.id] !== null
                        ? "bg-[#2EB800] costom-clip text-white"
                        : markedForReview[question.id]
                          ? "bg-[#5B2CA5] rounded-full text-white"
                          : questionTimes[question.id] > 0
                            ? "bg-[#E24401] text-white costom-clip" //visited not answered
                            : "bg-[#E3E3E3] rounded" //not visited
                      }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {answers[question.id] !== undefined &&
                      answers[question.id] !== null &&
                      markedForReview[question.id] && (
                        <div
                          className="absolute w-[14px] h-[14px] right-[3px] top-[21px] rounded-full bg-[#18FF00] "
                        >''</div>
                      )}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="w-full p-3 bg-red-500 text-white rounded font-bold"
              onClick={() => setSubmitPopup(true)}
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            {!bookmarkedQuestions.some((bookmark) => bookmark?.question?._id.toString() === currentQuestion.id) ? (
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
      {submitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6">
            <h2 className="text-xl font-bold text-center mb-4">Exam Summary</h2>

            <div className="overflow-x-auto">
              <table className="table-auto w-full text-center border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">No of Questions</th>
                    <th className="border border-gray-300 px-4 py-2">Answered</th>
                    <th className="border border-gray-300 px-4 py-2">Not Answered</th>
                    <th className="border border-gray-300 px-4 py-2">Marked for Review</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Answered & Marked for Review
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">{testDetails?.questions.length}</td>
                    <td className="border border-gray-300 px-4 py-2">{Object.keys(answers).filter(key => answers[key] != null).length}</td>
                    <td className="border border-gray-300 px-4 py-2">{Object.keys(questionTimes).filter(key => questionTimes[key] != 0).length - Object.keys(answers).filter(key => answers[key] != null).length}</td>
                    <td className="border border-gray-300 px-4 py-2">{Object.keys(markedForReview).filter(key => markedForReview[key] != false).length}</td>
                    <td className="border border-gray-300 px-4 py-2">{Object.keys(answers).filter(id => answers[id] !== null && markedForReview[id] === true).length}</td>
                    <td className="border border-gray-300 px-4 py-2">{testDetails?.questions.length - Object.keys(questionTimes).filter(key => questionTimes[key] != 0).length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-center text-gray-700 font-semibold">
              Are you sure you want to submit for final marking? <br />
              <span className="text-sm font-normal">
                No changes will be allowed after submission.
              </span>
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setSubmitPopup(false)}
                className="bg-red-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-red-600 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default TestTakingPage;
