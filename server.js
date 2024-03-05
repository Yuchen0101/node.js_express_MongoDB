const dotenv = require('dotenv'); // to read ENV

dotenv.config({ path: './config.env' }); // configure before require('./app')

const app = require('./app');

const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(con => {
  console.log(con.connections);
});

// after dotenv, we can access process.env.xxx
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
