import express from "express";

const app = express();
const PORT = 3002;

// Home route
app.get("/", (req, res) => {
    res.send("Hello from Home Route");
});

// About route
app.get("/about", (req, res) => {
    res.send("Hello from About Route");
});

// Courses route
app.get("/courses", (req, res) => {
    res.send("Hello from Courses Route");
});

// Students route
app.get("/students", (req, res) => {
    res.send("Hello from Students Route");
});

// API route
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Hello from Express API"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});