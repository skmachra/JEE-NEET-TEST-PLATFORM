import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Single Correct', 'Multiple Correct', 'Numerical']
    },
    options: [{
        option: {
            type: String,
            required: function () {
                return this.type !== 'Numerical';
            }
        },
        isCorrect: {
            type: Boolean,
            required: function () {
                return this.type !== 'Numerical';
            }
        }
    }],
    correctValue: {
        type: Number,
        required: function () {
            return this.type === 'Numerical';
        }
    },
    difficultyLevel: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    subject: {
        type: String,
        required: true,
        enum: ['Physics', 'Chemistry', 'Mathematics']
    },
    marks: {
        type: Number,
        required: true
    },
    negativeMarks: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    },
    isPYQ: {
        type: Boolean,
        default: false
    },
    pyqDetails: {
        examName: {
            type: String,
            required: function () { return this.isPYQ; },
        },
        year: {
            type: Number,
            required: function () { return this.isPYQ; }
        },
        session: {
            type: String,
            required: function () { return this.isPYQ; }
        }
    },
});

export const Question = mongoose.model('Question', questionSchema);
