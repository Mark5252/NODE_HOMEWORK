const express = require('express');
const cors = require('cors');
const { encodePassword } = require('./hash');

const app = express();
const users = [];
const usersData = {};

app.use(cors());
app.use(express.json());

app.post('/sign-up', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email та пароль обовʼязкові!' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Пароль має містити щонайменше 8 символів!' });
  }

  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: 'Користувач з такою поштою вже існує!' });
  }

  const hashedPassword = encodePassword(password);
  users.push({ email, password: hashedPassword });


  usersData[email] = {
    balance: 0,
    coinsPerClick: 1,
    passiveIncomePerSecond: 1,
    boughtUpgrades: [] 
  };

  return res.status(201).json({ message: 'Реєстрація успішна!', hashedPassword });
});

app.post('/sign-in', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email та пароль обовʼязкові!' });
  }

  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Користувача не знайдено!' });
  }

  const hashedPassword = encodePassword(password);
  if (user.password !== hashedPassword) {
    return res.status(401).json({ message: 'Невірний пароль!' });
  }

  return res.status(200).json({ message: 'Вхід успішний!', hashedPassword });
});

app.post('/click', (req, res) => {
  const { email, hashedPassword } = req.body;
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  if (!user) return res.status(401).json({ error: 'Невірні дані!' });

  usersData[email].balance += usersData[email].coinsPerClick;
  res.status(200).json({ balance: usersData[email].balance });
});

app.post('/passive-income', (req, res) => {
  const { email, hashedPassword } = req.body;
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  if (!user) return res.status(401).json({ error: 'Невірні дані!' });

  usersData[email].balance += usersData[email].passiveIncomePerSecond;
  res.status(200).json({ balance: usersData[email].balance });
});

app.get('/user-stats', (req, res) => {
  const { email, hashedPassword } = req.query;
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  if (!user) return res.status(401).json({ error: 'Невірні дані!' });

  res.status(200).json(usersData[email]);
});

let upgrades = [
  { id: 1, name: "Click Accelerator", description: "Speed of earning x10", price: 40 },
  { id: 2, name: "Coin Multiplier", description: "ClickCoins per click x10", price: 40 },
  { id: 3, name: "Power Tap", description: "ClickCoins per click x2", price: 20 },
  { id: 4, name: "Golden Touch", description: "Random bonus on click", price: 40 },
  { id: 5, name: "Coin Stream", description: "Passive income x10", price: 40 },
  { id: 6, name: "Mining Drone", description: "Automated clicks for 1 min", price: 100 }
];

app.get('/upgrades', (req, res) => {
  res.status(200).json(upgrades);
});

app.get('/upgrades/:id', (req, res) => {
  const upgrade = upgrades.find(u => u.id === parseInt(req.params.id));
  if (!upgrade) {
    return res.status(404).json({ error: 'Upgrade not found' });
  }
  res.status(200).json(upgrade);
});

app.post('/upgrades', (req, res) => {
  const { id, name, description, price } = req.body;

  if (
    typeof id !== 'number' ||
    typeof name !== 'string' || name.trim() === '' ||
    typeof description !== 'string' || description.trim() === '' ||
    typeof price !== 'number' || price < 0
  ) {
    return res.status(400).json({ error: 'Invalid input: id (number), name, description (non-empty), price (positive number) are required' });
  }

  if (upgrades.find(u => u.id === id)) {
    return res.status(409).json({ error: 'Upgrade with this ID already exists' });
  }

  const newUpgrade = { id, name: name.trim(), description: description.trim(), price };
  upgrades.push(newUpgrade);
  res.status(201).json(newUpgrade);
});

app.put('/upgrades/:id', (req, res) => {
  const upgrade = upgrades.find(u => u.id === parseInt(req.params.id));
  if (!upgrade) {
    return res.status(404).json({ error: 'Upgrade not found' });
  }

  const { name, description, price } = req.body;

  if (
    (name !== undefined && (typeof name !== 'string' || name.trim() === '')) ||
    (description !== undefined && (typeof description !== 'string' || description.trim() === '')) ||
    (price !== undefined && (typeof price !== 'number' || price < 0))
  ) {
    return res.status(400).json({ error: 'Invalid input: non-empty name/description, and positive number for price' });
  }

  if (name !== undefined) upgrade.name = name.trim();
  if (description !== undefined) upgrade.description = description.trim();
  if (price !== undefined) upgrade.price = price;

  res.status(200).json(upgrade);
});

app.delete('/upgrades/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = upgrades.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Upgrade not found' });
  }

  upgrades.splice(index, 1);
  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.post('/buy-upgrade', (req, res) => {
  const { email, hashedPassword, upgradeId } = req.body;
  const user = users.find(u => u.email === email && u.password === hashedPassword);
  if (!user) return res.status(401).json({ error: 'Невірні дані!' });

  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return res.status(404).json({ error: 'Апгрейд не знайдено' });

  const userData = usersData[email];

  if (userData.boughtUpgrades.includes(upgradeId)) {
    return res.status(400).json({ error: 'Цей апгрейд вже куплено' });
  }

  if (userData.balance < upgrade.price) {
    return res.status(400).json({ error: 'Недостатньо коштів' });
  }

  userData.balance -= upgrade.price;
  userData.boughtUpgrades.push(upgradeId);

  if (upgrade.id === 1 || upgrade.id === 2) {
    userData.coinsPerClick *= 10;
  } else if (upgrade.id === 3) {
    userData.coinsPerClick *= 2;
  } else if (upgrade.id === 4) {
    userData.coinsPerClick += Math.floor(Math.random() * 20 + 10);
  } else if (upgrade.id === 5) {
    userData.passiveIncomePerSecond *= 10;
  } else if (upgrade.id === 6) {
    for (let i = 0; i < 60; i++) {
      userData.balance += userData.coinsPerClick;
    }
  }  
  res.status(200).json({ message: 'Апгрейд куплено', balance: userData.balance });
});

app.listen(3000, () => {
  console.log('Сервер запущено на http://localhost:3000');
});
