const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const routesProducts = require('./routes/products');
const routesHistory = require('./routes/history');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.config');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(webpackDevMiddleware(webpack(webpackConfig)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/products', routesProducts);
app.use('/history', routesHistory);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
	console.log(`server on port ${app.get('port')}`);
});
