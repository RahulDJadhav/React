import './App.css';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="App">
      <div className="app-logo">
        <img src="/naviq_logo.svg" alt="Navigate IQ" className="logo-image" />
      </div>
      <main>
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
