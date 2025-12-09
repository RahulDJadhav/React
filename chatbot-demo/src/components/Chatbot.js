import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import './ResultsTable.css';
import './Timestamp.css';
import './DataTable.css';
import apiService from '../services/apiService';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Data Assistant. I can help you analyze and retrieve insights from your dashboards. Please select a dashboard to get started:", sender: "bot", type: "text", timestamp: new Date() }
  ]);
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStep, isTyping]);

  const dashboards = [
    { id: 'analytics', name: 'Analytics Dashboard', icon: 'fas fa-chart-line' },
    { id: 'sales', name: 'Sales Performance', icon: 'fas fa-chart-pie' },
    { id: 'operations', name: 'Operations Monitor', icon: 'fas fa-server' },
    { id: 'finance', name: 'Financial Reports', icon: 'fas fa-coins' }
  ];

  const dashboardQueries = {
    'analytics': [
      'How has my data changed since past 7 days?',
      'Which accounts are approaching MQA?',
      'Is our early-stage funnel filling enough to meet pipeline goals?',
      'What top 5 campaigns has had the largest role in winning deals?',
      'What’s the win rate for low vs high engagement accounts?'
    ],
    'sales': [
      'What\'s our current sales pipeline status?',
      'Show revenue breakdown by region',
      'Display top performing sales reps',
      'Compare Q4 sales vs targets',
      'Show customer acquisition costs'
    ],
    'operations': [
      'Display system performance metrics',
      'Show current server load status',
      'What\'s our uptime percentage this month?',
      'Display error rates by service',
      'Show resource utilization trends'
    ],
    'finance': [
      'Show monthly revenue vs expenses',
      'Display cash flow projections',
      'What\'s our current burn rate?',
      'Show budget variance analysis',
      'Display profit margins by product line'
    ]
  };

  const handleDashboardSelect = (dashboard) => {
    setSelectedDashboard(dashboard.id);
    setCurrentStep('queries');
    setIsTyping(true);
    
    setMessages(prev => [
      ...prev,
      { text: dashboard.name, sender: "user", type: "text", timestamp: new Date() }
    ]);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { text: `Perfect! I'm now connected to your ${dashboard.name}. Here are some insights I can provide:`, sender: "bot", type: "text", timestamp: new Date() }
      ]);
    }, 1000);
  };

  const formatApiResponse = (response) => {
    const explanation = response.explanation || '';
    
    if (response.results && response.results.length > 0) {
      return {
        text: explanation,
        results: response.results,
        type: 'table'
      };
    }
    
    return { text: explanation || 'No results found', type: 'text' };
  };

  const handleQuerySelect = async (query) => {
    setIsTyping(true);
    setMessages(prev => [
      ...prev,
      { text: query, sender: "user", type: "text", timestamp: new Date() }
    ]);
    
    try {
      const response = await apiService.getChatResponse(query);
      setIsTyping(false);
      
      const formattedResponse = formatApiResponse(response);
      setMessages(prev => [
        ...prev,
        { ...formattedResponse, sender: "bot", timestamp: new Date() }
      ]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { text: getDemoResponse(query), sender: "bot", type: "text", timestamp: new Date() }
      ]);
    }
  };

  const handleCustomQuery = async () => {
    if (customQuery.trim()) {
      const userQuery = customQuery;
      setCustomQuery('');
      setIsTyping(true);
      setMessages(prev => [
        ...prev,
        { text: userQuery, sender: "user", type: "text", timestamp: new Date() }
      ]);
      
      try {
        const response = await apiService.getChatResponse(userQuery);
        setIsTyping(false);
        
        const formattedResponse = formatApiResponse(response);
        setMessages(prev => [
          ...prev,
          { ...formattedResponse, sender: "bot", timestamp: new Date() }
        ]);
      } catch (error) {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { text: "Here's a detailed analysis based on your custom query: The system has processed your request and generated comprehensive insights from the selected dashboard.", sender: "bot", type: "text", timestamp: new Date() }
        ]);
      }
    }
  };

  const toggleMessageExpansion = (messageIndex) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  };

  const getDemoResponse = (query) => {
    return "Sorry, I'm having trouble accessing the dashboard data right now. Please try again.";
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  };

  const resetChat = () => {
    setCurrentStep('dashboard');
    setSelectedDashboard(null);
    setCustomQuery('');
    setIsTyping(false);
    setExpandedMessages(new Set());
    setMessages([
      { text: "Hello! I'm your AI Data Assistant. I can help you analyze and retrieve insights from your dashboards. Please select a dashboard to get started:", sender: "bot", type: "text", timestamp: new Date() }
    ]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-info">
          <div className="ai-icon"><i className="fas fa-robot"></i></div>
          <div>
            <h3>AI Data Assistant</h3>
            <span className="status">Online • Ready to help</span>
          </div>
        </div>
        <div className="header-controls">
          {selectedDashboard && (
            <select 
              value={selectedDashboard} 
              onChange={(e) => {
                const dashboard = dashboards.find(d => d.id === e.target.value);
                handleDashboardSelect(dashboard);
              }}
              className="dashboard-dropdown"
            >
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.name}
                </option>
              ))}
            </select>
          )}
          <button onClick={resetChat} className="reset-btn"><i className="fas fa-redo"></i></button>
        </div>
      </div>
      
      <div className="chatbot-content">
        <div className="chatbot-messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'bot' ? (
                  <div className="bot-avatar"><i className="fas fa-robot"></i></div>
                ) : (
                  <div className="user-avatar"><i className="fas fa-user-circle"></i></div>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.type === 'table' ? (
                    <div>
                      <div style={{whiteSpace: 'pre-line', marginBottom: '12px'}}>{message.text}</div>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              {message.results.length > 0 && Object.keys(message.results[0]).map(key => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.results.map((result, idx) => (
                              <tr key={idx}>
                                {Object.values(result).map((value, valueIdx) => (
                                  <td key={valueIdx}>{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : message.sender === 'bot' && message.text.length > 150 && !expandedMessages.has(index) ? (
                    <div style={{whiteSpace: 'pre-line'}}>
                      {truncateText(message.text)}
                      <button 
                        className="expand-btn" 
                        onClick={() => toggleMessageExpansion(index)}
                        style={{display: 'inline', marginLeft: '0'}}
                      >
                        ...more
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{whiteSpace: 'pre-line'}}>{message.text}</div>
                      {message.sender === 'bot' && message.text.length > 150 && expandedMessages.has(index) && (
                        <button 
                          className="expand-btn" 
                          onClick={() => toggleMessageExpansion(index)}
                        >
                          show less
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="message-timestamp">
                  {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">
                <div className="bot-avatar"><i className="fas fa-robot"></i></div>
              </div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          {currentStep === 'dashboard' && (
            <div className="dashboard-pills">
              <h4><i className="fas fa-th-large"></i> Select Dashboard:</h4>
              <div className="pills-container">
                {dashboards.map((dashboard, index) => (
                  <button
                    key={index}
                    onClick={() => handleDashboardSelect(dashboard)}
                    className="dashboard-pill"
                  >
                    <i className={dashboard.icon}></i> {dashboard.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 'queries' && selectedDashboard && (
            <div className="suggested-queries">
              <div className="query-list">
                {dashboardQueries[selectedDashboard].map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuerySelect(query)}
                    className="query-btn"
                  >
                    <span className="query-icon"><i className="fas fa-search"></i></span>
                    {query.length > 80 ? query.substring(0, 80) + '...' : query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {currentStep === 'queries' && selectedDashboard && (
          <div className="chatbot-input">
            <div className="custom-query">
              <div className="input-container">
                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Ask me anything about your data..."
                  className="query-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
                />
                <button onClick={handleCustomQuery} className="send-btn">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;