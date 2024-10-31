const express = require('express');
const cats = ['Garfield', 'Tom', 'Simba'];

const app = express();
app.use(express.json());

// curl -X GET http://localhost:5000
app.get('/', (req, res) => {
    // res.send('Hello World!');
     res.send('<h1>Hello, world!</h1>');
    // res.json({ message: 'Hello World!' });
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});