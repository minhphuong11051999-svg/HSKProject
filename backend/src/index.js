const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`HSK6 backend listening on port ${env.port}`);
});
