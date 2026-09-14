import service from '../../server/reading-service.cjs';
import data from '../../.edgeone-ai/catalog.cjs';

// Route /api/reading. Never start an HTTP listener inside a cloud function.
// EdgeOne evaluates entry modules per request. Keep limits in the warm process.
const slot = Symbol.for('tarot-pocket.cloud-reading-handler.v1');
const handle = globalThis[slot] ||= service.createCloudReadingHandler({catalog: service.catalogFromData(data)});

// The platform discovers the explicit onRequest handler during its source scan.
export default function onRequest(context) {
  return handle(context);
}
