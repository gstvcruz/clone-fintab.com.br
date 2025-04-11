import { createRouter } from "next-connect";
import { errorHandlers } from "infra/controller";
import user from "models/user";

const router = createRouter();

router.post(async (req, res) => {
  const newUser = await user.create(req.body);
  res.status(201).json(newUser);
});

export default router.handler(errorHandlers);
