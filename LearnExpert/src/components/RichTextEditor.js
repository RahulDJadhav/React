import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Start writing your course content..." }) => {
  const [mode, setMode] = useState('visual');
  
  const handleChange = useCallback((content) => {
    onChange(content);
  }, [onChange]);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const quill = document.querySelector('.ql-editor');
          const range = quill.getSelection ? quill.getSelection() : { index: 0 };
          const img = `<img src="${reader.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`;
          
          // Insert the image at cursor position
          const currentContent = value || '';
          const newContent = currentContent + img;
          onChange(newContent);
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image', 'align'
  ];

  return (
    <div className="wp-editor-container">
      <div className="wp-editor-tabs">
        <button 
          className={`wp-editor-tab ${mode === 'visual' ? 'active' : ''}`}
          onClick={() => setMode('visual')}
        >
          Visual
        </button>
        <button 
          className={`wp-editor-tab ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          Text
        </button>
      </div>
      
      {mode === 'visual' ? (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="wp-visual-editor"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="wp-text-editor"
        />
      )}
    </div>
  );
};

export default RichTextEditor;