# LearnExpert - Course Creator

A React.js application with WordPress-like editor for creating courses.

## Features

- **Rich Text Editor**: WordPress-style editor with formatting options
- **Course Creation**: Complete course creation form
- **Reusable Components**: Modular design for easy customization
- **Responsive Design**: Works on desktop and mobile

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Components

### RichTextEditor
Reusable WordPress-like editor component with:
- Text formatting (bold, italic, underline)
- Headers and lists
- Links, images, and videos
- Code blocks and quotes

### CourseCreator
Main course creation component with:
- Course title and description
- Category selection
- Duration input
- Rich content editor

## Usage

```jsx
import RichTextEditor from './components/RichTextEditor';

// Use the editor in any component
<RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Start writing..."
/>
```

## Customization

The components are designed to be easily customizable:
- Modify `RichTextEditor.js` to add/remove toolbar options
- Update `CourseCreator.css` for styling changes
- Extend `CourseCreator.js` to add more fields