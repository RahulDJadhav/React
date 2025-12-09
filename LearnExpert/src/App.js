import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CourseCreator from './components/CourseCreator';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [editingCourse, setEditingCourse] = useState(null);

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setCurrentView('create');
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCurrentView('create');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setEditingCourse(null);
  };

  return (
    <div className="App">
      {currentView === 'home' ? (
        <HomePage 
          onCreateCourse={handleCreateCourse}
          onEditCourse={handleEditCourse}
        />
      ) : (
        <CourseCreator 
          editingCourse={editingCourse}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;