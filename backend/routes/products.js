const router = require('express').Router();
const ctrl = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/filters', ctrl.getCategories);
router.get('/:id', ctrl.getOne);
router.post('/:id/reviews', auth, ctrl.addReview);

module.exports = router;
