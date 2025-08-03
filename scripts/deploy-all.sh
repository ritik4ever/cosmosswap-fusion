#!/bin/bash

set -e

echo "🚀 CosmosSwap Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env file not found. Please copy from .env.example and configure.${NC}"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}❌ frontend/.env file not found. Please copy from .env.example and configure.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Building Ethereum contracts...${NC}"
cd contracts/ethereum
npm install
npx hardhat compile
echo -e "${GREEN}✅ Ethereum contracts compiled${NC}"

echo -e "${BLUE}🚀 Deploying Ethereum contracts to Sepolia...${NC}"
npx hardhat run scripts/deploy.js --network sepolia
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ethereum contracts deployed successfully${NC}"
else
    echo -e "${RED}❌ Ethereum deployment failed${NC}"
    exit 1
fi

cd ../..

echo -e "${BLUE}🔨 Building Cosmos contracts...${NC}"
cd contracts/cosmos
if command -v cargo &> /dev/null; then
    cargo build --release --target wasm32-unknown-unknown
    echo -e "${GREEN}✅ Cosmos contracts compiled${NC}"
else
    echo -e "${YELLOW}⚠️  Cargo not found. Skipping Cosmos contract compilation.${NC}"
fi

cd ../..

echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd frontend
npm install
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

echo -e "${BLUE}🖥️  Setting up backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

cd ..

echo -e "${BLUE}🧪 Running tests...${NC}"
npm run test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed, but continuing deployment${NC}"
fi

echo -e "${BLUE}🐳 Building Docker containers...${NC}"
docker-compose build

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env files with deployed contract addresses"
echo "2. Start the application: ${YELLOW}docker-compose up${NC}"
echo "3. Visit http://localhost:3000 to use the application"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "- Start services: ${YELLOW}docker-compose up -d${NC}"
echo "- View logs: ${YELLOW}docker-compose logs -f${NC}"
echo "- Stop services: ${YELLOW}docker-compose down${NC}"
echo "- Restart services: ${YELLOW}docker-compose restart${NC}"