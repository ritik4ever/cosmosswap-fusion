#!/bin/bash

echo "🚀 CosmosSwap Complete Setup Script"
echo "==================================="

# Check if contract is deployed
if [ -z "$1" ]; then
    echo "❌ Please provide the deployed contract address"
    echo "Usage: ./scripts/complete-setup.sh <contract-address>"
    exit 1
fi

CONTRACT_ADDRESS=$1

echo "📝 Updating frontend configuration..."

# Update frontend .env
cd frontend
if [ -f ".env" ]; then
    # Update existing .env
    sed -i "s/VITE_ETHEREUM_CONTRACT_ADDRESS=.*/VITE_ETHEREUM_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}/" .env
else
    # Create new .env
    cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ETHEREUM_CHAIN_ID=11155111
VITE_ETHEREUM_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
VITE_COSMOS_CONTRACT_ADDRESS=cosmos14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s4hmalr
VITE_ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
VITE_COSMOS_RPC_URL=https://rpc-cosmoshub.cosmos-apis.com
VITE_APP_NAME=CosmosSwap
EOF
fi

echo "✅ Frontend configuration updated!"

# Update backend .env
cd ../backend
if [ -f ".env" ]; then
    sed -i "s/ETHEREUM_CONTRACT_ADDRESS=.*/ETHEREUM_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}/" .env
else
    cat > .env << EOF
NODE_ENV=development
PORT=3001
ETHEREUM_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
COSMOS_CONTRACT_ADDRESS=cosmos14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s4hmalr
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
COSMOS_RPC_URL=https://rpc-cosmoshub.cosmos-apis.com
FRONTEND_URL=http://localhost:5173
EOF
fi

echo "✅ Backend configuration updated!"

cd ..

echo ""
echo "🎉 Setup complete! Your contract is deployed at: ${CONTRACT_ADDRESS}"
echo ""
echo "🚀 Next steps:"
echo "1. Start the application: npm run dev"
echo "2. Visit http://localhost:5173"
echo "3. Connect your wallets"
echo "4. Start cross-chain swapping!"
echo ""
echo "📋 Useful links:"
echo "- Contract on Etherscan: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3001/health"