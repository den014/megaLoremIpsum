const express = require('express');
const router = express.Router();

const {
	get,
	add,
} = require('../controllers/history');

router.route('/')
	.get(get)
	.post(add);

module.exports = router;

