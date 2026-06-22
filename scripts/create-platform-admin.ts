/**
 * Creates a platform admin account in Supabase.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/create-platform-admin.ts \
 *     --email you@example.com --password 'your-secure-password' --name 'Site Owner'
 */
import { createClient } from "@supabase/supabase-js";
import { hashOrganizerPassword, validateOrganizerPassword } from "../lib/auth/organizer-password";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const email = readArg("--email")?.trim().toLowerCase();
const password = readArg("--password");
const name = readArg("--name")?.trim() || null;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Set them in .env.local and run with --env-file=.env.local",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "Usage: npx tsx --env-file=.env.local scripts/create-platform-admin.ts " +
      "--email you@example.com --password '...' [--name 'Site Owner']",
  );
  process.exit(1);
}

const passwordError = validateOrganizerPassword(password);
if (passwordError) {
  console.error(passwordError);
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: existing } = await supabase
    .from("platform_admins")
    .select("email")
    .eq("email", email!)
    .maybeSingle();

  if (existing) {
    console.error(`Admin account already exists for ${email}`);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("platform_admins")
    .insert({
      email,
      name,
      password_hash: hashOrganizerPassword(password!),
    })
    .select("id, email")
    .single();

  if (error) {
    if (error.message.includes("Could not find the table")) {
      console.error(
        "Run supabase/migrations/0020_platform_admins.sql in the Supabase SQL editor first.",
      );
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }

  console.log(`Created platform admin: ${data.email} (${data.id})`);
  console.log("Sign in at /admin/login on your deployed site.");
}

main();
