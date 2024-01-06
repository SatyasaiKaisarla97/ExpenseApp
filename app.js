const express = require('express')
const path = require('path')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(express.static('public'))

app.get('/user/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/user/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }
    console.log('User data received:', { username, email, password });
    res.status(201).send({ message: 'Signup successful' });
});

app.listen(3000)