const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
const envPath = path.join(__dirname, "../.env");

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        return trimmed.replace(/^DATABASE_URL=/, "").replace(/^["']|["']$/g, "");
      }
    }
  }
  return "";
}

const dbUrl = getDatabaseUrl();
const targetProvider =
  dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")
    ? "postgresql"
    : "sqlite";

let schema = fs.readFileSync(schemaPath, "utf-8");
const currentMatch = schema.match(/provider\s*=\s*"([^"]+)"/g);

if (schema.includes(`provider = "${targetProvider}"`)) {
  console.log(`✓ Schema Prisma já está configurado para: ${targetProvider}`);
} else {
  console.log(`⚡ Ajustando provider do Prisma schema para: ${targetProvider}`);
  schema = schema.replace(
    /datasource db {\s*provider\s*=\s*"[^"]+"/m,
    `datasource db {\n  provider = "${targetProvider}"`
  );
  fs.writeFileSync(schemaPath, schema, "utf-8");
  console.log(`✓ Provider atualizado para ${targetProvider}.`);
}

// Executa prisma generate
try {
  console.log("⚙ Gerando Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (e) {
  console.error("Erro ao gerar Prisma Client:", e.message);
}
