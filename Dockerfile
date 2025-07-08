# Use Node.js for build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Use a lightweight image to serve static files
FROM node:20-alpine AS prod
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
