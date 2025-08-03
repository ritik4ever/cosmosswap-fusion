const crypto = require('crypto')
const { createHash } = require('crypto')

// In-memory storage (replace with database in production)
const swaps = new Map()
const userTransactions = new Map()

const swapController = {
  // Generate cryptographically secure random secret
  generateSecret: async (req, res) => {
    try {
      const secret = crypto.randomBytes(32).toString('hex')
      console.log('Generated secret:', secret)
      res.json({ secret })
    } catch (error) {
      console.error('Secret generation failed:', error)
      res.status(500).json({ error: 'Failed to generate secret' })
    }
  },

  // Generate SHA-256 hashlock from secret
  generateHashlock: async (req, res) => {
    try {
      const { secret } = req.body
      
      if (!secret) {
        return res.status(400).json({ error: 'Secret is required' })
      }

      const hashlock = createHash('sha256').update(secret).digest('hex')
      console.log('Generated hashlock:', hashlock)
      res.json({ hashlock })
    } catch (error) {
      console.error('Hashlock generation failed:', error)
      res.status(500).json({ error: 'Failed to generate hashlock' })
    }
  },

  // Store swap details
  storeSwap: async (req, res) => {
    try {
      const {
        swapId,
        secret,
        hashlock,
        timelock,
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
        receiverAddress,
        ethAccount,
        cosmosAccount
      } = req.body

      console.log('Storing swap:', { swapId, fromChain, toChain, amount })

      const swapData = {
        swapId,
        secret,
        hashlock,
        timelock,
        fromChain,
        toChain,
        fromToken,
        toToken,
        amount,
        receiverAddress,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      swaps.set(swapId, swapData)

      // Add to user transactions
      if (ethAccount) {
        if (!userTransactions.has(ethAccount)) {
          userTransactions.set(ethAccount, [])
        }
        userTransactions.get(ethAccount).push(swapId)
      }
      
      if (cosmosAccount) {
        if (!userTransactions.has(cosmosAccount)) {
          userTransactions.set(cosmosAccount, [])
        }
        userTransactions.get(cosmosAccount).push(swapId)
      }

      res.json({ success: true, swapId })
    } catch (error) {
      console.error('Store swap failed:', error)
      res.status(500).json({ error: 'Failed to store swap' })
    }
  },

  // Get swap details
  getSwap: async (req, res) => {
    try {
      const { swapId } = req.params
      const swap = swaps.get(swapId)

      if (!swap) {
        return res.status(404).json({ error: 'Swap not found' })
      }

      // Don't expose the secret in the response
      const { secret, ...swapWithoutSecret } = swap
      res.json(swapWithoutSecret)
    } catch (error) {
      console.error('Get swap failed:', error)
      res.status(500).json({ error: 'Failed to get swap' })
    }
  },

  // Get user transactions
  getUserTransactions: async (req, res) => {
    try {
      const { ethAccount, cosmosAccount } = req.query
      const allTransactions = []

      console.log('Getting transactions for:', { ethAccount, cosmosAccount })

      // Mock some transactions for demo
      const mockTransactions = [
        {
          id: '0x1234567890abcdef',
          fromChain: 'ethereum',
          toChain: 'cosmos',
          fromToken: 'ETH',
          toToken: 'ATOM',
          amount: '1.5',
          status: 'completed',
          timestamp: Date.now() - 3600000,
          hash: '0x1234567890abcdef1234567890abcdef12345678',
          withdrawHash: 'cosmos1234567890abcdef1234567890abcdef12345678'
        },
        {
          id: '0xabcdef1234567890',
          fromChain: 'cosmos',
          toChain: 'ethereum',
          fromToken: 'ATOM',
          toToken: 'ETH',
          amount: '100',
          status: 'pending',
          timestamp: Date.now() - 1800000,
          hash: 'cosmos1234567890abcdef1234567890abcdef12345678'
        },
        {
          id: '0x9876543210fedcba',
          fromChain: 'ethereum',
          toChain: 'cosmos',
          fromToken: 'USDC',
          toToken: 'ATOM',
          amount: '500',
          status: 'failed',
          timestamp: Date.now() - 7200000,
          hash: '0x9876543210fedcba9876543210fedcba98765432'
        }
      ]

      allTransactions.push(...mockTransactions)

      // Add real stored swaps
      if (ethAccount && userTransactions.has(ethAccount)) {
        const ethTxs = userTransactions.get(ethAccount)
        ethTxs.forEach(swapId => {
          const swap = swaps.get(swapId)
          if (swap) {
            allTransactions.push({
              id: swapId,
              fromChain: swap.fromChain,
              toChain: swap.toChain,
              fromToken: swap.fromToken,
              toToken: swap.toToken,
              amount: swap.amount,
              status: swap.status,
              timestamp: swap.createdAt,
              hash: swap.initiateHash,
              withdrawHash: swap.withdrawHash
            })
          }
        })
      }

      if (cosmosAccount && userTransactions.has(cosmosAccount)) {
        const cosmosTxs = userTransactions.get(cosmosAccount)
        cosmosTxs.forEach(swapId => {
          const swap = swaps.get(swapId)
          if (swap && !allTransactions.find(tx => tx.id === swapId)) {
            allTransactions.push({
              id: swapId,
              fromChain: swap.fromChain,
              toChain: swap.toChain,
              fromToken: swap.fromToken,
              toToken: swap.toToken,
              amount: swap.amount,
              status: swap.status,
              timestamp: swap.createdAt,
              hash: swap.initiateHash,
              withdrawHash: swap.withdrawHash
            })
          }
        })
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp)

      res.json(allTransactions)
    } catch (error) {
      console.error('Get user transactions failed:', error)
      res.status(500).json({ error: 'Failed to get user transactions' })
    }
  },

  // Update swap status
  updateSwapStatus: async (req, res) => {
    try {
      const { swapId } = req.params
      const { status, txHash } = req.body

      const swap = swaps.get(swapId)
      if (!swap) {
        return res.status(404).json({ error: 'Swap not found' })
      }

      swap.status = status
      swap.updatedAt = Date.now()

      if (txHash) {
        if (status === 'completed') {
          swap.withdrawHash = txHash
        } else {
          swap.initiateHash = txHash
        }
      }

      swaps.set(swapId, swap)
      res.json({ success: true })
    } catch (error) {
      console.error('Update swap status failed:', error)
      res.status(500).json({ error: 'Failed to update swap status' })
    }
  },

  // Process pending swaps (monitoring service)
  processPendingSwaps: async (req, res) => {
    try {
      const pendingSwaps = Array.from(swaps.values()).filter(
        swap => swap.status === 'pending'
      )

      const results = []

      for (const swap of pendingSwaps) {
        try {
          // Mock processing
          results.push({ 
            swapId: swap.swapId, 
            result: { action: 'monitoring', message: 'Swap in progress' }
          })
        } catch (error) {
          console.error(`Failed to process swap ${swap.swapId}:`, error)
          results.push({ swapId: swap.swapId, error: error.message })
        }
      }

      res.json({ processed: results.length, results })
    } catch (error) {
      console.error('Process pending swaps failed:', error)
      res.status(500).json({ error: 'Failed to process pending swaps' })
    }
  }
}

module.exports = swapController