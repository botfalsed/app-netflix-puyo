const app = require('./app');
const config = require('./config');

const port = config.port;

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});