const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
});

const User = mongoose.model('User', UserSchema);

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: 'user' });
    await newUser.save();
    res.status(201).send('User created');
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
        res.json({ role: user.role, token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.listen(5000, () => {
    console.log('Server running on https://auth-7mrs.onrender.com');
});
