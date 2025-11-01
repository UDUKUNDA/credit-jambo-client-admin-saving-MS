import { Response } from 'express';

export function ok(res: Response, data: any, status = 200) {
  return res.status(status).json(data);
}

export function serverError(res: Response, error: any) {
  const message = error?.message || 'Internal Server Error';
  return res.status(500).json({ error: message });
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

export function unauthorized(res: Response, message: string) {
  return res.status(401).json({ error: message });
}

export function notFound(res: Response, message: string) {
  return res.status(404).json({ error: message });
}