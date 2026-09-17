FROM node:16.20.2-alpine3.18 AS build

WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.27.4-alpine

RUN apk add --no-cache su-exec
COPY docker/nginx-main.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/kitchen-management-entrypoint
COPY --from=build /app/dist/app /usr/share/nginx/html

RUN chmod 755 /usr/local/bin/kitchen-management-entrypoint \
    && mkdir -p /var/lib/kitchen-management \
    && chown -R nginx:nginx /var/lib/kitchen-management /var/cache/nginx /var/log/nginx /var/run

ENV NGINX_PORT=8080 \
    API_PROTOCOL=http \
    API_HOST=backend \
    API_PORT=8080 \
    API_CONTEXT= \
    WEBSOCKET_ENDPOINT=http://backend:8080/ws \
    WEBSOCKET_DEFAULT_TOPIC=/topic/greetings \
    WEBSOCKET_PKMI_TOPIC=/topic/pkmi

VOLUME ["/var/lib/kitchen-management"]
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/kitchen-management-entrypoint"]
CMD ["nginx", "-g", "daemon off;"]