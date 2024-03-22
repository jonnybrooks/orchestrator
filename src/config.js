const fs = require('fs');
const path = require('path');
const toml = require('toml');

const data = fs.readFileSync(path.resolve(__dirname, '../config.toml'), 'utf8');
const config = toml.parse(data);

module.exports = config;
