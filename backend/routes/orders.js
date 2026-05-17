const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.use(auth);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrder);
router.put('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
