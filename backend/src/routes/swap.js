const express = require('express')
const router = express.Router()
const swapController = require('../controllers/swapController')

console.log('Loading swap routes...')
console.log('swapController methods:', Object.keys(swapController))

// Generate secret for HTLC
router.post('/generate-secret', swapController.generateSecret)

// Generate hashlock from secret
router.post('/generate-hashlock', swapController.generateHashlock)

// Store swap details
router.post('/store', swapController.storeSwap)

// Get swap details
router.get('/:swapId', swapController.getSwap)

// Get user transactions
router.get('/transactions', swapController.getUserTransactions)

// Update swap status
router.patch('/:swapId/status', swapController.updateSwapStatus)

// Monitor and process pending swaps
router.post('/process-pending', swapController.processPendingSwaps)

console.log('Swap routes loaded successfully')

module.exports = router