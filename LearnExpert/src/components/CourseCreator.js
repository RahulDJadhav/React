import React, { useState, useRef, useEffect, useMemo } from 'react';
import BlockEditor from './BlockEditor';
import './CourseCreator.css';

const CourseCreator = React.memo(({ editingCourse, onBackToHome }) => {
  const [course, setCourse] = useState(
    editingCourse || {
      title: '',
      description: '',
      content: '',
      category: '',
      duration: ''
    }
  );
  
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [colorPicker, setColorPicker] = useState({ show: false, type: '', x: 0, y: 0 });
  const [savedSelection, setSavedSelection] = useState(null);
  const [activeFormats, setActiveFormats] = useState({});
  const editorRef = useRef();
  
  // Restore blocks when editing a course
  useEffect(() => {
    if (editingCourse && editingCourse.blocks) {
      setBlocks(editingCourse.blocks);
      // Auto-select first block to show its styles
      if (editingCourse.blocks.length > 0) {
        setSelectedBlock(editingCourse.blocks[0]);
      }
    } else {
      setBlocks([]);
      setSelectedBlock(null);
    }
  }, [editingCourse]);
  
  // Auto-select first block if none selected
  useEffect(() => {
    if (blocks.length > 0 && !selectedBlock && editingCourse) {
      setSelectedBlock(blocks[0]);
    }
  }, [blocks, selectedBlock, editingCourse]);
  
  const blockCategories = {
    'Text': {
      heading: { name: 'Heading', icon: 'fas fa-heading' },
      paragraph: { name: 'Paragraph', icon: 'fas fa-paragraph' },
      quote: { name: 'Quote', icon: 'fas fa-quote-left' },
      list: { name: 'List', icon: 'fas fa-list' }
    },
    'Media': {
      image: { name: 'Image', icon: 'fas fa-image' },
      video: { name: 'Video', icon: 'fas fa-video' },
      audio: { name: 'Audio', icon: 'fas fa-volume-up' }
    },
    'Interactive': {
      button: { name: 'Button', icon: 'fas fa-square' },
      link: { name: 'Link', icon: 'fas fa-link' },
      code: { name: 'Code', icon: 'fas fa-code' }
    },
    'Layout': {
      divider: { name: 'Divider', icon: 'fas fa-minus' },
      spacer: { name: 'Spacer', icon: 'fas fa-arrows-alt-v' }
    }
  };
  
  const addBlock = (type) => {
    if (editorRef.current) {
      editorRef.current.addBlock(type);
    }
  };
  
  const updateBlockContent = (content) => {
    if (editorRef.current) {
      editorRef.current.updateBlockContent(content);
    }
  };
  
  const updateBlockStyle = useMemo(() => {
    let timeoutId;
    return (property, value) => {
      // Update selectedBlock immediately for UI responsiveness
      setSelectedBlock(prev => ({
        ...prev,
        styles: { ...prev.styles, [property]: value }
      }));
      
      // Debounce the actual block update to prevent constant re-renders
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (editorRef.current && selectedBlock) {
          editorRef.current.updateBlockStyle(property, value);
        }
      }, 100);
    };
  }, [selectedBlock]);

  const extractContentStyles = () => {
    if (!selectedBlock) return {};
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectedBlock.content || '';
    const spans = tempDiv.querySelectorAll('span');
    
    const detectedStyles = {};
    spans.forEach(span => {
      if (span.style.color) detectedStyles.color = span.style.color;
      if (span.style.backgroundColor) detectedStyles.backgroundColor = span.style.backgroundColor;
      if (span.style.fontSize) detectedStyles.fontSize = span.style.fontSize;
      if (span.style.fontWeight) detectedStyles.fontWeight = span.style.fontWeight;
      if (span.style.lineHeight) detectedStyles.lineHeight = span.style.lineHeight;
    });
    
    return detectedStyles;
  };

  const contentStyles = extractContentStyles();

  const checkActiveFormats = () => {
    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      subscript: document.queryCommandState('subscript'),
      superscript: document.queryCommandState('superscript'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList')
    };
    setActiveFormats(formats);
  };

  const formatText = (command, value = null) => {
    const editor = document.querySelector('.editor-content');
    if (!editor) return;
    
    editor.focus();
    document.execCommand('styleWithCSS', false, true);
    
    switch(command) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'subscript':
        document.execCommand('subscript');
        break;
      case 'superscript':
        document.execCommand('superscript');
        break;
      case 'foreColor':
        if (value && savedSelection) {
          const editor = document.querySelector('.editor-content');
          editor.focus();
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(savedSelection);
          document.execCommand('styleWithCSS', false, true);
          document.execCommand('foreColor', false, value);
          setSavedSelection(null);
        }
        break;
      case 'backgroundColor':
        if (value && savedSelection) {
          const editor = document.querySelector('.editor-content');
          editor.focus();
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(savedSelection);
          document.execCommand('styleWithCSS', false, true);
          document.execCommand('backColor', false, value);
          setSavedSelection(null);
        }
        break;
      case 'insertOrderedList':
        document.execCommand('insertOrderedList');
        break;
      case 'insertUnorderedList':
        document.execCommand('insertUnorderedList');
        break;
      case 'indent':
        document.execCommand('indent');
        break;
      case 'outdent':
        document.execCommand('outdent');
        break;
      case 'removeFormat':
        document.execCommand('removeFormat');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
      case 'lineHeight':
        const height = prompt('Enter line height (1.5, 2, etc.):');
        if (height) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.lineHeight = height;
            span.innerHTML = '&nbsp;';
            range.insertNode(span);
            range.setStartAfter(span);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        break;
      case 'h1':
        document.execCommand('formatBlock', false, 'h1');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
    }
    
    // Check active formats after command execution
    setTimeout(checkActiveFormats, 10);
  };

  const handleInputChange = (field, value) => {
    setCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    try {
      const courseData = {
        ...course,
        blocks: blocks,
        id: editingCourse?.id || Date.now(),
        createdAt: editingCourse?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing courses from localStorage
      const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      if (editingCourse) {
        // Update existing course
        const courseIndex = existingCourses.findIndex(c => c.id === editingCourse.id);
        if (courseIndex !== -1) {
          existingCourses[courseIndex] = courseData;
        }
      } else {
        // Add new course
        existingCourses.push(courseData);
      }
      
      // Save to localStorage
      localStorage.setItem('courses', JSON.stringify(existingCourses));
      
      alert('Course saved successfully!');
      onBackToHome();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <div className="course-preview">
        <div className="preview-header">
          <h1>Course Preview</h1>
          <button onClick={() => setShowPreview(false)} className="btn-back">← Back to Editor</button>
        </div>
        <div className="preview-content">
          <h1 className="course-title">{course.title || 'Untitled Course'}</h1>
          <div className="course-meta">
            <span className="category">{course.category}</span>
            <span className="duration">{course.duration} hours</span>
          </div>
          <p className="course-description">{course.description}</p>
          <div className="course-content" dangerouslySetInnerHTML={{ __html: course.content }} />
        </div>
      </div>
    );
  }

  return (
    <div className="course-creator-fullscreen">
      <div className="block-sidebar-left">
        <div className="sidebar-header">
          <h3>Block Settings</h3>
        </div>
        
        <div className="block-inserter">
          <h4>Add Blocks</h4>
          {Object.entries(blockCategories).map(([category, blocks]) => (
            <div key={category} className="block-category">
              <div className="category-label">{category}</div>
              <div className="block-icons">
                {Object.entries(blocks).map(([type, config]) => (
                  <button 
                    key={type}
                    onClick={() => addBlock(type)}
                    className="insert-block-icon"
                    title={config.name}
                  >
                    <i className={config.icon}></i>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedBlock && (
          <div className="sidebar-content">
            <h4>Edit Selected Block</h4>
            <div className="setting-group">
              <label>Content Editor</label>
              <div className="custom-editor">
                <div className="editor-toolbar">
                  <button 
                    type="button" 
                    onClick={() => formatText('bold')} 
                    title="Bold"
                    className={activeFormats.bold ? 'active' : ''}
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('italic')} 
                    title="Italic"
                    className={activeFormats.italic ? 'active' : ''}
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('underline')} 
                    title="Underline"
                    className={activeFormats.underline ? 'active' : ''}
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('subscript')} 
                    title="Subscript"
                    className={activeFormats.subscript ? 'active' : ''}
                  >
                    <i className="fas fa-subscript"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('superscript')} 
                    title="Superscript"
                    className={activeFormats.superscript ? 'active' : ''}
                  >
                    <i className="fas fa-superscript"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('insertOrderedList')} 
                    title="Ordered List"
                    className={activeFormats.insertOrderedList ? 'active' : ''}
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => formatText('insertUnorderedList')} 
                    title="Unordered List"
                    className={activeFormats.insertUnorderedList ? 'active' : ''}
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button 
                    type="button" 
                    className="color-picker-btn"
                    title="Text Color"
                    onClick={(e) => {
                      // Save current selection
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        setSavedSelection(selection.getRangeAt(0).cloneRange());
                      }
                      const rect = e.target.getBoundingClientRect();
                      setColorPicker({ show: true, type: 'text', x: rect.right + 5, y: rect.top });
                    }}
                  >
                    <i className="fas fa-palette"></i>
                  </button>
                  <button 
                    type="button" 
                    className="color-picker-btn"
                    title="Background Color"
                    onClick={(e) => {
                      // Save current selection
                      const selection = window.getSelection();
                      if (selection.rangeCount > 0) {
                        setSavedSelection(selection.getRangeAt(0).cloneRange());
                      }
                      const rect = e.target.getBoundingClientRect();
                      setColorPicker({ show: true, type: 'background', x: rect.right + 5, y: rect.top });
                    }}
                  >
                    <i className="fas fa-highlighter"></i>
                  </button>
                  <button type="button" onClick={() => formatText('removeFormat')} title="Clear Formatting">
                    <i className="fas fa-remove-format"></i>
                  </button>
                  <button type="button" onClick={() => formatText('outdent')} title="Decrease Indent">
                    <i className="fas fa-outdent"></i>
                  </button>
                  <button type="button" onClick={() => formatText('indent')} title="Increase Indent">
                    <i className="fas fa-indent"></i>
                  </button>
                  <button type="button" onClick={() => formatText('lineHeight')} title="Line Height">
                    <i className="fas fa-text-height"></i>
                  </button>
                  <button type="button" onClick={() => formatText('h1')} title="Heading 1">
                    H1
                  </button>
                  <button type="button" onClick={() => formatText('h2')} title="Heading 2">
                    H2
                  </button>
                  <button type="button" onClick={() => formatText('link')} title="Link">
                    <i className="fas fa-link"></i>
                  </button>
                </div>
                {selectedBlock.type === 'image' ? (
                  <div className="editor-content" style={{
                    minHeight: '150px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 3px 3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img src={selectedBlock.content} alt="Preview" style={{ maxWidth: '100%', maxHeight: '130px' }} />
                  </div>
                ) : (
                  <div
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: selectedBlock.content || '' }}
                    onInput={(e) => updateBlockContent(e.target.innerHTML)}
                    onMouseUp={checkActiveFormats}
                    onKeyUp={checkActiveFormats}
                    onFocus={checkActiveFormats}
                    className="editor-content"
                    style={{
                      minHeight: '150px',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                      borderRadius: '0 0 3px 3px',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            </div>

            <div className="setting-group">
              <label>Styles for {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}</label>
              

              
              {/* Text-based components */}
              {['heading', 'paragraph', 'quote', 'button'].includes(selectedBlock.type) && (
                <>
                  <div className="style-row">
                    <label>Font Size</label>
                    <div className="font-size-input">
                      <input
                        type="number"
                        min="8"
                        max="100"
                        value={parseInt(contentStyles.fontSize) || parseInt(selectedBlock.styles.fontSize) || 16}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value) || 16;
                          updateBlockStyle('fontSize', newSize + 'px');
                        }}
                        className="font-size-number"
                      />
                      <div className="font-size-controls">
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const currentSize = parseInt(selectedBlock.styles.fontSize) || 16;
                            updateBlockStyle('fontSize', (currentSize + 1) + 'px');
                          }}
                        >
                          ▲
                        </button>
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const currentSize = parseInt(selectedBlock.styles.fontSize) || 16;
                            if (currentSize > 8) {
                              updateBlockStyle('fontSize', (currentSize - 1) + 'px');
                            }
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="style-row">
                    <label>Font Weight</label>
                    <select
                      value={contentStyles.fontWeight || selectedBlock.styles.fontWeight || 'normal'}
                      onChange={(e) => updateBlockStyle('fontWeight', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="lighter">Light</option>
                    </select>
                  </div>
                  
                  <div className="style-row">
                    <label>Text Color</label>
                    <input
                      type="color"
                      value={contentStyles.color || selectedBlock.styles.color?.length === 4 ? selectedBlock.styles.color + selectedBlock.styles.color.slice(1) : selectedBlock.styles.color || '#000000'}
                      onChange={(e) => updateBlockStyle('color', e.target.value)}
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Text Align</label>
                    <div className="text-align-buttons">
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'left')}
                        title="Align Left"
                      >
                        <i className="fas fa-align-left"></i>
                      </button>
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'center' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'center')}
                        title="Align Center"
                      >
                        <i className="fas fa-align-center"></i>
                      </button>
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'right')}
                        title="Align Right"
                      >
                        <i className="fas fa-align-right"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Button specific styles */}
              {selectedBlock.type === 'button' && (
                <>
                  <div className="style-row">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={selectedBlock.styles.backgroundColor || '#007cba'}
                      onChange={(e) => updateBlockStyle('backgroundColor', e.target.value)}
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Padding</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.padding || ''}
                      onChange={(e) => updateBlockStyle('padding', e.target.value)}
                      placeholder="12px 24px"
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Border</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.border || ''}
                      onChange={(e) => updateBlockStyle('border', e.target.value)}
                      placeholder="1px solid #ddd"
                    />
                  </div>
                </>
              )}

              {/* Image specific styles */}
              {selectedBlock.type === 'image' && (
                <>
                  <div className="setting-group">
                    <label>Choose Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          
                          img.onload = () => {
                            // Compress to max 800px width
                            const maxWidth = 800;
                            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                            canvas.width = img.width * ratio;
                            canvas.height = img.height * ratio;
                            
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                            updateBlockContent(compressedBase64);
                          };
                          
                          const reader = new FileReader();
                          reader.onload = (e) => img.src = e.target.result;
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="file-input"
                    />
                  </div>

                  <div className="setting-group">
                    <label>Image Caption</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.caption || ''}
                      onChange={(e) => updateBlockStyle('caption', e.target.value)}
                      placeholder="Enter caption"
                    />
                  </div>

                  <div className="setting-group">
                    <label>Alternate Text</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.alt || ''}
                      onChange={(e) => updateBlockStyle('alt', e.target.value)}
                      placeholder="Describe the image"
                    />
                  </div>

                  <div className="setting-group">
                    <label>Image Link</label>
                    <input
                      type="url"
                      value={selectedBlock.styles.link || ''}
                      onChange={(e) => updateBlockStyle('link', e.target.value)}
                      placeholder="Enter link URL"
                    />
                  </div>

                  <div className="setting-group">
                    <label>Display</label>
                    <div className="display-buttons">
                      <button 
                        type="button"
                        className={`display-btn ${selectedBlock.styles.display === 'inline' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('display', 'inline')}
                      >
                        Inline
                      </button>
                      <button 
                        type="button"
                        className={`display-btn ${selectedBlock.styles.display === 'block' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('display', 'block')}
                      >
                        Break Text
                      </button>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Alignment</label>
                    <div className="text-align-buttons">
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'left' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'left')}
                      >
                        <i className="fas fa-align-left"></i>
                      </button>
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'center' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'center')}
                      >
                        <i className="fas fa-align-center"></i>
                      </button>
                      <button 
                        type="button"
                        className={`align-btn ${selectedBlock.styles.textAlign === 'right' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('textAlign', 'right')}
                      >
                        <i className="fas fa-align-right"></i>
                      </button>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Size</label>
                    <div className="size-controls">
                      <div className="style-row">
                        <label>Width</label>
                        <div className="font-size-input">
                          <input
                            type="text"
                            value={selectedBlock.styles.width || ''}
                            onChange={(e) => updateBlockStyle('width', e.target.value)}
                            placeholder="100%"
                            className="font-size-number"
                          />
                          <div className="font-size-controls">
                            <button 
                              type="button"
                              className="font-size-btn"
                              onClick={() => {
                                const current = parseInt(selectedBlock.styles.width) || 100;
                                updateBlockStyle('width', (current + 10) + '%');
                              }}
                            >
                              ▲
                            </button>
                            <button 
                              type="button"
                              className="font-size-btn"
                              onClick={() => {
                                const current = parseInt(selectedBlock.styles.width) || 100;
                                if (current > 10) {
                                  updateBlockStyle('width', (current - 10) + '%');
                                }
                              }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="style-row">
                        <label>Height</label>
                        <div className="font-size-input">
                          <input
                            type="text"
                            value={selectedBlock.styles.height || ''}
                            onChange={(e) => updateBlockStyle('height', e.target.value)}
                            placeholder="auto"
                            className="font-size-number"
                          />
                          <div className="font-size-controls">
                            <button 
                              type="button"
                              className="font-size-btn"
                              onClick={() => {
                                const current = parseInt(selectedBlock.styles.height) || 200;
                                updateBlockStyle('height', (current + 10) + 'px');
                              }}
                            >
                              ▲
                            </button>
                            <button 
                              type="button"
                              className="font-size-btn"
                              onClick={() => {
                                const current = parseInt(selectedBlock.styles.height) || 200;
                                if (current > 10) {
                                  updateBlockStyle('height', (current - 10) + 'px');
                                }
                              }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Style</label>
                    <div className="style-buttons">
                      <button 
                        type="button"
                        className={`style-btn ${selectedBlock.styles.borderRadius === '8px' ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('borderRadius', selectedBlock.styles.borderRadius === '8px' ? '0px' : '8px')}
                      >
                        <i className="fas fa-circle"></i> Rounded
                      </button>
                      <button 
                        type="button"
                        className={`style-btn ${selectedBlock.styles.border ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('border', selectedBlock.styles.border ? '' : '2px solid #ddd')}
                      >
                        <i className="fas fa-square"></i> Bordered
                      </button>
                      <button 
                        type="button"
                        className={`style-btn ${selectedBlock.styles.boxShadow ? 'active' : ''}`}
                        onClick={() => updateBlockStyle('boxShadow', selectedBlock.styles.boxShadow ? '' : '0 4px 8px rgba(0,0,0,0.1)')}
                      >
                        <i className="fas fa-clone"></i> Shadow
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Video specific styles */}
              {selectedBlock.type === 'video' && (
                <>
                  <div className="setting-group">
                    <label>Video Source</label>
                    <input
                      type="url"
                      value={selectedBlock.content || ''}
                      onChange={(e) => updateBlockContent(e.target.value)}
                      placeholder="Enter YouTube/Vimeo URL or upload video file"
                      className="form-input"
                    />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const videoUrl = URL.createObjectURL(file);
                          updateBlockContent(videoUrl);
                        }
                      }}
                      className="file-input"
                      style={{ marginTop: '8px' }}
                    />
                  </div>

                  <div className="style-row">
                    <label>Width</label>
                    <div className="font-size-input">
                      <input
                        type="text"
                        value={selectedBlock.styles.width || ''}
                        onChange={(e) => updateBlockStyle('width', e.target.value)}
                        placeholder="100%"
                        className="font-size-number"
                      />
                      <div className="font-size-controls">
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const current = parseInt(selectedBlock.styles.width) || 100;
                            updateBlockStyle('width', (current + 10) + '%');
                          }}
                        >
                          ▲
                        </button>
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const current = parseInt(selectedBlock.styles.width) || 100;
                            if (current > 10) {
                              updateBlockStyle('width', (current - 10) + '%');
                            }
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="style-row">
                    <label>Height</label>
                    <div className="font-size-input">
                      <input
                        type="text"
                        value={selectedBlock.styles.height || ''}
                        onChange={(e) => updateBlockStyle('height', e.target.value)}
                        placeholder="315px"
                        className="font-size-number"
                      />
                      <div className="font-size-controls">
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const current = parseInt(selectedBlock.styles.height) || 315;
                            updateBlockStyle('height', (current + 10) + 'px');
                          }}
                        >
                          ▲
                        </button>
                        <button 
                          type="button"
                          className="font-size-btn"
                          onClick={() => {
                            const current = parseInt(selectedBlock.styles.height) || 315;
                            if (current > 10) {
                              updateBlockStyle('height', (current - 10) + 'px');
                            }
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="style-row">
                    <label>Border</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.border || ''}
                      onChange={(e) => updateBlockStyle('border', e.target.value)}
                      placeholder="none"
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Border Radius</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.borderRadius || ''}
                      onChange={(e) => updateBlockStyle('borderRadius', e.target.value)}
                      placeholder="8px"
                    />
                  </div>
                </>
              )}

              {/* Audio specific styles */}
              {selectedBlock.type === 'audio' && (
                <>
                  <div className="style-row">
                    <label>Width</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.width || ''}
                      onChange={(e) => updateBlockStyle('width', e.target.value)}
                      placeholder="100%"
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={selectedBlock.styles.backgroundColor || '#f8f9fa'}
                      onChange={(e) => updateBlockStyle('backgroundColor', e.target.value)}
                    />
                  </div>
                  
                  <div className="style-row">
                    <label>Border Radius</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.borderRadius || ''}
                      onChange={(e) => updateBlockStyle('borderRadius', e.target.value)}
                      placeholder="4px"
                    />
                  </div>
                </>
              )}

              {/* Common styles for all components */}
              <div className="style-row">
                <label>Margin</label>
                <input
                  type="text"
                  value={selectedBlock.styles.margin || ''}
                  onChange={(e) => updateBlockStyle('margin', e.target.value)}
                  placeholder="10px 0"
                />
              </div>
              
              <div className="style-row">
                <label>Box Shadow</label>
                <input
                  type="text"
                  value={selectedBlock.styles.boxShadow || ''}
                  onChange={(e) => updateBlockStyle('boxShadow', e.target.value)}
                  placeholder="0 4px 8px rgba(0,0,0,0.1)"
                  disabled={!selectedBlock.styles.boxShadow}
                  style={{ opacity: selectedBlock.styles.boxShadow ? 1 : 0.5 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {colorPicker.show && (
        <div 
          className="custom-color-picker"
          style={{
            position: 'fixed',
            left: colorPicker.x,
            top: colorPicker.y,
            zIndex: 1000
          }}
        >
          <div className="color-palette">
            {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff',
              '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#c0c0c0', '#808080',
              '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff', '#99ffff', '#ffcc99', '#cc99ff'].map(color => (
              <div
                key={color}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => {
                  formatText(colorPicker.type === 'text' ? 'foreColor' : 'backgroundColor', color);
                  setColorPicker({ show: false, type: '', x: 0, y: 0 });
                }}
              />
            ))}
          </div>
          <button 
            className="close-picker"
            onClick={() => setColorPicker({ show: false, type: '', x: 0, y: 0 })}
          >
            ×
          </button>
        </div>
      )}

      <div className="course-content-right">
        <div className="course-header">
          <div className="header-left">
            <img src="/LEAi_Logo.svg" alt="LearnExpert" className="header-logo" />
            <button onClick={onBackToHome} className="btn-back-home">
              <i className="fas fa-arrow-left"></i> Back to Home
            </button>
            <h1>{editingCourse ? 'Edit Template' : 'Create New Template'}</h1>
          </div>
          <div className="course-actions">
            <button onClick={handlePreview} className="btn-preview">Preview</button>
            <button onClick={handleSave} className="btn-save">
              {editingCourse ? 'Update' : 'Save '}
            </button>
          </div>
        </div>

        <div className="course-form">
          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={course.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">Select Category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                value={course.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="0"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea
              value={course.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of your course"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group editor-group">
            <label>Course Content</label>
            <BlockEditor
              ref={editorRef}
              value={course.content}
              onChange={(value) => handleInputChange('content', value)}
              onBlocksChange={setBlocks}
              onSelectedBlockChange={setSelectedBlock}
              blocks={blocks}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CourseCreator;