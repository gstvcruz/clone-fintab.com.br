import database from "infra/database";
import { ValidationError } from "infra/errors";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const res = await database.query({
      text: `SELECT email FROM users WHERE LOWER(email) = LOWER($1);`,
      values: [email],
    });

    if (res.rowCount > 0) {
      throw new ValidationError({
        message: "E-mail em uso.",
        action: "Utilize um e-mail diferente.",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const res = await database.query({
      text: `SELECT username FROM users WHERE LOWER(username) = LOWER($1)`,
      values: [username],
    });

    if (res.rowCount > 0) {
      throw new ValidationError({
        message: "Nome de usuário em uso.",
        action: "Utilize um nome de usuário diferente.",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const res = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return res.rows[0];
  }
}

const user = {
  create,
};

export default user;
