import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
    res.json({ message: `Request => Get ${process.env.PRODUCTION}` });
});
app.post('/', (req, res) => {
    res.json({ message: 'Request => Post' });
});
app.put('/', (req, res) => {
    res.json({ message: 'Request => Put' });
});
app.delete('/', (req, res) => {
    res.json({ message: 'Request => Delete' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 