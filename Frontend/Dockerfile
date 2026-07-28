#Initialize image and install deps
FROM node:24-alpine AS build
WORKDIR /usr/src
COPY --chown=frontend:frontend ./package.json ./
RUN npm install

#Copy files in
COPY ./*.* ./
COPY ./src/. ./src/
RUN npm run build

#Make a seperated layout for size optimization
FROM node:24-alpine
WORKDIR /usr/src
RUN npm install http-proxy-middleware serve-handler
RUN adduser -D frontend && adduser frontend frontend 
USER frontend:frontend
COPY --from=build --chown=frontend:frontend /usr/src/dist ./dist
COPY --from=build --chown=frontend:frontend /usr/src/serve.cjs ./serve.cjs
# RUN chown frontend:frontend ./
EXPOSE 3000
CMD ["node", "serve.cjs"]

