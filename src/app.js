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

export {app}; 