#!/bin/bash

set -e

echo "🚀 CosmosSwap Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}🔍 Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check npm version
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm version: ${NPM_VERSION}${NC}"

# Create logs directory
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs

# Install root dependencies
echo -e "${BLUE}📦 Installing root dependencies...${NC}"
npm install

# Setup Ethereum contracts
echo -e "${BLUE}🔨 Setting up Ethereum contracts...${NC}"
cd contracts/ethereum

# Fix package.json versions
echo -e "${BLUE}🔧 Fixing package versions...${NC}"
cat > package.json << 'EOL'
{
  "name": "cosmosswap-ethereum-contracts",
  "version": "1.0.0",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:local": "hardhat run scripts/deploy.js --network localhost",
    "deploy:sepolia": "hardhat run scripts/deploy.js --network sepolia",
    "verify": "hardhat verify"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^2.0.2",
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "@nomiclabs/hardhat-etherscan": "^3.1.7",
    "hardhat": "^2.19.4",
    "ethers": "^5.7.2",
    "@openzeppelin/contracts": "^4.9.3"
  },
  "dependencies": {
    "dotenv": "^16.3.1"
  }
}
EOL

npm install
echo -e "${GREEN}✅ Ethereum contracts setup complete${NC}"

cd ../..

# Setup frontend
echo -e "${BLUE}🎨 Setting up frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✅ Frontend setup complete${NC}"

cd ..

# Setup backend
echo -e "${BLUE}🖥️  Setting up backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend setup complete${NC}"

cd ..

# Create environment files if they don't exist
echo -e "${BLUE}⚙️  Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📝 Created backend/.env from example. Please update with your configuration.${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}📝 Created frontend/.env from example. Please update with your configuration.${NC}"
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${YELLOW}📝 Created .env from example. Please update with your configuration.${NC}"
fi

# Create Dockerfile for frontend if it doesn't exist
echo -e "${BLUE}🐳 Creating Docker files...${NC}"
cat > frontend/Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
EOL

# Create Dockerfile for backend if it doesn't exist
cat > backend/Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
EOL

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your .env files with actual configuration values"
echo "2. Compile and deploy contracts: ${YELLOW}cd contracts/ethereum && npm run compile${NC}"
echo "3. Start development servers: ${YELLOW}npm run dev${NC}"
echo "4. Visit http://localhost:5173 to use the application"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "- Start all services: ${YELLOW}npm run dev${NC}"
echo "- Test contracts: ${YELLOW}cd contracts/ethereum && npm test${NC}"
echo "- Build for production: ${YELLOW}npm run build${NC}"
echo "- Start with Docker: ${YELLOW}docker-compose up${NC}"