const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});

