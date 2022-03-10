const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
// Initialize compression module
const compression = require('compression');
// ratelimiter external lib
const rateLimit = require('express-rate-limit');

// Extra task rate-limit-api-calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('*', cors());

// extra task - whilelisting
const corsOptions = {
  origin: 'http://localhost', // ip for whitelist *make real
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);

// Compress all HTTP responses
app.use(compression());
// END of Middlewares

// Main Route *for testing
app.get('/', (req, res) => {
  res.send('API is working');
});

// /api/currentPrice/  - cors protected route - extra task
app.get(`/api/currentPrice/`, cors(corsOptions), async (req, res) => {
  const response = await axios(
    `https://api.coindesk.com/v1/bpi/currentprice.json`
  ).catch((err) => console.log(err));
  if (!response) {
    return res.status(400).send('Failure');
  }
  res.status(200).send(response.data.value);
  // console.log(response.data);
});

// task route + history parameters
app.get(`/api/getPriceHistory/:startDate/:endDate`, async (req, res) => {
  // route parameters
  const { startDate, endDate } = req.params;
  const response = await axios(
    `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`
  ).catch((err) => console.log(err));
  if (!response) {
    return res.status(400).send('Failure');
  }
  res.status(200).send(response.data.bpi);

  let dataFromOrigin = JSON.stringify(response.data.bpi);

  // extract integer Numbers and console only multiplied by 1000 currency price ticket=integerCurrencyBpi
  let numberExtraction = dataFromOrigin.replace(/\D/g, '');
  let integerCurrencyBpi = numberExtraction.substring(8, 14);
  // * 1000
  console.log(integerCurrencyBpi * 1000);
});
//

// The server object listens on port 8080
app.listen(8080, () => {
  console.log(
    'Listening web server on port 8080 cors enabled for extra task route '
  );
});
