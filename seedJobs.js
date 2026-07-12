const mongoose = require("mongoose");
require("dotenv").config();

const Job = require("./models/Job");
const User = require("./models/User");

const jobs = [
  {
    title: "Machine Learning Engineer",
    description:
      "Build and deploy machine learning models using Python, TensorFlow and cloud platforms.",
    requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
  },
  {
    title: "Full Stack Developer",
    description:
      "Develop scalable web applications using React, Node.js and MongoDB.",
    requiredSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
  },
  {
    title: "Data Scientist",
    description:
      "Analyze large datasets and create predictive models.",
    requiredSkills: ["Python", "Pandas", "Scikit-learn", "Statistics"],
  },
  {
    title: "Backend Developer",
    description:
      "Create REST APIs and backend services.",
    requiredSkills: ["Node.js", "Express", "MongoDB", "API"],
  },
  {
    title: "Frontend Developer",
    description:
      "Build modern user interfaces with React.",
    requiredSkills: ["React", "JavaScript", "CSS", "HTML"],
  }
];

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Infosys",
  "TCS",
  "Accenture",
  "Deloitte",
  "Wipro",
  "IBM",
  "Adobe"
];

const locations = [
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Delhi",
  "Mumbai",
  "Remote"
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    let recruiter = await User.findOne({ role: "recruiter" });

    if (!recruiter) {
      recruiter = await User.create({
        name: "Demo Recruiter",
        email: "demo.recruiter@careergenie.com",
        password: "password123",
        role: "recruiter",
      });

      console.log("Demo recruiter created");
    }

    await Job.deleteMany();

    let jobList = [];

    for (let i = 0; i < 50; i++) {

      const template = jobs[i % jobs.length];

      jobList.push({
        recruiterId: recruiter._id,
        title: `${template.title} - ${companies[i % companies.length]}`,
        description:
          template.description +
          ` Location: ${locations[i % locations.length]}.`,
        requiredSkills: template.requiredSkills,
        deadline: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        status: "approved",
      });
    }

    await Job.insertMany(jobList);

    console.log("50 demo jobs inserted successfully");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();