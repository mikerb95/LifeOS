import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Uso: npx tsx scripts/hash-password.ts "tu contraseña"');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 12));
