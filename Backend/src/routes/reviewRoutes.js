const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, reviewController.getAllReviewsAdmin);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/check-eligibility/:productId', verifyToken, reviewController.checkEligibility);
router.post('/', verifyToken, reviewController.createReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
