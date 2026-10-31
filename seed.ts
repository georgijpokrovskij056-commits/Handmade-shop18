import { getDb } from "../api/queries/connection";
import { users } from "./schema";
import { findUserByUnionId } from "../api/queries/users";
import { generateTemporaryPassword, hashPassword } from "../api/password";
import { toLocalUnionId } from "../contracts/identity";

const admins = [
  { email: "admin@dom18.ru", name: "Администратор мастерской" },
  { email: "manager@dom18.ru", name: "Управляющий мастерской" },
];

async function seed() {
  const db = getDb();
  console.log("Creating the two administrator accounts...");

  for (const admin of admins) {
    const unionId = toLocalUnionId(admin.email);
    const existing = await findUserByUnionId(unionId);
    if (existing) {
      console.log(`${admin.email}: already exists`);
      continue;
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    await db.insert(users).values({
      unionId,
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: "admin",
      mustChangePassword: true,
      lastSignInAt: new Date(),
    });
    console.log(`${admin.email}: ${temporaryPassword}`);
  }

  console.log("Done. Store these temporary passwords securely; they will not be shown again.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
