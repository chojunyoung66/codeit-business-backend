"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const memo_controller_1 = __importDefault(require("./controllers/memo.controller"));
const user_controller_1 = __importDefault(require("./controllers/user.controller"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_controller_1.default);
app.use("/api/users", user_controller_1.default);
app.use("/api/memos", memo_controller_1.default);
app.use((err, _req, res, _next) => {
    if (err) {
        res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
    }
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
