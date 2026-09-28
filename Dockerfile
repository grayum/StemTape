# Supply a maintained, scanned immutable nginx image, e.g. nginx@sha256:...
ARG NGINX_IMAGE
FROM ${NGINX_IMAGE}
USER root
RUN addgroup -g 10001 stemtape && adduser -D -H -u 10001 -G stemtape stemtape
COPY --chown=0:0 deploy/nginx.conf /etc/nginx/nginx.conf
COPY --chown=0:0 dist/ /srv/stemtape/
RUN chmod -R a-w /srv/stemtape /etc/nginx/nginx.conf
USER 10001:10001
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
