import { asynchandler } from "../utils/asynchndler.js";
import { Question } from "../models/question.model.js";
import { User } from "../models/user.model.js";
import { Test } from "../models/test.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const addQuestion = asynchandler(async (req, res) => {
    const {
        question,
        type,
        options,
        correctValue,
        difficultyLevel,
        subject,
        isPYQ,
        pyqDetails,
        marks,
        negativeMarks,
    } = req.body;

    const parsedOptions = options ? JSON.parse(options) : undefined; // Convert options string to array
    const parsedPyqDetails = pyqDetails ? JSON.parse(pyqDetails) : undefined; // Convert pyqDetails string to object
    const isPYQBoolean = isPYQ === "true"; // Convert string boolean to actual boolean
    const parsedMarks = marks ? Number(marks) : undefined; // Convert marks string to number
    const parsedNegativeMarks = negativeMarks ? Number(negativeMarks) : undefined; // Convert negative marks to number

    // Validation for options based on question type
    if (type === "Numerical" && correctValue == null) {
        return res
            .status(400)
            .json({ message: "Numerical questions require a correct value." });
    }

    if (
        (type === "Single Correct" || type === "Multiple Correct") &&
        (!parsedOptions || parsedOptions.length === 0)
    ) {
        return res.status(400).json({ message: "Options are required for MCQ questions." });
    }

    // Validate PYQ details if isPYQ is true
    if (
        isPYQBoolean &&
        (!parsedPyqDetails || !parsedPyqDetails.examName || !parsedPyqDetails.year || !parsedPyqDetails.session)
    ) {
        return res.status(400).json({ message: "Complete PYQ details are required." });
    }

    let imagePath;
    
    if (req.file) {
        imagePath = req.file.path;
    }


    let image;
    if (imagePath) {
        image = await uploadOnCloudinary(imagePath);
    }

    // Create the new question
    
    const newQuestion = new Question({
        question,
        type,
        options: type === "Numerical" ? undefined : parsedOptions,
        correctValue: type === "Numerical" ? correctValue : undefined,
        difficultyLevel,
        subject,
        isPYQ: isPYQBoolean,
        pyqDetails: isPYQBoolean ? parsedPyqDetails : undefined,
        marks: parsedMarks,
        negativeMarks: parsedNegativeMarks,
        image: image ? image.url : undefined,
    });

    // Save the question to the database
    await newQuestion.save();

    res.status(201).json({ message: "Question added successfully", question: newQuestion });
});


export const getQuestions = asynchandler(async (req, res) => {
    const questions = await Question.find({});
    res.json(questions);
})

export const getQuestionById = asynchandler(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (question) {
        res.json(question);
    } else {
        res.status(404).json({ message: "Question not found" });
    }
})

export const updateQuestion = asynchandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.marks) updates.marks = Number(updates.marks);
    if (updates.negativeMarks) updates.negativeMarks = Number(updates.negativeMarks);
    if (updates.correctValue) updates.correctValue = Number(updates.correctValue);
    
    // Convert boolean string to actual boolean
    if (updates.isPYQ) updates.isPYQ = updates.isPYQ === 'true';

    // Parse JSON strings to objects
    try {
        if (updates.options) updates.options = JSON.parse(updates.options);
        if (updates.pyqDetails) updates.pyqDetails = JSON.parse(updates.pyqDetails);
    } catch (error) {
        return res.status(400).json({ 
            message: "Invalid JSON format in options or PYQ details",
            error: error.message
        });
    }

    // Handle image upload
    if (req.file) {
        try {
            const imagePath = req.file.path;
            const image = await uploadOnCloudinary(imagePath);
            updates.image = image.url;
        } catch (error) {
            console.error("Image upload failed:", error);
            return res.status(500).json({ message: "Image upload failed" });
        }
    }

    // Update question in database
    try {
        const question = await Question.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({
            message: "Question updated successfully",
            question: {
                ...question._doc,
            }
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(400).json({
            message: "Update failed",
            error: error.message
        });
    }
});


export const deleteQuestion = asynchandler(async (req, res) => {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (question) {
        res.json({ message: "Question deleted successfully" });
    } else {
        res.status(404).json({ message: "Question not found" });
    }
});

export const getAllUsers = asynchandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    res.json(users);
});


export const manageTest = asynchandler(async (req, res) => {
    const {
        title,
        description,
        testType,
        questions,
        duration,
        totalMarks,
        difficultyLevel,
    } = req.body;

    // Validate if all required fields are provided
    if (
        !title ||
        !description ||
        !testType ||
        !questions ||
        !Array.isArray(questions) || questions.length === 0 ||
        !duration ||
        !totalMarks ||
        !difficultyLevel
    ) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Retrieve questions based on the provided question IDs
    const validQuestions = await Question.find({ _id: { $in: questions } });
    if (validQuestions.length !== questions.length) {
        return res.status(400).json({
            message: "One or more question IDs are invalid.",
        });
    }

    // Group questions by their subject
    const subjectSections = [];
    const subjectMap = {};

    validQuestions.forEach((question) => {
        const subject = question.subject;

        if (!subjectMap[subject]) {
            subjectMap[subject] = [];
        }

        subjectMap[subject].push(question._id);
    });

    // Create the subject sections dynamically based on the grouped questions
    Object.keys(subjectMap).forEach((subject) => {
        subjectSections.push({
            subject: subject,
            questions: subjectMap[subject],
        });
    });

    // Calculate the total marks by summing the marks of all the questions
    

    // If the totalMarks provided doesn't match the calculated total marks
   

    // Create the test
    const newTest = new Test({
        title,
        description,
        testType,
        duration,
        totalMarks,
        difficultyLevel,
        subjectSections,
    });

    await newTest.save();

    res.status(201).json({
        message: "Test created successfully",
        test: newTest,
    });
});
export const deleteTest = asynchandler(async (req, res) => {
    const { id } = req.params;

    const test = await Test.findByIdAndDelete(id);

    if (test) {
        res.json({ message: "Test deleted successfully" });
    } else {
        res.status(404).json({ message: "Test not found" });
    }
});
export const updatedTest = asynchandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const test = await Test.findByIdAndUpdate(id, updates, { new: true });
    if (test) {
        res.json({ message: "Test updated successfully", test });
    } else {
        res.status(404).json({ message: "Test not found" });
    }
}
);


export const getReports = asynchandler(async (req, res) => {
    const tests = await Test.find().populate("questions");

    const reports = tests.map((test) => ({
        testTitle: test.title,
        totalQuestions: test.questions.length,
        subjects: test.subjects,
    }));

    res.json(reports);
});
