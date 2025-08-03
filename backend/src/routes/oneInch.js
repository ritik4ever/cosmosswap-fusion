const express = require('express')
const router = express.Router()
const oneInchController = require('../controllers/oneInchController')

console.log('Loading 1inch routes...')

// Get swap quote
router.get('/quote', oneInchController.getSwapQuote)

// Build swap transaction
router.post('/swap', oneInchController.buildSwapTransaction)

// Get token list for a chain
router.get('/tokens/:chainId', oneInchController.getTokenList)

// Get token prices
router.get('/prices/:chainId', oneInchController.getTokenPrices)

// Get Fusion+ cross-chain quote
router.post('/fusion-plus/quote', oneInchController.getFusionPlusQuote)

console.log('1inch routes loaded successfully')

module.exports = router