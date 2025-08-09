import user from "models/user";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await validateEmail(providedEmail);
    await comparePasswords(providedPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "E-mail ou senha inválidos.",
        action: "Verifique o e-mail e senha informados.",
        cause: error,
      });
    }

    throw error;
  }

  async function validateEmail(providedEmail) {
    try {
      const storedUser = await user.findOneByEmail(providedEmail);
      return storedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "E-mail inválido.",
        });
      }

      throw error;
    }
  }

  async function comparePasswords(providedPassword, storedUserPassword) {
    const isPasswordMatch = await password.compare(
      providedPassword,
      storedUserPassword,
    );

    if (isPasswordMatch) {
      return;
    }

    throw new UnauthorizedError({
      message: "Senha inválida.",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
