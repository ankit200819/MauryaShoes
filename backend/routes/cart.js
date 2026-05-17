const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:id', ctrl.updateCart);
router.delete('/:id', ctrl.removeFromCart);
router.delete('/', ctrl.clearCart);

module.exports = router;
