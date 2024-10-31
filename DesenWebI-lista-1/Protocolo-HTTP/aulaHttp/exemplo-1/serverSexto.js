const express = require('express');
const cats = ['Garfield', 'Tom','Simba'];

const app = express();
app.use(express.json());

// curl -X GET http://localhost:5000/cats?name=Garf
app.get('/cats', (req, res) => {
    if(req.query.name) {
        res.json(cats.filter(cat =>
            cat.toLowerCase().includes(req.query.name.toLowerCase())
    ))
    } else {
        res.json(cats);
    }
});

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000/cats?name=Garf');
});