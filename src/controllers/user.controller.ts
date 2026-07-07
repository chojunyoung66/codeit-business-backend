import { Router, Request, Response } from "express";

const router = Router();

router.get("/me", (req: Request, res: Response) => {
  return res.json({
    me: {
      username: "Harry Potter",
    },
  });
});

export default router;