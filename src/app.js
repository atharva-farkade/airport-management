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
import adminrouter from './routes/admin.routes.js';
import staffrouter from './routes/staff.routes.js';

app.use('/api/v1/users', userRouter);
app.use('/api/v1', adminrouter);
app.use('/api/v1', staffrouter);


app.get('/', (req, res) => {
  res.send('Server is running fine ✅');
});

export {app}; 