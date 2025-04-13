import { createRouter } from "next-connect";
import { errorHandlers } from "infra/controller";
import user from "models/user";

const router = createRouter();

router.get(async (req, res) => {
  const username = req.query.username;
  const userFound = await user.findOneByUsername(username);
  res.status(200).json(userFound);
});

export default router.handler(errorHandlers);
