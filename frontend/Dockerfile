# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# We need to configure the API URL for production build if needed
# For now, it will use the hardcoded localhost:5000 in the services, 
# but in a real scenario we'd use environment variables here.
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
