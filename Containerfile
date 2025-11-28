FROM registry.access.redhat.com/ubi8/nodejs-18-minimal:latest

USER 0
RUN mkdir -p /opt/app-root/src

COPY package*.json /opt/app-root/src
COPY servidor /opt/app-root/src/servidor

RUN chown -R 1001:0 /opt/app-root

USER 1001
WORKDIR /opt/app-root/src
ENV NODE_ENV=production
RUN npm ci

CMD ["npm", "start"]
