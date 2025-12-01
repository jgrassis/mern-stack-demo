const express = require('express');
const connectDB = require('./config/db')

const app = express();

// connect db
connectDB();

// Init Middldeware
app.use(express.json({extended:false}));

app.get('/', (req, res) => res.send('API Running'));

// Define routs
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));

// Set the port to env variable, or default to 3001
const PORT = process.env.PORT || 3001;

// Start listening for requests...
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
