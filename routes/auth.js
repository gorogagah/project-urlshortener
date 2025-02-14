const express = require('express');
const bcrypt = require('bcrypt');
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

module.exports = router;