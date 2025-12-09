# React Chatbot Demo

## Project Overview
This is a React-based chatbot application that provides users with dashboard options and interactive question flows.

## Features
- **4 Dashboard Options**: Dashboard 1, Dashboard 2, Dashboard 3, Dashboard 4
- **Predefined Questions**: Each dashboard has 6 specific questions
- **Custom Questions**: Users can ask their own questions
- **Interactive UI**: Clean, responsive chat interface
- **Reset Functionality**: Start over at any time

## How to Run
1. Navigate to the project directory:
   ```
   cd c:\xampp\htdocs\React\chatbot-demo
   ```

2. Install dependencies (if not already done):
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser to `http://localhost:3000` (or the next available port)

## How It Works

### Step 1: Dashboard Selection
When the chatbot opens, users see 4 dashboard options:
- Dashboard 1 (Project Management focused)
- Dashboard 2 (Analytics focused)
- Dashboard 3 (Sales focused)
- Dashboard 4 (Support focused)

### Step 2: Question Selection
After selecting a dashboard, users can:
- Choose from 6 predefined questions specific to that dashboard
- Type their own custom question in the input field
- Press Enter or click Send to submit custom questions

### Step 3: Interaction
- All messages appear in a chat-like interface
- Bot responses acknowledge the selected dashboard and question
- Users can continue asking questions or reset to start over

## Dashboard Question Examples

**Dashboard 1 (Project Management):**
- What is your current project status?
- How many team members are working?
- What is your budget range?
- When is the deadline?
- What technologies are you using?
- Do you need additional resources?

**Dashboard 2 (Analytics):**
- What type of analysis do you need?
- What is your data source?
- How often do you need reports?
- What metrics are most important?
- Do you need real-time updates?
- What is your preferred format?

**Dashboard 3 (Sales):**
- What is your sales target?
- Which region are you focusing on?
- What is your conversion rate?
- How do you track leads?
- What is your average deal size?
- Do you use CRM integration?

**Dashboard 4 (Support):**
- What support level do you need?
- How urgent is your request?
- Have you tried troubleshooting?
- What error messages do you see?
- When did the issue start?
- Do you need training resources?

## File Structure
```
src/
├── components/
│   ├── Chatbot.js          # Main chatbot component
│   └── Chatbot.css         # Chatbot styles
├── App.js                  # Main app component
├── App.css                 # App styles
└── index.js               # Entry point
```

## Customization
- Add more dashboards by updating the `dashboards` array
- Add more questions by updating the `dashboardQuestions` object
- Modify styling in `Chatbot.css` and `App.css`
- Extend functionality by adding new state management or API calls

## Next Steps
- Connect to real dashboard APIs
- Add user authentication
- Implement data persistence
- Add more interactive elements
- Deploy to production