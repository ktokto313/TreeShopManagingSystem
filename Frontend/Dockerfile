#Initialize image and install deps
FROM node:24-alpine
WORKDIR /usr/src
RUN adduser -D frontend && adduser frontend frontend 
COPY --chown=frontend:frontend ./package.json ./
RUN npm install -g serve
RUN npm install

#Copy the code in
COPY --chown=frontend:frontend ./*.* ./
COPY --chown=frontend:frontend ./src/. ./src/
RUN chown frontend:frontend ./
USER frontend:frontend
RUN npm run build
EXPOSE 3000
CMD ["serve", "-s", "build"]

