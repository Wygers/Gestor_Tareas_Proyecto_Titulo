const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});
router.get('/registro', (req, res) => {
    res.render('registro', { error: null });
});
router.post('/login', (req, res) => {
    res.send("Procesando login...");
});
router.post('/registro', (req, res) => {
    res.send("Procesando registro...");
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;