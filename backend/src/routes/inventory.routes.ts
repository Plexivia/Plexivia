import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as inventory from '../controllers/inventoryController.js';

const router = Router();

router.use(requireAuth);

// Connected e-commerce stores and their unit-level inventory (proxied with each store's sync key)
router.get('/stores', inventory.getInventoryStores);
router.get('/:store/items', inventory.listItems);
router.post('/:store/items', inventory.createItem);
router.put('/:store/items/:id', inventory.updateItem);
router.post('/:store/items/:id/adjust', inventory.adjustItem);
router.get('/:store/movements', inventory.listMovements);
router.get('/:store/receipts', inventory.listReceipts);

export default router;
