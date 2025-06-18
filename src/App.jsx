import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { format } from 'date-fns'

const firebaseConfig = {
  apiKey: "AIzaSyAfASez0BnqEkEMxTLqJuE_bsmagV_IH_Y",
  authDomain: "helpdesk-smit.firebaseapp.com",
  projectId: "helpdesk-smit",
  storageBucket: "helpdesk-smit.appspot.com",
  messagingSenderId: "516701942489",
  appId: "1:516701942489:web:a8ae8e55eb4125571b84c8"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default function App() {
  const [currentUser] = useState('user1')
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = []
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() })
      })
      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [messageInput])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    try {
      return format(timestamp.toDate(), 'h:mm a')
    } catch (e) {
      return ''
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageInput.trim()) {
      toast.warning('Please enter a message')
      return
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: messageInput,
        timestamp: serverTimestamp(),
        sender: currentUser
      })
      setMessageInput('')
      setIsTyping(false)
    } catch (error) {
      console.error("Error sending message: ", error)
      toast.error('Failed to send message')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
  }

  const handleInputChange = (e) => {
    setMessageInput(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <div className="app-container">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        toastClassName="toast-message"
        progressClassName="toast-progress"
      />
      
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <div className="avatar">
              <img src="https://i.imgur.com/JgYD2nQ.png" alt="SMIT Helpdesk" />
            </div>
            <div className="header-info">
              <h2>SMIT Helpdesk</h2>
              <p>{isTyping ? 'Typing...' : 'Online'}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="action-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#7c8b96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>No messages yet</h3>
              <p>Start the conversation with SMIT Helpdesk</p>
            </div>
          ) : (
            <div className="messages-list">
              <div className="welcome-message">
                <div className="message received">
                  <div className="message-content">
                    <p>Hello! Welcome to SMIT Helpdesk. How can we assist you today?</p>
                    <span className="message-time">{format(new Date(), 'h:mm a')}</span>
                  </div>
                </div>
              </div>
              
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === currentUser ? 'sent' : 'received'}`}
                >
                  {message.sender !== currentUser && (
                    <div className="message-sender">Helpdesk</div>
                  )}
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="message-input-container">
          <div className="input-wrapper">
            <button type="button" className="attach-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59723 21.9983 8.005 21.9983C6.41277 21.9983 4.8858 21.3658 3.76 20.24C2.63421 19.1142 2.00174 17.5872 2.00174 15.995C2.00174 14.4028 2.63421 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38778 15.78 1.38778C16.8415 1.38778 17.8594 1.80944 18.61 2.56C19.3606 3.31056 19.7822 4.32855 19.7822 5.39C19.7822 6.45145 19.3606 7.46944 18.61 8.22L9.41 17.41C9.03471 17.7853 8.52571 17.9961 8 17.9961C7.47429 17.9961 6.96529 17.7853 6.59 17.41C6.21471 17.0347 6.00389 16.5257 6.00389 16C6.00389 15.4743 6.21471 14.9653 6.59 14.59L15.07 6.1" stroke="#7c8b96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              rows={1}
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="send-button"
            >
              {messageInput.trim() ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="#b0b8bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        :root {
          --primary-color: #4361ee;
          --primary-light: #e6f0fd;
          --secondary-color: #3f37c9;
          --text-color: #2b2d42;
          --text-light: #8d99ae;
          --bg-color: #f8f9fa;
          --white: #ffffff;
          --gray-light: #f1f3f5;
          --gray-medium: #dee2e6;
          --gray-dark: #adb5bd;
          --success-color: #4cc9f0;
          --warning-color: #f8961e;
          --error-color: #f72585;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          --transition: all 0.3s ease;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--bg-color);
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: var(--text-color);
        }

        .chat-container {
          width: 100%;
          max-width: 420px;
          height: 90vh;
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .chat-header {
          padding: 16px;
          background: var(--white);
          border-bottom: 1px solid var(--gray-medium);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-info h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .header-info p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: var(--text-light);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-light);
          transition: var(--transition);
        }

        .action-button:hover {
          background: var(--gray-light);
          color: var(--text-color);
        }

        .messages-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: var(--white);
          background-image: radial-gradient(var(--gray-medium) 1px, transparent 1px);
          background-size: 16px 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
          color: var(--text-color);
        }

        .empty-state p {
          font-size: 0.9rem;
          color: var(--text-light);
          max-width: 280px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .welcome-message {
          margin-bottom: 16px;
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.sent {
          align-self: flex-end;
          background: var(--primary-color);
          color: var(--white);
          border-bottom-right-radius: 4px;
        }

        .message.received {
          align-self: flex-start;
          background: var(--white);
          color: var(--text-color);
          border: 1px solid var(--gray-medium);
          border-bottom-left-radius: 4px;
        }

        .message-sender {
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-light);
        }

        .message-content p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 0.7rem;
          opacity: 0.8;
          display: block;
          text-align: right;
          margin-top: 6px;
        }

        .message.received .message-time {
          color: var(--text-light);
        }

        .message.sent .message-time {
          color: rgba(255,255,255,0.8);
        }

        .message-input-container {
          padding: 12px 16px;
          background: var(--white);
          border-top: 1px solid var(--gray-medium);
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: var(--gray-light);
          border-radius: 24px;
          padding: 8px 12px;
        }

        textarea {
          flex: 1;
          padding: 8px 0;
          border: none;
          background: transparent;
          resize: none;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          max-height: 120px;
          color: var(--text-color);
        }

        textarea::placeholder {
          color: var(--gray-dark);
        }

        .attach-button {
          background: transparent;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-light);
          transition: var(--transition);
          flex-shrink: 0;
        }

        .attach-button:hover {
          background: rgba(0,0,0,0.05);
          color: var(--text-color);
        }

        .send-button {
          background: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: var(--secondary-color);
          transform: translateY(-1px);
        }

        .send-button:disabled {
          background: var(--gray-light);
          cursor: not-allowed;
        }

        /* Scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--gray-dark);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--text-light);
        }

        /* Toast styles */
        :global(.toast-message) {
          font-family: 'Inter', sans-serif;
          border-radius: var(--border-radius-sm) !important;
          box-shadow: var(--box-shadow) !important;
        }

        :global(.toast-progress) {
          background: var(--primary-color) !important;
        }
      `}</style>
    </div>
  )
}