# Use Node 20 base image
FROM node:20.18.0

# Set working directory inside the container
WORKDIR /app

# Ensure development mode inside the container so sequelize.sync({ alter: true }) runs
ENV NODE_ENV=development

# Install dependencies including devDependencies (ts-node-dev, typescript)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy TypeScript config and source code
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Expose the application port
EXPOSE 3001

# Run the server directly from TypeScript using ts-node-dev
# This prints "Savings Management Backend running on port ..." and triggers DB sync
CMD ["npm", "run", "dev"]