const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const leadRoutes = require('./routes/leadRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dealRoutes = require('./routes/dealRoutes');
const taskRoutes = require('./routes/taskRoutes');
const fileRoutes = require('./routes/fileRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require('./routes/smsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const socialRoutes = require('./routes/socialRoutes');
const pageRoutes = require('./routes/pageRoutes');
const formRoutes = require('./routes/formRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Global Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Set crossOriginResourcePolicy to false to allow serving local static files/uploads smoothly while maintaining other robust protections
// app.use(mongoSanitize()); // Disabled due to Express 5 compatibility

// HTTP Request Logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Security Middleware: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
