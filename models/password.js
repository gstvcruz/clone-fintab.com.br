import bcryptjs from "bcryptjs";

const ROUNDS = process.env.NODE_ENV === "production" ? 14 : 11;
const PEPPER = process.env.PEPPER;

async function hash(password) {
  return await bcryptjs.hash(addPepper(password), ROUNDS);
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(addPepper(providedPassword), storedPassword);
}

function addPepper(password) {
  return password + PEPPER;
}

const password = {
  hash,
  compare,
};

export default password;
