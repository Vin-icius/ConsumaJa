"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const express_1 = require("express");
const error_middleware_1 = require("../middlewares/error.middleware");
function authRoutes(authController) {
    const router = (0, express_1.Router)();
    router.post('/login', async (req, res, next) => {
        try {
            await authController.login(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    router.use(error_middleware_1.errorMiddleware);
    return router;
}
