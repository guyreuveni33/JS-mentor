const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "https://js-mentor.vercel.app", // Replace with your client URL
        methods: ["GET", "POST"],
        credentials: true
    },
});

app.use(cors({
    origin: "https://js-mentor.vercel.app", // Replace with your client URL
    methods: ["GET", "POST"],
    credentials: true
}));

// app.use(cors());

app.get('/', (req, res) => {
    res.json('Hello, World');
});

// Initial set of code blocks with their solutions
const originalCodeBlocks = [
    {
        title: "Async Case",
        code: "async function fetchData() { \n" +
            " // Your code here \n" +
            " return await fetch('/api/data'); \n" +
            " }",
        solution: "async function fetchData() { \n" +
            " try { \n" +
            " const response = await fetch('/api/data'); return response.json(); \n" +
            " } \n " +
            " catch (error) { \n" +
            " console.error(error); \n" +
            " } \n" +
            " }"
    },
    {
        title: "Event Handling",
        code: "document.getElementById('myBtn').addEventListener('click', function() { \n" +
            " // Your code here \n" +
            " });",
        solution: "document.getElementById('myBtn').addEventListener('click', function() { \n" +
            " alert('Button clicked!'); \n" +
            " });"
    },
    {
        title: "Promises",
        code: "let promise = new Promise(function(resolve, reject) { \n" +
            " // Your code here \n" +
            " });",
        solution: "let promise = new Promise(function(resolve, reject) { \n" +
            " let success = true; \n" +
            " if (success) { \n" +
            " resolve('done'); \n" +
            " } else { \n" +
            " reject('error'); \n" +
            " } \n" +
            " });"
    },
    {
        title: "Arrow Functions",
        code: "let sum = (a, b) => { \n" +
            " // Your code here \n" +
            " };",
        solution: "let sum = (a, b) => { \n" +
            " return a+b;\n" +
            " };"
    },
];

let codeBlocks = JSON.parse(JSON.stringify(originalCodeBlocks));
let mentorId = null; // Variable to keep track of the mentor's socket ID

app.get('/codeblocks', (req, res) => {
    res.json(codeBlocks);
});

io.on('connection', (socket) => {
    // When a client connects
    socket.on('joinCodeBlock', (codeBlockIndex) => {
        socket.join(`codeBlock-${codeBlockIndex}`); // Join a specific room based on code block index

        if (!mentorId) {
            mentorId = socket.id; // Assign the first user as mentor
        }

        // const isMentor = (socket.id === mentorId); // Determine if the user is the mentor
        let isMentor;
        if (socket.id === mentorId) {
            isMentor = true;
        } else {
            isMentor = false;
        }

        const codeBlockData = { ...codeBlocks[codeBlockIndex], isMentor }; // Include mentor status in data
        socket.emit('codeBlockData', codeBlockData);
    });

    socket.on('codeChange', ({ id, newCode }) => {
        const normalizedNewCode = normalizeCode(newCode);
        const normalizedSolution = normalizeCode(codeBlocks[id].solution);
        let isCorrect;
        if (normalizedNewCode === normalizedSolution) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
        codeBlocks[id].code = newCode; // Update the code block with new code
        io.to(`codeBlock-${id}`).emit('codeUpdate', { newCode, isCorrect }); // Notify all clients in the room
    });

    socket.on('disconnect', () => {
        if (socket.id === mentorId) {
            mentorId = null;
        }

        if (io.engine.clientsCount === 0) {
            codeBlocks = JSON.parse(JSON.stringify(originalCodeBlocks));
        }
    });
});

const normalizeCode = (code) => {
    let normalizedCode = code.replace(/\s+/g, ''); // Remove all whitespace
    normalizedCode = normalizedCode.trim();
    return normalizedCode;
};

server.listen(4000, () => {
});
