var express = require('express');
var router = express.Router();
const fs = require("fs");

COUNTER_FILE = "./public/json/counter.json";
DATA_FILE = "./public/json/data.json";

const readCounter = () => {
  const data = fs.readFileSync(COUNTER_FILE, 'utf8');
  return JSON.parse(data).count;
};

const writeCounter = (count) => {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count }, null, 2));
};

const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

let count = readCounter();

router.get("/counter", (req, res) => {
  res.json({ count });
});

router.post("/counter", (req, res) => {
  count++;
  writeCounter(count);
});

router.get('/data', (req, res) => {
  const data = readData();
  res.json(data);
});

router.post("/data", (req, res) => {
  const newData = {
    ...req.body,
    "time": new Date().toISOString()
  };
  const data = readData();
  data.unshift(newData);
  writeData(data);
});

module.exports = router;
