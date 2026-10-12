import cors from 'cors';
import express from 'express';
import errorHandler from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use((request, _response, next) => {
	request.body ||= {};
	next();
});
app.use('/api', apiRouter);
app.use((_request, response) => {
	response.status(404).json({ message: 'Route not found' });
});
app.use(errorHandler);

export default app;