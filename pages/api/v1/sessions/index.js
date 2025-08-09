import { createRouter } from "next-connect";
import * as cookie from "cookie";

import { errorHandlers } from "infra/controller";
import authentication from "models/authentication";
import session from "models/session";

const router = createRouter();

router.post(async (req, res) => {
  const userInputValues = req.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    expires: newSession.expires_at,
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "PRODUCTION",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
  res.status(201).json(newSession);
});

export default router.handler(errorHandlers);
