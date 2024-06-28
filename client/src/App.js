import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './App.css';

const socket = io('https://vercel.com/nivs-projects-35681ef1/js-mentor-server.vercel.app'); // Connect to the server

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/codeblock/:id" element={<CodeBlock />} />
        </Routes>
      </Router>
  );
};

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    fetch('https://vercel.com/nivs-projects-35681ef1/js-mentor-server.vercel.app/api/codeblocks') // Fetch code blocks from the server
        .then((response) => response.json())
        .then((data) => setCodeBlocks(data)); // Set the code blocks state
  }, []);

  return (
      <div className="container">
        <h1>Choose code block</h1>
        <ul>
          {codeBlocks.map((block, index) => (
              <li key={index}>
                <Link to={`/codeblock/${index}`}>
                  {block.title}
                </Link>
              </li>
          ))}
        </ul>
      </div>
  );
};

const normalizeCode = (code) => {
  let normalizedCode = code.replace(/\s+/g, ''); // Remove all whitespace
  normalizedCode = normalizedCode.trim();
  return normalizedCode;
};

const CodeBlock = () => {
  const { id } = useParams(); // Get the code block index from URL parameters
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [roleMessage, setRoleMessage] = useState('');

  useEffect(() => {
    socket.emit('joinCodeBlock', id); // Join the code block room

    socket.on('codeBlockData', (data) => {
      setCode(data.code);
      setIsMentor(data.isMentor);
      const normalizedCode = normalizeCode(data.code);
      const normalizedSolution = normalizeCode(data.solution);
      // Check if the student code is identical to the solution except for whitespaces
      if (normalizedCode === normalizedSolution) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
      // Display hello message in every code block
      if (data.isMentor) {
        setRoleMessage('Hello, Mentor');
      } else {
        setRoleMessage('Hello, Student');
      }
    });

    socket.on('codeUpdate', ({ newCode, isCorrect }) => {
      setCode(newCode);
      setIsCorrect(isCorrect);
    });

    return () => {
      socket.off('codeBlockData');
      socket.off('codeUpdate');
    };
  }, [id]);

  const handleChange = (newCode) => {
    setCode(newCode);
    socket.emit('codeChange', { id, newCode });
  };

  const highlightCode = (code) => {
    return hljs.highlight(code, { language: 'javascript' }).value; // Highlight the code syntax
  };

  return (
      <div className="container">
        <h1>Code Block</h1>
        <p>{roleMessage}</p>
        <div className="editor-container">
          {/* If it's the mentor then show the code in read-only, otherwise make it editable */}
          {isMentor ? (
              <pre>
            <code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
          </pre>
          ) : (
              <Editor
                  value={code}
                  onValueChange={handleChange}
                  highlight={highlightCode}
                  padding={10}
                  className="code-editor"
              />
          )}
        </div>
        {/* If the code is the correct solution code then show a smiley, otherwise show nothing */}
        {isCorrect ? <div className="smiley" style={{ fontSize: '5rem' }}>😊</div> : null}
        <div className="button-container">
          <button onClick={() => navigate('/')}>Return to Lobby</button>
        </div>
      </div>
  );
};

export default App;
