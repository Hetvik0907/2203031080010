const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');
const nanoid = require('../utils/generateShortcode');
const validUrl = require('valid-url');
const geoip = require('geoip-lite');

router.post('/', async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !validUrl.isUri(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let code = shortcode || nanoid();

  // Check uniqueness
  const exists = await ShortUrl.findOne({ shortcode: code });
  if (exists) return res.status(409).json({ error: 'Shortcode already exists' });

  const expiresAt = new Date(Date.now() + validity * 60 * 1000);

  const shortUrl = new ShortUrl({ url, shortcode: code, expiresAt });
  await shortUrl.save();

  res.status(201).json({
    shortLink: `${req.protocol}://${req.get('host')}/${code}`,
    expiry: expiresAt.toISOString()
  });
});

// Statistics Endpoint
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  const entry = await ShortUrl.findOne({ shortcode: code });

  if (!entry) return res.status(404).json({ error: 'Shortcode not found' });

  res.json({
    originalUrl: entry.url,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    totalClicks: entry.totalClicks,
    clicks: entry.clicks
  });
});

module.exports = router;
