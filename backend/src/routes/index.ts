import { Router } from 'express';
import { TrackerController } from '../controllers/trackerController';

export function createRouter(controller: TrackerController): Router {
  const router = Router();

  // POST /api/tracker-event
  router.post('/tracker-event', controller.recordEvent);

  // GET /api/stats
  router.get('/stats', controller.getStats);

  // GET /api/top-companies
  router.get('/top-companies', controller.getTopCompanies);

  // GET /api/top-websites
  router.get('/top-websites', controller.getTopWebsites);

  // GET /api/categories
  router.get('/categories', controller.getCategories);

  return router;
}
