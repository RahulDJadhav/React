import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import './BlockEditor.css';

const BlockEditor = forwardRef(({ value, onChange, onBlocksChange, onSelectedBlockChange, blocks: parentBlocks = [] }, ref) => {
  const [blocks, setBlocks] = useState(parentBlocks);
  const [selectedBlock, setSelectedBlock] = useState(null);

  
  // Sync with parent blocks (only when different)
  React.useEffect(() => {
    if (parentBlocks && JSON.stringify(parentBlocks) !== JSON.stringify(blocks)) {
      setBlocks(parentBlocks);
    }
  }, [parentBlocks]);

  const generateHTML = () => {
    return blocks.map(block => {
      const styles = Object.entries(block.styles).map(([key, value]) => 
        `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
      ).join('; ');
      
      switch(block.type) {
        case 'heading': return `<h2 style="${styles}">${block.content}</h2>`;
        case 'paragraph': return `<p style="${styles}">${block.content}</p>`;
        case 'image': return `<img src="${block.content}" style="${styles}" />`;
        case 'button': return `<button style="${styles}">${block.content}</button>`;
        case 'link': return `<a href="${block.content}" style="${styles}" target="_blank">${block.content}</a>`;
        case 'video': return block.content && (block.content.startsWith('blob:') || block.content.includes('.mp4') || block.content.includes('.webm') || block.content.includes('.ogg')) ? `<video controls style="${styles}"><source src="${block.content}" />Your browser does not support the video tag.</video>` : `<iframe src="${block.content}" style="${styles}" allowfullscreen></iframe>`;
        case 'audio': return `<audio controls style="${styles}"><source src="${block.content}" /></audio>`;
        case 'quote': return `<blockquote style="${styles}">${block.content}</blockquote>`;
        case 'list': return `<ul style="${styles}">${block.content.split('\n').map(item => `<li>${item}</li>`).join('')}</ul>`;
        case 'code': return `<pre style="${styles}"><code>${block.content}</code></pre>`;
        case 'divider': return `<hr style="${styles}" />`;
        case 'spacer': return `<div style="${styles}"></div>`;
        default: return '';
      }
    }).join('\n');
  };

  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    onBlocksChange?.(updatedBlocks);
    onChange?.(generateHTML());
  };

  const getDefaultContent = (type) => {
    switch(type) {
      case 'heading': return 'Click to edit heading';
      case 'paragraph': return 'Click to edit paragraph text...';
      case 'image': return 'https://via.placeholder.com/400x200/e9ecef/666?text=Click+to+upload+image';
      case 'button': return 'Button Text';
      case 'link': return 'https://example.com';
      case 'video': return '';
      case 'audio': return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
      case 'quote': return 'Click to edit quote...';
      case 'list': return 'List item 1\nList item 2\nList item 3';
      case 'code': return 'console.log("Hello World");';
      case 'divider': return '';
      case 'spacer': return '';
      default: return '';
    }
  };

  const getDefaultStyles = (type) => {
    switch(type) {
      case 'heading': return { fontSize: '32px', color: '#333333', fontWeight: 'bold' };
      case 'paragraph': return { fontSize: '16px', color: '#666666', lineHeight: '1.6' };
      case 'image': return { width: '100%', height: 'auto', borderRadius: '0px' };
      case 'button': return { backgroundColor: '#007cba', color: '#ffffff', padding: '12px 24px', borderRadius: '4px' };
      case 'link': return { color: '#007cba', textDecoration: 'underline' };
      case 'video': return { width: '100%', height: '315px', border: 'none' };
      case 'audio': return { width: '100%' };
      case 'quote': return { fontSize: '18px', fontStyle: 'italic', borderLeft: '4px solid #007cba', paddingLeft: '20px', color: '#555555' };
      case 'list': return { fontSize: '16px', color: '#666666', lineHeight: '1.8' };
      case 'code': return { backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '14px' };
      case 'divider': return { height: '2px', backgroundColor: '#dddddd', margin: '20px 0', border: 'none' };
      case 'spacer': return { height: '40px' };
      default: return {};
    }
  };

  const selectBlock = (block) => {
    setSelectedBlock(block);
    if (onSelectedBlockChange) onSelectedBlockChange(block);
  };

  const updateBlockContent = (content) => {
    if (!selectedBlock) return;
    
    const updatedBlocks = blocks.map(block => 
      block.id === selectedBlock.id ? { ...block, content } : block
    );
    setBlocks(updatedBlocks);
    setSelectedBlock({ ...selectedBlock, content });
    onBlocksChange?.(updatedBlocks);
    
    // Generate HTML with updated blocks
    const html = updatedBlocks.map(block => {
      const styles = Object.entries(block.styles).map(([key, value]) => 
        `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
      ).join('; ');
      
      const blockContent = block.id === selectedBlock.id ? content : block.content;
      
      switch(block.type) {
        case 'heading': return `<h2 style="${styles}">${blockContent}</h2>`;
        case 'paragraph': return `<p style="${styles}">${blockContent}</p>`;
        case 'image': return `<img src="${blockContent}" style="${styles}" />`;
        case 'button': return `<button style="${styles}">${blockContent}</button>`;
        case 'link': return `<a href="${blockContent}" style="${styles}" target="_blank">${blockContent}</a>`;
        case 'video': return blockContent && (blockContent.startsWith('blob:') || blockContent.includes('.mp4') || blockContent.includes('.webm') || blockContent.includes('.ogg')) ? `<video controls style="${styles}"><source src="${blockContent}" />Your browser does not support the video tag.</video>` : `<iframe src="${blockContent}" style="${styles}" allowfullscreen></iframe>`;
        case 'audio': return `<audio controls style="${styles}"><source src="${blockContent}" /></audio>`;
        case 'quote': return `<blockquote style="${styles}">${blockContent}</blockquote>`;
        case 'list': return `<ul style="${styles}">${blockContent.split('\n').map(item => `<li>${item}</li>`).join('')}</ul>`;
        case 'code': return `<pre style="${styles}"><code>${blockContent}</code></pre>`;
        case 'divider': return `<hr style="${styles}" />`;
        case 'spacer': return `<div style="${styles}"></div>`;
        default: return '';
      }
    }).join('\n');
    
    onChange?.(html);
  };

  const updateBlockStyle = (property, value) => {
    if (!selectedBlock) return;
    
    const newStyles = { ...selectedBlock.styles, [property]: value };
    const updatedSelectedBlock = { ...selectedBlock, styles: newStyles };
    const updatedBlocks = blocks.map(block => 
      block.id === selectedBlock.id ? updatedSelectedBlock : block
    );
    
    setBlocks(updatedBlocks);
    setSelectedBlock(updatedSelectedBlock);
    onBlocksChange?.(updatedBlocks);
    
    // Generate HTML with updated styles
    const html = updatedBlocks.map(block => {
      const styles = Object.entries(block.styles).map(([key, value]) => 
        `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
      ).join('; ');
      
      switch(block.type) {
        case 'heading': return `<h2 style="${styles}">${block.content}</h2>`;
        case 'paragraph': return `<p style="${styles}">${block.content}</p>`;
        case 'image': return `<img src="${block.content}" style="${styles}" />`;
        case 'button': return `<button style="${styles}">${block.content}</button>`;
        case 'link': return `<a href="${block.content}" style="${styles}" target="_blank">${block.content}</a>`;
        case 'video': return block.content && (block.content.startsWith('blob:') || block.content.includes('.mp4') || block.content.includes('.webm') || block.content.includes('.ogg')) ? `<video controls style="${styles}"><source src="${block.content}" />Your browser does not support the video tag.</video>` : `<iframe src="${block.content}" style="${styles}" allowfullscreen></iframe>`;
        case 'audio': return `<audio controls style="${styles}"><source src="${block.content}" /></audio>`;
        case 'quote': return `<blockquote style="${styles}">${block.content}</blockquote>`;
        case 'list': return `<ul style="${styles}">${block.content.split('\n').map(item => `<li>${item}</li>`).join('')}</ul>`;
        case 'code': return `<pre style="${styles}"><code>${block.content}</code></pre>`;
        case 'divider': return `<hr style="${styles}" />`;
        case 'spacer': return `<div style="${styles}"></div>`;
        default: return '';
      }
    }).join('\n');
    
    onChange?.(html);
  };

  const deleteBlock = (blockId) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    onBlocksChange?.(updatedBlocks);
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
      onSelectedBlockChange?.(null);
    }
    onChange?.(generateHTML());
  };

  useImperativeHandle(ref, () => ({
    addBlock,
    updateBlockContent,
    updateBlockStyle,
    selectedBlock
  }));

  const renderBlock = (block) => {
    const isSelected = selectedBlock?.id === block.id;
    // Always use the block's current content and styles from the blocks array
    const displayContent = block.content;
    const displayStyles = block.styles;
    
    return (
      <div 
        key={`${block.id}-${JSON.stringify(block.styles)}`}
        className={`block-item ${isSelected ? 'selected' : ''}`}
        onClick={() => selectBlock(block)}
      >
        {block.type === 'heading' && (
          <h2 style={{...displayStyles}} key={`h2-${block.id}`} dangerouslySetInnerHTML={{__html: displayContent}} />
        )}
        {block.type === 'paragraph' && (
          <p style={{...displayStyles}} key={`p-${block.id}`} dangerouslySetInnerHTML={{__html: displayContent}} />
        )}
        {block.type === 'image' && (
          <div style={{ textAlign: displayStyles.textAlign || 'left' }}>
            {displayStyles.link ? (
              <a href={displayStyles.link} target="_blank" rel="noopener noreferrer">
                <img 
                  src={displayContent} 
                  alt={displayStyles.alt || ''} 
                  style={{
                    ...displayStyles,
                    textAlign: undefined,
                    display: displayStyles.display || 'block'
                  }} 
                />
              </a>
            ) : (
              <img 
                src={displayContent} 
                alt={displayStyles.alt || ''} 
                style={{
                  ...displayStyles,
                  textAlign: undefined,
                  display: displayStyles.display || 'block'
                }} 
              />
            )}
            {displayStyles.caption && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '4px',
                textAlign: displayStyles.textAlign || 'left'
              }}>
                {displayStyles.caption}
              </div>
            )}
          </div>
        )}
        {block.type === 'button' && (
          <button style={displayStyles} dangerouslySetInnerHTML={{__html: displayContent}} />
        )}
        {block.type === 'link' && (
          <a href={displayContent} style={displayStyles} target="_blank" rel="noopener noreferrer">{displayContent}</a>
        )}
        {block.type === 'video' && (
          displayContent ? (
            displayContent.startsWith('blob:') || displayContent.includes('.mp4') || displayContent.includes('.webm') || displayContent.includes('.ogg') ? (
              <video controls style={displayStyles}>
                <source src={displayContent} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe src={displayContent} style={displayStyles} allowFullScreen title="Video"></iframe>
            )
          ) : (
            <div style={{
              ...displayStyles,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              border: '2px dashed #ddd',
              minHeight: '200px',
              color: '#666'
            }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fas fa-video" style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}></i>
                <p>Click to add video URL or upload video file</p>
              </div>
            </div>
          )
        )}
        {block.type === 'audio' && (
          <audio controls style={displayStyles}>
            <source src={displayContent} />
          </audio>
        )}
        {block.type === 'quote' && (
          <blockquote style={displayStyles} dangerouslySetInnerHTML={{__html: displayContent}} />
        )}
        {block.type === 'list' && (
          <ul style={displayStyles}>
            {displayContent.split('\n').map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
        {block.type === 'code' && (
          <pre style={displayStyles}><code>{displayContent}</code></pre>
        )}
        {block.type === 'divider' && (
          <hr style={displayStyles} />
        )}
        {block.type === 'spacer' && (
          <div style={displayStyles}></div>
        )}
        {isSelected && (
          <div className="block-controls">
            <span className="edit-icon">✏️</span>
            <span className="delete-icon" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}>🗑️</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="blocks-container">
      {blocks.map(renderBlock)}
      {blocks.length === 0 && (
        <div className="empty-state">
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '16px' }}>
            <i className="fas fa-plus-circle" style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}></i>
            Click a block type in the left panel to start building your content
          </div>
        </div>
      )}
    </div>
  );
});

export default BlockEditor;