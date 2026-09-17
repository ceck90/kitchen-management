#!/bin/sh
set -eu

config_dir=/var/lib/kitchen-management
config_file="$config_dir/runtime-config.js"

mkdir -p "$config_dir"
chown nginx:nginx "$config_dir"

cat > "$config_file" <<EOF
window.__KITCHEN_MANAGEMENT_CONFIG__ = {
  api: {
    protocol: "${API_PROTOCOL}",
    hostname: "${API_HOST}",
    port: "${API_PORT}",
    context: "${API_CONTEXT}"
  },
  webSocket: {
    endpoint: "${WEBSOCKET_ENDPOINT}",
    defaultTopic: "${WEBSOCKET_DEFAULT_TOPIC}",
    pkmiTopic: "${WEBSOCKET_PKMI_TOPIC}"
  }
};
EOF
chown nginx:nginx "$config_file"

envsubst '${NGINX_PORT}' < /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

exec su-exec nginx "$@"