var express = require('express');
var router = express.Router();
const fs = require("fs");

COUNTER_FILE = "./public/json/counter.json";
DATA_FILE = "./public/json/data.json";
BLUE_RATIO_FILE = "./public/json/blueRatio.json";

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

const readBlueRatio = () => {
  const data = fs.readFileSync(BLUE_RATIO_FILE, 'utf8');
  return JSON.parse(data).blueRatio;
};

const writeBlueRatio = (blueRatio) => {
  fs.writeFileSync(BLUE_RATIO_FILE, JSON.stringify({ blueRatio }, null, 2));
};

const getUTCTimePlus8 = () => {
  const now = new Date();
  now.setHours(now.getHours() + 8);
  return now.toISOString().replace('Z', '+08:00');
};

const getNewId = () => {
  data = readData();
  if (data.length === 0){
    return 1;
  }
  return data[0].id + 1;
}

const calculateBlueRatio = (data) => {
  const totalItems = data.length;
  const blueCount = data.filter(item => item.team === 'blue').length;
  return blueCount / totalItems;
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
    "id": getNewId(),
    ...req.body,
    "time": getUTCTimePlus8()
  };
  const data = readData();
  data.unshift(newData);
  writeData(data);

  const blueRatio = calculateBlueRatio(data);
  writeBlueRatio(blueRatio);
});

router.get("/blueRatio", (req, res) => {
  const blueRatio = readBlueRatio();
  res.json({ blueRatio });
})

module.exports = router;
