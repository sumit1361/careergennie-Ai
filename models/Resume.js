const mongoose = require('mongoose');

const { Schema } = mongoose;

const ResumeSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rawText: {
      type: String,
      required: [true, 'Resume raw text is required'],
    },
    parsedProfile: {
      skills: {
        type: [String],
        default: [],
      },
      experienceYears: {
        type: Number,
        default: 0,
      },
    },
    aiFeedback: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      suggestions: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
