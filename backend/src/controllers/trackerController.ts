import { Request, Response } from 'express';
import { TrackerService } from '../services/trackerService';

export class TrackerController {
  private service: TrackerService;

  constructor(service: TrackerService) {
    this.service = service;
  }

  recordEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { website, tracker_domain, timestamp } = req.body as {
        website?: string;
        tracker_domain?: string;
        timestamp?: string;
      };

      if (!website || !tracker_domain) {
        res.status(400).json({ error: 'website and tracker_domain are required' });
        return;
      }

      const result = await this.service.recordEvent({
        website,
        tracker_domain,
        timestamp: timestamp || new Date().toISOString(),
      });

      res.status(201).json(result);
    } catch (err) {
      console.error('[Controller] recordEvent error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      res.json(stats);
    } catch (err) {
      console.error('[Controller] getStats error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTopCompanies = async (_req: Request, res: Response): Promise<void> => {
    try {
      const companies = await this.service.getTopCompanies();
      res.json(companies);
    } catch (err) {
      console.error('[Controller] getTopCompanies error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTopWebsites = async (_req: Request, res: Response): Promise<void> => {
    try {
      const websites = await this.service.getTopWebsites();
      res.json(websites);
    } catch (err) {
      console.error('[Controller] getTopWebsites error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.service.getCategories();
      res.json(categories);
    } catch (err) {
      console.error('[Controller] getCategories error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
