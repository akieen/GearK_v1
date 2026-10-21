const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', verifyToken, reviewController.createReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
