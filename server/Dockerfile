FROM node:22-alpine
WORKDIR /app
# Explicit file copies keep .env, browser records, and unrelated files out of layers.
COPY --chown=node:node server/reading-service.cjs server/reading-prompts.cjs ./server/
COPY --chown=node:node reading-deck.js spread-content.js reading-scenarios.js ./
USER node
ENV TAROT_AI_HOST=0.0.0.0 PORT=8787
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/reading-service.cjs"]
