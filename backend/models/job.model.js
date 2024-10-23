import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['フルタイム', 'パートタイム', '契約社員', 'フリーランス', 'その他']
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['正社員', '契約社員', 'パート・アルバイト', '派遣社員', 'その他']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['新卒', '1-3年', '3-5年', '5年以上', '不問']
  },
  educationLevel: {
    type: String,
    enum: ['高校卒', '専門学校卒', '大学卒', '大学院卒', '不問']
  },
  applicationDeadline: {
    type: Date
  },
  jobUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);

export default Job;