import { Router } from 'express';
import { AuthController } from '../controls/auth.controller';
import { errorMiddleware } from '../middlewares/error.middleware';

export function authRoutes(authController: AuthController) {
  const router = Router();

  router.post('/login', async (req, res, next) => {
    try {
      await authController.login(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.use(errorMiddleware);

  return router;
}