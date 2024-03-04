const dotenv = require('dotenv'); // read ENV
dotenv.config({ path: './config.env' }); // configure before require('./app')

const app = require('./app');

// after dotenv, we can access process.env.xxx
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
