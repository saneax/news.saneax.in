# Build stage
FROM docker.io/node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Serve stage
FROM docker.io/nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy content directory so it exists even without volume mount
COPY --from=build /app/src/content /usr/share/nginx/html/content

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]