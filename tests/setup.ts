// Inject node-fetch to test code node-side
(global as any).fetch = require('node-fetch');

// Load .env variables
require('dotenv').config();
