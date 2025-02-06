export const getperformanceData = (testHistory, test) => {

  const calculateSubjectWiseData = (answers, subjectSections) => {
    const subjectWise = {};

    subjectSections.forEach(subject => {
      const subjectName = subject.subject;
      const questions = subject.questions;

      // Calculate total marks for the subject
      const totalMarks = questions.reduce((sum, q) => {
        const marks = Number(q.marks); // Convert marks to number to handle invalid values
        return isNaN(marks) ? sum : sum + marks; // Only add if marks is a valid number
      }, 0);

      let correct = 0, incorrect = 0, notAttempted = 0, marks = 0, timeSpent = 0;

      questions.forEach(question => {
        const answer = answers.find(a => a.questionId === question.id.toString()); // Assuming answer contains question._id

        if (answer) {
          if (answer.userAnswer === "") {
            notAttempted++;
          } else if (answer.isCorrect) {
            correct++;
            marks += question.marks; // Add marks for correct answers
          } else {
            incorrect++;
            marks -= question.negativeMarks || 0; // Subtract marks for incorrect answers
          }
          // Time spent is in milliseconds, convert to seconds first
          timeSpent += parseInt(answer.timeSpent, 10) || 0;
        } else {
          notAttempted++;
        }
      });

      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(2) : 0;

      subjectWise[subjectName] = {
        marks,
        totalMarks,
        accuracy: parseFloat(accuracy),
        timeSpent: (timeSpent / 60000).toFixed(2), // Convert milliseconds to minutes
        status: { correct, incorrect, notAttempted },
      };
    });

    return subjectWise;
  };

  const calculateDifficultyWiseData = (answers, subjectSections) => {
    const difficultyWise = {};

    // Flatten all questions from subjectSections into a single array
    const allQuestions = subjectSections.flatMap(subject => subject.questions);

    allQuestions.forEach(question => {
      const difficulty = question.difficultyLevel;
      const answer = answers.find(a => a.questionId === question.id.toString());

      if (!difficultyWise[difficulty]) {
        difficultyWise[difficulty] = {
          totalQuestions: 0,
          avgTime: 0,
          correct: 0,
          incorrect: 0,
          notAttempted: 0,
        };
      }

      difficultyWise[difficulty].totalQuestions++;

      if (answer) {
        if (answer.userAnswer === "") {
          difficultyWise[difficulty].notAttempted++;
        } else if (answer.isCorrect) {
          difficultyWise[difficulty].correct++;
        } else {
          difficultyWise[difficulty].incorrect++;
        }
        difficultyWise[difficulty].avgTime += Number(answer.timeSpent) || 0; // Add time spent
      } else {
        difficultyWise[difficulty].notAttempted++;
      }
    });

    // Calculate the average time for each difficulty level (convert from milliseconds to minutes)
    for (const difficulty in difficultyWise) {
      const data = difficultyWise[difficulty];
      data.avgTime = data.totalQuestions > 0
        ? (data.avgTime / (data.totalQuestions * 60000)).toFixed(2)  // Convert milliseconds to minutes
        : 0;
    }

    return difficultyWise;
  };

  const calculateTimeSpentOnEachQuestion = (answers, subjectSections) => {
    const timeSpentOnEachQuestion = {};

    // Flatten all questions into a single array
    const allQuestions = subjectSections.flatMap(subject => subject.questions);

    allQuestions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id.toString());

      if (answer) {
        const timeSpentInMinutes = Number(answer.timeSpent) / 60000; // Convert milliseconds to minutes
        timeSpentOnEachQuestion[question.question] = timeSpentInMinutes.toFixed(2);
      }
    });

    return timeSpentOnEachQuestion;
  };

  const subjectwise = calculateSubjectWiseData(testHistory.answers, test.subjectSections);
  const difficultywise = calculateDifficultyWiseData(testHistory.answers, test.subjectSections);
  const timeSpent = calculateTimeSpentOnEachQuestion(testHistory.answers, test.subjectSections);

  return {
    subjectWise: subjectwise,
    difficultyWise: difficultywise,
    timeSpentOnEachQuestion: timeSpent
  };
};
