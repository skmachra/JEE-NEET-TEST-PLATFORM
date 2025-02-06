import React, { useState } from "react";
import axios from "axios";

const QuestionUploadForm = () => {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("Single Correct");
  const [options, setOptions] = useState([{ option: "", isCorrect: false }]);
  const [correctValue, setCorrectValue] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState("Easy");
  const [subject, setSubject] = useState("Physics");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [isPYQ, setIsPYQ] = useState(false);
  const [pyqDetails, setPyqDetails] = useState({
    examName: "",
    year: "",
    session: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
  
    if (field === "isCorrect") {
      if (type === "Single Correct") {
        // If the question type is Single Correct, uncheck other options
        updatedOptions.forEach((option, i) => {
          if (i !== index) option.isCorrect = false;
        });
      }
    }
  
    updatedOptions[index][field] = value;
    setOptions(updatedOptions);
  };
  ;

  const handleAddOption = () => {
    setOptions([...options, { option: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("question", question);
    formData.append("type", type);
    formData.append("options", JSON.stringify(options)); // Assuming options is an array of options
    formData.append("correctValue", correctValue);
    formData.append("difficultyLevel", difficultyLevel);
    formData.append("subject", subject);
    formData.append("marks", marks);
    formData.append("negativeMarks", negativeMarks);
    
    // Only add pyqDetails if isPYQ is true
    if (isPYQ) {
      formData.append("isPYQ", true);
      formData.append("pyqDetails", JSON.stringify(pyqDetails)); // Assuming pyqDetails is an object
    } else {
      formData.append("isPYQ", false);
    }
  
    if (image) {
      formData.append("image", image);
    }
  
    try {
      const response = await axios.post("/api/v1/admin/question", formData, {
        withCredentials: true, // Ensures cookies are sent for authentication
      });
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };
  
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">Upload Question</h2>
      <form onSubmit={handleSubmit}>
        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        {/* Question Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Question Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="Single Correct">Single Correct</option>
            <option value="Multiple Correct">Multiple Correct</option>
            <option value="Numerical">Numerical</option>
          </select>
        </div>

        {/* Options for MCQ */}
        {type !== "Numerical" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option.option}
                  onChange={(e) => handleOptionChange(index, "option", e.target.value)}
                  className="w-2/3 p-2 border rounded mt-1"
                  required
                />
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                  className="ml-2"
                />
                <span className="ml-2 text-sm text-gray-500">Correct?</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-blue-500"
            >
              Add Option
            </button>
          </div>
        )}

        {/* Correct Value for Numerical Question */}
        {type === "Numerical" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Correct Value</label>
            <input
              type="number"
              value={correctValue}
              onChange={(e) => setCorrectValue(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        )}

        {/* Difficulty Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
        </div>

        {/* Marks and Negative Marks */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Negative Marks</label>
            <input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        </div>

        {/* PYQ Details */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Is this a Previous Year Question?</label>
          <input
            type="checkbox"
            checked={isPYQ}
            onChange={(e) => setIsPYQ(e.target.checked)}
            className="mr-2"
          />
          <span>Yes</span>
        </div>
        {isPYQ && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">PYQ Details</label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Exam Name"
                value={pyqDetails.examName}
                onChange={(e) => setPyqDetails({ ...pyqDetails, examName: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Year"
                value={pyqDetails.year}
                onChange={(e) => setPyqDetails({ ...pyqDetails, year: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Session"
                value={pyqDetails.session}
                onChange={(e) => setPyqDetails({ ...pyqDetails, session: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Question Image If Required</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* Submit Button */}
        <div className="mb-4 text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload Question"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionUploadForm;
