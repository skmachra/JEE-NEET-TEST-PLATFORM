import { asynchandler } from "../utils/asynchndler.js";
import { Test } from "../models/test.model.js";
import { User } from "../models/user.model.js";


export const getTestDetails = asynchandler(async (req, res) => {
    const { id } = req.params;

    const test = await Test.findById(id).populate({
        path: 'subjectSections.questions',
        model: 'Question',
    });

    if (test) {
        res.json({
            title: test.title,
            duration: test.duration,
            subjects: test.subjects,
            subjectSections: test.subjectSections.map((section) => ({
                subject: section.subject,
                totalMarks: section.totalMarks,
                questions: section.questions.map((q) => ({
                    id: q._id,
                    question: q.question,
                    type: q.type,
                    options: q.type !== 'Numerical' ? q.options : undefined,
                    correctValue: q.type === 'Numerical' ? q.correctValue : undefined,
                    difficultyLevel: q.difficultyLevel,
                    subject: q.subject,
                    isPYQ: q.isPYQ,
                    marks: q.marks,
                    negativeMarks: q.negativeMarks,
                    pyqDetails: q.isPYQ ? q.pyqDetails : undefined,
                    image: q.image ? q.image : undefined,
                })),
            })),
            totalMarks: test.totalMarks,
            difficultyLevel: test.difficultyLevel,
            description: test.description,
            type: test.type,
        });
    } else {
        res.status(404).json({ message: "Test not found" });
    }
});

export const submitTest = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { answers, questionTimes } = req.body;

    // Fetch the test with populated questions
    const test = await Test.findById(id).populate("subjectSections.questions");
    if (!test) {
        res.status(404).json({ message: "Test not found" });
        return;
    }

    let score = 0;
    const questionResults = test.subjectSections.flatMap(section =>
        section.questions.map((question) => {
            const userAnswer = answers[question._id.toString()] || ""; // Match answer by question ID
            let correctAnswers = [];
            let marksForQuestion = question.marks || 0; // Default marks for the question

            // Check the question type and extract correct answers accordingly
            if (question.type === "Numerical") {
                correctAnswers = question.correctValue ? [question.correctValue] : [];
            } else {
                correctAnswers = question.options
                    ?.filter((option) => option.isCorrect)
                    .map((option) => option.option) || [];
            }

            // Determine if the answer is correct
            const epsilon = 1e-10; // Tolerance for numerical comparisons
            const isCorrect = Array.isArray(userAnswer)
                ? JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort())
                : correctAnswers.some((correctAnswer) => {
                    const numCorrect = parseFloat(correctAnswer);
                    const numUser = parseFloat(userAnswer);
                    if (!isNaN(numCorrect) && !isNaN(numUser)) {
                        return Math.abs(numCorrect - numUser) < epsilon;
                    }
                    return correctAnswer.toString().trim() === userAnswer.toString().trim();
                });

            let questionScore = 0;
            if (userAnswer === "") {
                // Unanswered questions score 0
                questionScore = 0;
            } else if (isCorrect) {
                // Correct answer, add marks for the question
                questionScore = marksForQuestion;
            } else {
                // Incorrect answer, subtract negative marks
                questionScore = -question.negativeMarks;
            }

            // Add the question score to the total score
            score += questionScore;

            const correctAnswer = Array.isArray(correctAnswers) ? JSON.stringify(correctAnswers.sort()) : correctAnswers[0];
            const timeSpent = questionTimes[question._id.toString()] || 0;

            return { questionId: question._id, isCorrect, question: question.question, correctAnswer, userAnswer, timeSpent, scoreForQuestion: questionScore };
        })
    );

    // Save test results to user's test history
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    // Remove existing test history for the same test, if it exists
    const existingTestIndex = user.testHistory.findIndex(history => history.test.toString() === id);
    if (existingTestIndex !== -1) {
        user.testHistory.splice(existingTestIndex, 1); // Remove the old history
    }

    // Add the new test history
    user.testHistory.push({ test: id, score, answers: questionResults });
    await user.save();

    res.json({ score, questionResults });
});

export const getTestHistories = asynchandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("testHistory.test");

    const history = user.testHistory.map((entry) => ({
        testId: entry.test._id,
        testTitle: entry.test.title,
        score: entry.score,
        dateTaken: entry.date,
        answers: entry.answers
    }));

    res.json(history);
});

export const getTestHistory = asynchandler(async (req, res) => {
    const { id } = req.params; // Extract the testId from request params

    // Fetch the user and populate the test history
    const user = await User.findById(req.user.id).populate("testHistory.test");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Find the specific test history
    const testHistory = user.testHistory.find(
        (entry) => entry.test?._id.toString() === id
    );

    if (!testHistory) {
        res.status(404);
        throw new Error("Test history not found for the given test ID");
    }

    // Structure the response
    const response = {
        testId: testHistory.test._id,
        testTitle: testHistory.test.title,
        score: testHistory.score,
        dateTaken: testHistory.date,
        answers: testHistory.answers,
    };

    res.json(response); // Send the response
});

export const deleteTestHistory = asynchandler(async (req, res) => {
    const { id } = req.params; // Extract the testId from request params

    // Fetch the user
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Find the index of the test history to delete
    const historyIndex = 0;

    if (historyIndex === -1) {
        res.status(404);
        throw new Error("Test history not found for the given test ID");
    }

    // Remove the test history entry
    user.testHistory.splice(historyIndex, 1);

    // Save the updated user
    await user.save();

    res.json({ message: "Test history deleted successfully" }); // Send the response
});

export const getTest = asynchandler(async (req, res) => {
    try {
      const currentDate = new Date();
      const availableTests = await Test.find({
        $or: [
          { scheduledDate: { $exists: false } },  // No scheduledDate
          { scheduledDate: { $lte: currentDate } }  // Or scheduledDate is in the past or now
        ]
      });
      
  
      if (availableTests.length === 0) {
        return res.status(404).json({ message: "No available tests found" });
      }
  
      res.status(200).json(availableTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available tests", error: error.message });
    }
  });
  

export const getUpcomingTest = asynchandler(async (req, res) => {
    try {
      const currentDate = new Date();
      const upcomingTests = await Test.find({ scheduledDate: { $exists: true, $gt: currentDate } });
  
      if (upcomingTests.length === 0) {
        return res.status(404).json({ message: "No upcoming tests found" });
      }
      res.status(200).json(upcomingTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming tests", error: error.message });
    }
  });
