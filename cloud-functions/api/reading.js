import service from '../../server/reading-service.cjs';
import data from '../../.edgeone-ai/catalog.cjs';

// Route /api/reading. Never start an HTTP listener inside a cloud function.
export default service.createCloudReadingHandler({catalog: service.catalogFromData(data)});
