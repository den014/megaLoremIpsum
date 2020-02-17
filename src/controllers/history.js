let {history} = require('../history.json');

module.exports = {
	get: (req, res) => {
		res.json({history});
	},

	add: (req, res) => {
		history = [...history, req.body];

		res.json({
			success: true,
			msg: 'successfully added'
		});
	}
};
