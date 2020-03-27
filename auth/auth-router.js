const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig');
const secrets = require('../config/secrets');

const router = require('express').Router();

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
        department: user.department
    };

    const options = {
        expiresIn: '1d'
    };

    return jwt.sign(payload, secrets.jwtSecret, options);
}

router.post('/register', ({body: {username, password}}, res) => {
    const encryptedPassword = bcrypt.hashSync(password, 14);

    db('users')
        .insert({username, password: encryptedPassword})
        .then(() => res.status(201).json({message: 'User Created!'}))
        .catch(() => res.status(500).json({message: 'Error creating user'}));
});

router.post('/login', (req, res) => {
    const {username, password} = req.body;

    db('users')
        .where({username})
        .first()
        .then(user => {
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({message: 'You shall not pass!'});
            }

            const token = generateToken(user);

            res.json({message: 'Logged in!', token});
        })
        .catch(e => {
            console.log(e);
            res.status(500).json({message: 'Error logging in'})
        });
});

module.exports = router;
