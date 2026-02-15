"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const referral_controllers_1 = require("./referral.controllers");
const router = express_1.default.Router();
router.get("/stats", auth_1.default, referral_controllers_1.referralControllers.getReferralStats);
exports.referralRoutes = router;
//# sourceMappingURL=referral.routes.js.map