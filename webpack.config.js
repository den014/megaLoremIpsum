const autoprefixer = require('autoprefixer');

module.exports = {
	entry: __dirname + '/src/dist/js/',
	output: {
		path: '/',
		filename: 'bundle.js'
	},
	devtool: 'source-map',
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: [
								autoprefixer({
									overrideBrowserslist:  ['last 2 versions']
								})
							]
						}
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		]
	}
};
