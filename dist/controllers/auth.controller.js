"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  // 이메일과 패스워드를 가지고 데이터베이스를 뒤져서 이러한 유저가 있는지 체크
  // 만약 없거나, 있다고 해도 비번ㅇ이 틀린 경우: 이메일 또는 비밀번호가 일치하지 않습니다.
  // 만약 있다면 해당 유저의 토큰을 만들어서: 세션에 {이메일, 토큰} 세트를 저장
  // 토큰을 보내준다.
  const token = crypto.randomUUID();
  return res.json({ token });
});
router.post("/signout", (req, res) => {
  return res.json({});
});
exports.default = router;
