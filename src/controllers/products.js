let {products} = require('../db.json');

module.exports = {
	getProducts: (req, res) => {
		res.json({products});
	},

	addProduct: (req, res) => {
		products = [...products, req.body];

		res.json({
			success: true,
			msg: 'successfully added'
		});
	},

	updateProduct: (req, res) => {
		products = products.map(product => {
			if (Number(product.id) === Number(req.body.id)) {
				return {
					...req.body,
					id: Number(req.body.id)
				};
			}

			return product;
		});

		res.send('Successfully updated product');
	},

	deleteProduct: (req, res) => {
		const {id} = req.params;

		products = products.filter(product =>
			Number(product.id) !== Number(id));

		res.send('successfully deleted product');
	}

};
