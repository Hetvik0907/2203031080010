const express = require('express');
const mongoose = require('mongoose');
const geoip = require('geoip-lite');
const ShortUrl = require('./models/ShortUrl');
const customLogger = require('./middleware/logger');
const shortUrlRouter = require('./routes/shorturls');

mongoose.connect('mongodb://127.0.0.1:27017/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
 
})
.catch(err => {
 
});

const app = express();
app.use(express.json());
app.use(customLogger); 


app.use('/shorturls', shortUrlRouter);

app.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const entry = await ShortUrl.findOne({ shortcode: code });

    if (!entry) {
      return res.status(404).json({ error: 'Shortcode not found' });
    }

    const now = new Date();
    if (now > entry.expiresAt) {
      return res.status(410).json({ error: 'Link expired' });
    }

    const locationData = geoip.lookup(req.ip);
    const location = locationData ? locationData.country : 'Unknown';

    entry.clicks.push({
      timestamp: now,
      referrer: req.get('Referer') || 'Direct',
      location
    });

    entry.totalClicks += 1;
    await entry.save();

    return res.redirect(entry.url);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT =3000;
app.listen(PORT)
