const express = require('express');
const compression = require('compression');
const helmet = require('helmet')

const app = express();

const PORT = process.env.PORT || 3033;

app.use(helmet());
app.use(compression({
    level: 8
}));

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send('Horizon starting off');
});

app.listen(PORT, () => console.log('Horizon is listening on port 3033 on local!'));