FROM node:24-alpine
WORKDIR /app
# Explicit file copies keep .env, browser records, and unrelated files out of layers.
COPY --chown=node:node server/reading-service.cjs server/reading-prompts.cjs server/telemetry.cjs ./server/
COPY --chown=node:node reading-deck.js spread-content.js reading-scenarios.js ./
RUN mkdir -p /app/data && chown node:node /app/data
USER node
ENV TAROT_AI_HOST=0.0.0.0 PORT=8787 TAROT_TELEMETRY_DB=/app/data/telemetry.sqlite
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/reading-service.cjs"]
