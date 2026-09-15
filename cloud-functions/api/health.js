import service from '../../server/reading-service.cjs';
import data from '../../.edgeone-ai/catalog.cjs';

// Route /api/health. Reports configuration only; never contacts the provider.
const slot = Symbol.for('tarot-pocket.cloud-reading-handler.v2');
const handle = globalThis[slot] ||= service.createCloudReadingHandler({catalog: service.catalogFromData(data)});

export default function onRequest(context) {
  return handle(context);
}
