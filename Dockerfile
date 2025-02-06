# ---- Build Stage ----
  FROM node:18-alpine AS builder

  # Set working directory
  WORKDIR /build
  
  # Copy package.json and yarn.lock files
  COPY package.json ./
  
  # Copy .env file
  COPY .env ./
  
  # Disable Telemetry
  RUN npx next telemetry disable
  
  # Install dependencies
  RUN yarn install --frozen-lockfile
  
  # Copy the rest of your app's source files
  COPY . ./
  
  # Build app
  RUN yarn run build
  
  # ---- Production Stage ----
  FROM node:18-alpine AS production
  
  # Set working directory
  WORKDIR /app
  
  RUN apk add --no-cache curl bash git yarn && rm -rf /var/cache/apk/* /root/.npm /usr/local/share/.cache/yarn
  
  RUN npm i -g husky
  
  # Copy the built files from the previous stage
  COPY --from=builder /build/.env ./.env
  COPY --from=builder /build/.next ./.next
  COPY --from=builder /build/public ./public
  COPY --from=builder /build/package.json ./package.json
  
  
  # Install production dependencies
  RUN yarn install --production --frozen-lockfile && yarn cache clean
  
  # Expose the listening port
  EXPOSE 3000
  # Run the app
  CMD ["yarn", "run", "start"]
  