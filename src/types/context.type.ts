import { Request, Response } from 'express';

type ContextType = {
  req: Request;
  res: Response;
};

export default ContextType;
