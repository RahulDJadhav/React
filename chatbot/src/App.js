import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <div className="app-logo">
        <h1 className="logo-text">MERIDIAN</h1>
      </div>
      <main>
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
