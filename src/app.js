import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());


import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import staffRouter from './routes/staff.routes.js';
import vendorRouter from './routes/vendor.routes.js';
import financeRouter from './routes/finance.routes.js';

 

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/vendor', vendorRouter);
app.use('/api/v1/finance', financeRouter);



app.get('/', (req, res) => {
  res.send('Server is running fine ✅');
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isOperational = statusCode < 500 || err.isOperational === true;
    const message = isOperational ? err.message : "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV !== "production" && isOperational && { stack: err.stack })
    });
});

export {app}; 