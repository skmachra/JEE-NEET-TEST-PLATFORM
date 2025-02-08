import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageTestPage = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupQuestion, setPopupQuestion] = useState(null);
  const [testDetails, setTestDetails] = useState({
    title: "",
    description: "",
    testType: "JEE",
    duration: "",
    totalMarks: 0, // Initialize totalMarks as 0
    difficultyLevel: "Easy",
  });

  // New states for filters
  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  // Fetch questions from the API
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL+"/api/v1/admin/questions", {
        withCredentials: true,
      }) // Replace with your questions API endpoint
      .then((response) => {
        console.log(response.data);
        setQuestions(response.data);
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestDetails({ ...testDetails, [name]: value });
  };

  // Toggle question selection
  const toggleQuestionSelection = (question) => {
    let updatedQuestions = [...selectedQuestions];
    const existingIndex = updatedQuestions.findIndex((q) => q._id === question._id);

    if (existingIndex >= 0) {
      updatedQuestions.splice(existingIndex, 1); // Remove question if already selected
    } else {
      updatedQuestions.push(question); // Add question if not selected
    }

    // Update selected questions and recalculate total marks
    setSelectedQuestions(updatedQuestions);

    const totalMarks = updatedQuestions.reduce((sum, selectedQuestion) => sum + selectedQuestion.marks, 0);
    setTestDetails((prevDetails) => ({
      ...prevDetails,
      totalMarks: totalMarks, // Dynamically update totalMarks
    }));
  };

  // Filter questions based on subject and difficulty
  const filteredQuestions = questions.filter((question) => {
    const subjectMatch = subjectFilter ? question.subject === subjectFilter : true;
    const difficultyMatch = difficultyFilter ? question.difficultyLevel === difficultyFilter : true;
    return subjectMatch && difficultyMatch;
  });

  // Submit test
  const handleSubmit = () => {
    if (!testDetails.title || !testDetails.description || selectedQuestions.length === 0) {
      alert("Please fill all required fields and select at least one question.");
      return;
    }

    const testPayload = {
      ...testDetails,
      questions: selectedQuestions.map((q) => q._id), // Store only question IDs
    };

    axios
      .post(import.meta.env.VITE_API_URL+"/api/v1/admin/manage-test", testPayload ,{
        withCredentials: true
      }) // Replace with your test creation API endpoint
      .then((response) => {
        alert("Test created successfully!");
        setTestDetails({
          title: "",
          description: "",
          testType: "JEE",
          duration: "",
          totalMarks: 0, // Reset total marks after successful submission
          difficultyLevel: "Easy",
        });
        setSelectedQuestions([]);
      })
      .catch((error) => console.error("Error creating test:", error));
  };

  const openDetailsPopup = (question) => {
    setPopupQuestion(question);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupQuestion(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Test</h1>

      {/* Test Form */}
      <div className="mb-6 p-4 border rounded shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            placeholder="Test Title"
            value={testDetails.title}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <input
            name="description"
            placeholder="Description"
            value={testDetails.description}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <select
            name="testType"
            value={testDetails.testType}
            onChange={(e) => setTestDetails({ ...testDetails, testType: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
          </select>
          <input
            name="duration"
            type="number"
            placeholder="Duration (in minutes)"
            value={testDetails.duration}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <input
            name="totalMarks"
            type="number"
            value={testDetails.totalMarks}
            readOnly
            className="border p-2 rounded"
          />
          <select
            name="difficultyLevel"
            value={testDetails.difficultyLevel}
            onChange={(e) => setTestDetails({ ...testDetails, difficultyLevel: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Filters */}

      {/* Questions List */}
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
            className={`border p-4 rounded shadow-md ${selectedQuestions.some((q) => q._id === question._id) ? "border-blue-500" : ""}`}
          >
            <p className="font-bold">{question.question}</p>
            <p>Subject: {question.subject}</p>
            <p>Difficulty: {question.difficultyLevel}</p>
            <p>Marks: {question.marks}</p>

            {/* Add/Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleQuestionSelection(question);
              }}
              className={`mt-2 mr-2 ${selectedQuestions.some((q) => q._id === question._id) ? "bg-red-500" : "bg-green-500"} text-white px-4 py-2 rounded`}
            >
              {selectedQuestions.some((q) => q._id === question._id) ? "Remove" : "Add"}
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

      {/* Submit Button */}
      <div className="mt-6">
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-6 py-2 rounded">
          Create Test
        </button>
      </div>

      {/* Popup */}
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
    </div>
  );
};

export default ManageTestPage;
