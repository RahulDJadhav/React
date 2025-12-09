import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import './ResultsTable.css';
import './Timestamp.css';
import './DataTable.css';


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

  const handleQuerySelect = (query) => {
    setIsTyping(true);
    setMessages(prev => [
      ...prev,
      { text: query, sender: "user", type: "text", timestamp: new Date() }
    ]);
    
    setTimeout(() => {
      setIsTyping(false);
      const response = getStaticResponse(query);
      setMessages(prev => [
        ...prev,
        { ...response, sender: "bot", timestamp: new Date() }
      ]);
    }, 1500);
  };

  const handleCustomQuery = () => {
    if (customQuery.trim()) {
      const userQuery = customQuery;
      setCustomQuery('');
      setIsTyping(true);
      setMessages(prev => [
        ...prev,
        { text: userQuery, sender: "user", type: "text", timestamp: new Date() }
      ]);
      
      setTimeout(() => {
        setIsTyping(false);
        const response = getStaticResponse(userQuery);
        setMessages(prev => [
          ...prev,
          { ...response, sender: "bot", timestamp: new Date() }
        ]);
      }, 1500);
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

  const getStaticResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('campaign') || lowerQuery.includes('winning deals')) {
      return {
        text: "Here are the top 5 campaigns that contributed most to winning deals:",
        results: [
          { Campaign: "Digital Marketing Q4", "Deals Won": 45, "Revenue Impact": "$2.3M", "Win Rate": "68%" },
          { Campaign: "Enterprise Outreach", "Deals Won": 32, "Revenue Impact": "$4.1M", "Win Rate": "72%" },
          { Campaign: "Product Launch 2024", "Deals Won": 28, "Revenue Impact": "$1.8M", "Win Rate": "65%" },
          { Campaign: "Partner Referrals", "Deals Won": 24, "Revenue Impact": "$3.2M", "Win Rate": "78%" },
          { Campaign: "Content Marketing", "Deals Won": 19, "Revenue Impact": "$1.1M", "Win Rate": "58%" }
        ],
        type: 'table'
      };
    }
    
    if (lowerQuery.includes('mqa') || lowerQuery.includes('approaching')) {
      return {
        text: "Accounts approaching MQA (Marketing Qualified Account) status:",
        results: [
          { Account: "TechCorp Solutions", "Current Score": 85, "MQA Threshold": 90, "Days to MQA": 12 },
          { Account: "Global Industries", "Current Score": 82, "MQA Threshold": 90, "Days to MQA": 18 },
          { Account: "Innovation Labs", "Current Score": 88, "MQA Threshold": 90, "Days to MQA": 8 },
          { Account: "Future Systems", "Current Score": 79, "MQA Threshold": 90, "Days to MQA": 25 }
        ],
        type: 'table'
      };
    }
    
    if (lowerQuery.includes('sales') || lowerQuery.includes('pipeline') || lowerQuery.includes('revenue')) {
      return {
        text: "Current sales pipeline analysis:",
        results: [
          { Stage: "Prospecting", "Deal Count": 156, "Total Value": "$12.4M", "Avg Deal Size": "$79.5K" },
          { Stage: "Qualification", "Deal Count": 89, "Total Value": "$18.2M", "Avg Deal Size": "$204.5K" },
          { Stage: "Proposal", "Deal Count": 34, "Total Value": "$8.9M", "Avg Deal Size": "$261.8K" },
          { Stage: "Negotiation", "Deal Count": 12, "Total Value": "$4.2M", "Avg Deal Size": "$350K" }
        ],
        type: 'table'
      };
    }
    
    if (lowerQuery.includes('performance') || lowerQuery.includes('system') || lowerQuery.includes('server')) {
      return {
        text: "System performance metrics overview:",
        results: [
          { Metric: "CPU Usage", "Current": "68%", "Average": "72%", Status: "Normal" },
          { Metric: "Memory Usage", "Current": "84%", "Average": "79%", Status: "High" },
          { Metric: "Disk I/O", "Current": "45%", "Average": "52%", Status: "Normal" },
          { Metric: "Network Latency", "Current": "12ms", "Average": "15ms", Status: "Good" }
        ],
        type: 'table'
      };
    }
    
    if (lowerQuery.includes('finance') || lowerQuery.includes('expense') || lowerQuery.includes('budget')) {
      return {
        text: "Financial performance summary:",
        results: [
          { Category: "Revenue", "This Month": "$2.8M", "Last Month": "$2.4M", "Variance": "+16.7%" },
          { Category: "Operating Expenses", "This Month": "$1.2M", "Last Month": "$1.1M", "Variance": "+9.1%" },
          { Category: "Marketing Spend", "This Month": "$340K", "Last Month": "$380K", "Variance": "-10.5%" },
          { Category: "Net Profit", "This Month": "$1.26M", "Last Month": "$920K", "Variance": "+37%" }
        ],
        type: 'table'
      };
    }
    
    return {
      text: "Based on your query, here's a comprehensive analysis from the dashboard data. The metrics show positive trends across key performance indicators with notable improvements in conversion rates and customer engagement levels.",
      type: 'text'
    };
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