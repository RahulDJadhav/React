import React, { useState, useEffect } from 'react';
import './HomePage.css';

const HomePage = ({ onCreateCourse, onEditCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCourse, setPreviewCourse] = useState(null);


  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    try {
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      setCourses(savedCourses);
    } catch (error) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (previewCourse) {
    return (
      <div className="course-preview">
        <div className="preview-header">
          <h1>Course Preview</h1>
          <button onClick={() => setPreviewCourse(null)} className="btn-back">← Back to Home</button>
        </div>
        <div className="preview-content">
          <h1 className="course-title">{previewCourse.title || 'Untitled Course'}</h1>
          <div className="course-meta">
            <span className="category">{previewCourse.category}</span>
            <span className="duration">{previewCourse.duration} hours</span>
          </div>
          <p className="course-description">{previewCourse.description}</p>
          <div className="course-content" dangerouslySetInnerHTML={{ __html: previewCourse.content }} />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-brand">
          <img src="/LEAi_Logo.svg" alt="LearnExpert" className="header-logo" />
          <h1>LearnExpert - Course Creator</h1>
        </div>
        <button onClick={onCreateCourse} className="btn-create-course">
          <i className="fas fa-plus"></i> Create New Course
        </button>
      </header>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-graduation-cap"></i>
            <h3>No courses yet</h3>
            <p>Create your first course to get started</p>
            <button onClick={onCreateCourse} className="btn-create-first">
              Create Course
            </button>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.title || 'Untitled Course'}</h3>
                <div className="course-meta">
                  <span className="category">{course.category}</span>
                  <span className="duration">{course.duration}h</span>
                </div>
              </div>
              <p className="course-description">
                {course.description || 'No description available'}
              </p>
              <div className="course-actions">
                <button onClick={() => onEditCourse(course)} className="btn-edit">
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button onClick={() => setPreviewCourse(course)} className="btn-view">
                  <i className="fas fa-eye"></i> View
                </button>
              </div>
              <div className="course-date">
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;