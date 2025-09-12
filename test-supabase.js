// Test de connexion Supabase
const testConnection = async () => {
  console.log("🔍 Test de connexion à Supabase...");
  console.log("URL: https://zsxweurvtsrdgehtadwa.supabase.co");
  console.log("\n⚠️  Pour que ça fonctionne, vous devez :");
  console.log("1. Avoir votre mot de passe de base de données");
  console.log("2. Le mettre dans DATABASE_URL dans .env.local");
  console.log("\nExemple de DATABASE_URL :");
  console.log("postgresql://postgres:VOTRE_MOT_DE_PASSE@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres");
}

testConnection();
