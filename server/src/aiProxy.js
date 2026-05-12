const express = require('express');
const axios = require('axios');
const router = express.Router();
const AI_URL = 'http://localhost:8000';

router.post('/calculate-compatibility', async (req, res) => {
  try {
    const b = req.body;
    if (b.user1) b.user1.looking_for = b.user1.looking_for || b.user1.lookingFor || '';
    if (b.user2) b.user2.looking_for = b.user2.looking_for || b.user2.lookingFor || '';
    const r = await axios.post(AI_URL + '/calculate-compatibility', b);
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/analyze-personality', async (req, res) => {
  try {
    const b = req.body;
    if (b.profile) b.profile.looking_for = b.profile.looking_for || b.profile.lookingFor || '';
    const r = await axios.post(AI_URL + '/analyze-personality', b);
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/generate-message', async (req, res) => {
  try {
    const b = req.body;
    ['my_profile', 'their_profile'].forEach(k => {
      if (b[k]) b[k].looking_for = b[k].looking_for || b[k].lookingFor || '';
    });
    const r = await axios.post(AI_URL + '/generate-message', b);
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
