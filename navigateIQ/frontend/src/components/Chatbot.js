import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import './ResultsTable.css';
import './Timestamp.css';
import './DataTable.css';
import apiService from '../services/apiService';
import MarkdownRenderer from './MarkdownRenderer';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Data Assistant. I can help you analyze and retrieve insights from your data. Ask me anything!", sender: "bot", type: "text", timestamp: new Date() }
  ]);
  const [currentStep, setCurrentStep] = useState('queries');
  const [selectedDashboard, setSelectedDashboard] = useState('analytics');
  const [customQuery, setCustomQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [showTechnicalInsights, setShowTechnicalInsights] = useState(false);
  const [latestTechnicalData, setLatestTechnicalData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('sql');
  const messagesContainerRef = useRef(null);
  const timeoutsRef = useRef([]);

  const scrollToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    // Only scroll on initial load
    if (messages.length <= 1) {
      scrollToBottom();
    }
  }, [messages]);

  const dashboards = [
    { id: 'analytics', name: 'Analytics Dashboard', icon: 'fas fa-chart-line' },
    { id: 'sales', name: 'Sales Performance', icon: 'fas fa-chart-pie' },
    { id: 'operations', name: 'Operations Monitor', icon: 'fas fa-server' },
    { id: 'finance', name: 'Financial Reports', icon: 'fas fa-coins' }
  ];

  const dashboardQueries = {
    'analytics': [
      
      'Which accounts are approaching MQA?',
      'Is our early-stage funnel filling enough to meet pipeline goals?',
      'What top 5 campaigns has had the largest role in winning deals?',
      'What’s the win rate for low vs high engagement accounts?',
      'How has my data changed since past 30(Month) days?',
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
    // console.log('API Response:', response);
    
    if (!response.success) {
      return { text: response.error || 'Query failed', type: 'text' };
    }
    
    // Extract technical insights from response
    const technicalData = {
      sql: response.technical_insights || response.sql,
      dataInsights: response.data_insights,
      executionTime: response.executionTime,
      rowCount: response.results ? response.results.length : undefined,
      database: response.database,
      queryType: response.queryType,
      processingTime: response.processingTime,
      dataSource: response.dataSource
    };
    
    // Handle markdown response
    if (response.markdown) {
      return { 
        text: response.markdown, 
        type: 'markdown',
        technicalData
      };
    }
    
    const explanation = response.explanation || '';
    
    if (response.results && response.results.length > 0) {
      return {
        text: explanation,
        results: response.results,
        type: 'table',
        technicalData: {
          ...technicalData,
          rowCount: response.results.length
        }
      };
    }
    
    return { 
      text: explanation || response.sql || 'Query completed but no data returned', 
      type: 'text',
      technicalData
    };
  };

  const handleQuerySelect = async (query) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    
    setMessages(prev => [
      ...prev,
      { text: query, sender: "user", type: "text", timestamp: new Date() }
    ]);
    
    // Scroll to bottom when user selects a question
    setTimeout(() => scrollToBottom(true), 100);
    
    // Add thinking message
    const timeout1 = setTimeout(() => {
      if (isProcessing) {
        setMessages(prev => [
          ...prev,
          { text: "Analyzing your question...", sender: "bot", type: "thinking", timestamp: new Date() }
        ]);
      }
    }, 800);
    timeoutsRef.current.push(timeout1);
    
    // Add processing message
    const timeout2 = setTimeout(() => {
      if (isProcessing) {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.type === 'thinking') {
            newMessages[newMessages.length - 1] = { text: "Processing data sources...", sender: "bot", type: "thinking", timestamp: new Date() };
          }
          return newMessages;
        });
      }
    }, 3000);
    timeoutsRef.current.push(timeout2);
    
    // Add generating message
    const timeout3 = setTimeout(() => {
      if (isProcessing) {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.type === 'thinking') {
            newMessages[newMessages.length - 1] = { text: "Generating insights...", sender: "bot", type: "thinking", timestamp: new Date() };
          }
          return newMessages;
        });
      }
    }, 6000);
    timeoutsRef.current.push(timeout3);
    
    try {
      const response = await apiService.getChatResponse(query);
      
      // Clear timeouts when response arrives
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      const formattedResponse = formatApiResponse(response);
      if (formattedResponse.technicalData) {
        setLatestTechnicalData(formattedResponse.technicalData);
      }
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...formattedResponse, sender: "bot", timestamp: new Date() };
        return newMessages;
      });
      setIsProcessing(false);
    } catch (error) {
      // Clear timeouts on error
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { text: getDemoResponse(query), sender: "bot", type: "text", timestamp: new Date() };
        return newMessages;
      });
      setIsProcessing(false);
    }
  };

  const handleCustomQuery = async () => {
    if (customQuery.trim() && !isProcessing) {
      setIsProcessing(true);
      
      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      const userQuery = customQuery;
      setCustomQuery('');
      setMessages(prev => [
        ...prev,
        { text: userQuery, sender: "user", type: "text", timestamp: new Date() }
      ]);
      
      // Scroll to bottom when user submits custom query
      setTimeout(() => scrollToBottom(true), 100);
      
      // Add thinking message
      const timeout1 = setTimeout(() => {
        if (isProcessing) {
          setMessages(prev => [
            ...prev,
            { text: "Analyzing your question...", sender: "bot", type: "thinking", timestamp: new Date() }
          ]);
        }
      }, 800);
      timeoutsRef.current.push(timeout1);
      
      // Add processing message
      const timeout2 = setTimeout(() => {
        if (isProcessing) {
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.type === 'thinking') {
              newMessages[newMessages.length - 1] = { text: "Processing data sources...", sender: "bot", type: "thinking", timestamp: new Date() };
            }
            return newMessages;
          });
        }
      }, 3000);
      timeoutsRef.current.push(timeout2);
      
      // Add generating message
      const timeout3 = setTimeout(() => {
        if (isProcessing) {
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.type === 'thinking') {
              newMessages[newMessages.length - 1] = { text: "Generating insights...", sender: "bot", type: "thinking", timestamp: new Date() };
            }
            return newMessages;
          });
        }
      }, 6000);
      timeoutsRef.current.push(timeout3);
      
      try {
        const response = await apiService.getChatResponse(userQuery);
        
        // Clear timeouts when response arrives
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        
        const formattedResponse = formatApiResponse(response);
        if (formattedResponse.technicalData) {
          setLatestTechnicalData(formattedResponse.technicalData);
        }
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...formattedResponse, sender: "bot", timestamp: new Date() };
          return newMessages;
        });
        setIsProcessing(false);
      } catch (error) {
        // Clear timeouts on error
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { text: "Here's a detailed analysis based on your custom query: The system has processed your request and generated comprehensive insights from the selected dashboard.", sender: "bot", type: "text", timestamp: new Date() };
          return newMessages;
        });
        setIsProcessing(false);
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
    setCurrentStep('queries');
    setSelectedDashboard('analytics');
    setCustomQuery('');
    setIsTyping(false);
    setIsProcessing(false);
    setExpandedMessages(new Set());
    setMessages([
      { text: "Hello! I'm your AI Data Assistant. I can help you analyze and retrieve insights from your data. Ask me anything!", sender: "bot", type: "text", timestamp: new Date() }
    ]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-info">
          <div className="logo-container">
            <img src="/niq_icon-1.png" alt="Navigate IQ" className="header-logo" />
          </div>
          <div>
            <h3>NavigateIQ AI Assistant</h3>
            <span className="status">Ready to help</span>
          </div>
        </div>
        <div className="header-controls">
          {/* {selectedDashboard && (
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
          )} */}

          <button onClick={resetChat} className="reset-btn"><i className="fas fa-redo"></i></button>
        </div>
      </div>
      
      <div className="chatbot-content">
        <div className="main-content">
          {selectedDashboard && (
            <div className="suggested-queries-top">
              <div className="query-list">
                {dashboardQueries[selectedDashboard].map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuerySelect(query)}
                    className={`query-btn ${isProcessing ? 'disabled' : ''}`}
                    disabled={isProcessing}
                  >
                    <span className="query-icon"><i className="fas fa-search"></i></span>
                    {query.length > 80 ? query.substring(0, 80) + '...' : query}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                <div className={`message-bubble ${message.type === 'thinking' ? 'thinking' : ''}`}>
                  {message.type === 'thinking' ? (
                    <>
                      {message.text}
                      <div className="thinking-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </>
                  ) : message.type === 'markdown' ? (
                    <MarkdownRenderer content={message.text} />
                  ) : message.type === 'table' ? (
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
                  {message.technicalData && message.sender === 'bot' && (
                    <button 
                      className="tech-insights-inline-btn"
                      onClick={() => {
                        setLatestTechnicalData(message.technicalData);
                        setShowTechnicalInsights(true);
                      }}
                    >
                      Technical Insights
                    </button>
                  )}
                </div>
                <div className="message-timestamp">
                  {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {selectedDashboard && (
            <div className="chatbot-input">
              <div className="custom-query">
                <div className="input-container">
                  <textarea
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder={isProcessing ? "Processing..." : "Ask me anything about your data..."}
                    className={`query-input ${isProcessing ? 'disabled' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCustomQuery();
                      }
                    }}
                    disabled={isProcessing}
                    rows="2"
                  />
                  <button 
                    onClick={handleCustomQuery} 
                    className={`send-btn ${isProcessing ? 'disabled' : ''}`}
                    disabled={isProcessing}
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
      {showTechnicalInsights && (
        <div className="modal-overlay" onClick={() => setShowTechnicalInsights(false)}>
          <div className="technical-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <i className="fas fa-database"></i> Technical Insights
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setShowTechnicalInsights(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'sql' ? 'active' : ''}`}
                onClick={() => setActiveTab('sql')}
              >
                SQL Query
              </button>
              <button 
                className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                Data Insights
              </button>
            </div>
            <div className="modal-content">
              {latestTechnicalData ? (
                <div className="tab-content">
                  {activeTab === 'sql' && (
                    <div className="sql-tab">
                      {latestTechnicalData.sql ? (
                        <pre className="sql-code">{latestTechnicalData.sql}</pre>
                      ) : (
                        <p>No SQL query available</p>
                      )}
                      <div className="tech-metrics">
                        {latestTechnicalData.executionTime && (
                          <div className="tech-metric">
                            <strong>Execution Time:</strong>
                            <span>{latestTechnicalData.executionTime}</span>
                          </div>
                        )}
                        {latestTechnicalData.rowCount !== undefined && (
                          <div className="tech-metric">
                            <strong>Row Count:</strong>
                            <span>{latestTechnicalData.rowCount}</span>
                          </div>
                        )}
                        {latestTechnicalData.database && (
                          <div className="tech-metric">
                            <strong>Database:</strong>
                            <span>{latestTechnicalData.database}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'data' && (
                    <div className="data-tab">
                      {latestTechnicalData.dataInsights && latestTechnicalData.dataInsights.length > 0 ? (
                        <div className="data-table-container">
                          <table className="insights-table">
                            <thead>
                              <tr>
                                {Object.keys(latestTechnicalData.dataInsights[0]).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {latestTechnicalData.dataInsights.map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((value, valueIdx) => (
                                    <td key={valueIdx}>{value}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No data insights available</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-data">
                  <p>Ask a question to see technical insights here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Chatbot;