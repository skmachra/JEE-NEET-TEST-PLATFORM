import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    testType: {
        type: String,
        required: true,
        enum: ['JEE', 'NEET'] // Determines the type of test
    },
    subjects: [{
        type: String,
        required: true,
        enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] // Subjects available for the test
    }],
    subjectSections: [{
        subject: {
            type: String,
            required: true,
            enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
        },
        questions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        }],
        totalMarks: {
            type: Number,
            required: false
        }
    }],
    duration: {
        type: Number,
        required: true // Duration in minutes
    },
    totalMarks: {
        type: Number,
        required: true
    },
    difficultyLevel: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export const Test = mongoose.model('Test', testSchema);
