const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' });

module.exports = function customLogger(req, res, next) {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n`;
  logStream.write(log);
  next();
};
