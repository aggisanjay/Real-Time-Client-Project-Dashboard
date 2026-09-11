import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function getClients(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ clients });
  } catch (error) {
    next(error);
  }
}

export async function getClientById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            manager: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { tasks: true },
            },
          },
        },
      },
    });

    if (!client) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } });
      return;
    }

    res.json({ client });
  } catch (error) {
    next(error);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, contactInfo } = req.body;
    const client = await prisma.client.create({
      data: { name, contactInfo },
    });
    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } });
      return;
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactInfo && { contactInfo }),
      },
    });

    res.json({ client });
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found.' } });
      return;
    }

    await prisma.client.delete({ where: { id } });
    res.json({ message: 'Client deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
