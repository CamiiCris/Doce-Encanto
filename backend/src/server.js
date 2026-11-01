'use strict';
require('dotenv').config();
const { app } = require('./app');
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`🧁 Doce Encanto: http://localhost:${port}`));
