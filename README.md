# JS Mentor

JS Mentor is a web application designed to help mentors and students collaborate on coding tasks in real-time. The project includes a client built with React and a server built with Node.js and Express, using Socket.io for real-time communication.

## Features

- Real-time collaboration on coding tasks using Socket.io
- Mentor and student roles with different permissions
- Syntax highlighting and code editing with `react-simple-code-editor` and `highlight.js`

## Getting Started

### Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)

### Installation

Clone the repository:

- git clone https://github.com/nivswisa11/js-mentor.git
- cd js-mentor

Install dependencies for the client:

- cd client
- npm install

Install dependencies for the server:

- cd ../server
- npm install

### Running locally

Start the server:

- cd server
- node server.js

start the client:

- cd ../client
- npm start

The application will be available at http://localhost:3000

## How to use the app

- Lobby: View and select code blocks to work on.
- Code Block: Edit code in real-time. Mentors have read-only access, while students can edit the code.
- Real-time changes: See the code being written in real time using sockets.

