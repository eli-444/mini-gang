import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function parseEnvFile(filepath) {
  const values = {};
  const content = fs.readFileSync(filepath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

function getFlag(flagName) {
  const exact = process.argv.find((argument) => argument.startsWith(`${flagName}=`));
  return exact ? exact.slice(flagName.length + 1) : undefined;
}

function resolveEnvFile() {
  const explicit = getFlag("--env");
  if (explicit) {
    const explicitPath = path.resolve(process.cwd(), explicit);
    if (!fs.existsSync(explicitPath)) {
      throw new Error(`Env file not found: ${explicit}`);
    }
    return explicitPath;
  }

  for (const candidate of [".env.local", ".env.final", ".env"]) {
    const candidatePath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(candidatePath)) return candidatePath;
  }

  throw new Error("No env file found. Checked .env.local, .env.final and .env.");
}

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3]?.trim();
  if (!email || !password) {
    throw new Error(
      "Usage: node scripts/create-admin.mjs <email> <password> [--env=.env.final] [--first-name=Admin] [--last-name=MiniGang] [--phone=0000000000]",
    );
  }

  const firstName = getFlag("--first-name") ?? "Admin";
  const lastName = getFlag("--last-name") ?? "Mini Gang";
  const phone = getFlag("--phone") ?? "";
  const envFile = resolveEnvFile();
  const env = parseEnvFile(envFile);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(`Missing Supabase credentials in ${path.basename(envFile)}.`);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let userId = null;
  const { data: createdUserData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      prenom: firstName,
      nom: lastName,
      telephone: phone,
    },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    if (!message.includes("already") && !message.includes("exists")) {
      throw createError;
    }

    const existingUser = await findUserByEmail(supabase, email);
    if (!existingUser) {
      throw new Error(`User ${email} already exists in auth but could not be loaded.`);
    }
    userId = existingUser.id;
  } else {
    userId = createdUserData.user?.id ?? null;
  }

  if (!userId) {
    throw new Error(`Unable to resolve auth user for ${email}.`);
  }

  const { error: profileError } = await supabase.from("utilisateurs").upsert(
    {
      id: userId,
      email,
      prenom: firstName,
      nom: lastName,
      telephone: phone || null,
      role: "admin",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        env_file: path.basename(envFile),
        email,
        password,
        user_id: userId,
        role: "admin",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
