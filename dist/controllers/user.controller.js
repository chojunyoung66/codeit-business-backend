"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/me", (req, res) => {
    return res.json({
        me: {
            username: "Harry Potter",
        },
    });
});
exports.default = router;
