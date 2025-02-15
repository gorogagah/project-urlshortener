const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require("../database/index");

const router = express.Router();

router.post("/register", async function(req, res){
    const { email, password } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Store user
    db.addUser(email, passwordHash).then((data) => {
        console.log(`user added: ${data}`);
        return res.json({ message: "user registered", user: data });
    }).catch((error) => {
        console.log(`error on adding user: ${error}`);
        return res.status(400).json({ error: "database insert", message: "failed to add user to database"});
    });
});

router.post("/login", async function(req, res){
    const { email, password } = req.body;

    const user = await db.getUser(email);
    if(!user){
        return res.status(401).json({ error: 'authentication', message: "invalid email or password" });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({ error: 'authentication', message: "invalid email or password" });
        }
    } catch (error) {
        console.log(`error on comparing password: ${error}`);
        return res.status(500).json({ error: "password compare", message: "failed to compare password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: 'login successful', token: token });
});

module.exports = router;