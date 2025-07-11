# Use Node.js for build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm install @rollup/rollup-linux-x64-gnu --save-dev
# The build script in package.json will now print the env vars
RUN npm run build

# Use a lightweight image to serve static files
FROM node:20-alpine AS prod
WORKDIR /app
# Install serve and its dependencies
RUN apk add --no-cache nodejs npm
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]