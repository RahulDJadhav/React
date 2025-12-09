const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data storage path
const dataPath = path.join(__dirname, 'data');
const coursesFile = path.join(dataPath, 'courses.json');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

// Initialize courses file if it doesn't exist
if (!fs.existsSync(coursesFile)) {
  fs.writeFileSync(coursesFile, JSON.stringify([]));
}

// Get all courses
app.get('/api/courses', (req, res) => {
  try {
    const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

// Save course
app.post('/api/courses', (req, res) => {
  try {
    const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
    const newCourse = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    courses.push(newCourse);
    fs.writeFileSync(coursesFile, JSON.stringify(courses, null, 2));
    res.json({ message: 'Course saved successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save course' });
  }
});

// Update course
app.put('/api/courses/:id', (req, res) => {
  try {
    const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf8'));
    const courseIndex = courses.findIndex(c => c.id == req.params.id);
    if (courseIndex !== -1) {
      courses[courseIndex] = { ...courses[courseIndex], ...req.body, updatedAt: new Date().toISOString() };
      fs.writeFileSync(coursesFile, JSON.stringify(courses, null, 2));
      res.json({ message: 'Course updated successfully', course: courses[courseIndex] });
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});