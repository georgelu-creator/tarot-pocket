import service from '../../server/reading-service.cjs';
import data from '../../.edgeone-ai/catalog.cjs';

// Route /api/health. Reports configuration only; never contacts the provider.
export default service.createCloudReadingHandler({catalog: service.catalogFromData(data)});
