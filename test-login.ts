import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

async function testLogin() {
  const email = 'admin@laiaskin.com';
  const password = 'A9v*hVrWSG9KeqRA';
  
  console.log('🔐 Test de connexion');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('');
  
  // Simuler la génération de token
  const token = jwt.sign(
    {
      userId: 'cmfxe1syv0002blz8wz4p28w2',
      role: 'ORG_OWNER',
      organizationId: '9739c909-c945-4548-bf53-4d226457f630'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('✅ Token généré:');
  console.log(token);
  console.log('');
  
  // Décoder le token pour vérifier
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  console.log('✅ Token décodé:');
  console.log('User ID:', decoded.userId);
  console.log('Role:', decoded.role);
  console.log('Organization ID:', decoded.organizationId);
  console.log('');
  
  // Vérifier le rôle pour la redirection
  const roleRedirects: Record<string, string> = {
    'SUPER_ADMIN': '/super-admin',
    'ORG_OWNER': '/admin',
    'ORG_ADMIN': '/admin',
    'LOCATION_MANAGER': '/admin/planning',
    'STAFF': '/admin/planning',
    'RECEPTIONIST': '/admin/planning',
    'ADMIN': '/admin',
    'admin': '/admin',
    'COMPTABLE': '/admin/finances',
    'EMPLOYEE': '/admin/planning',
    'STAGIAIRE': '/admin/planning',
    'CLIENT': '/espace-client',
    'client': '/espace-client'
  };
  
  const redirectPath = roleRedirects[decoded.role] || '/';
  console.log('✅ Redirection attendue:', redirectPath);
  console.log('');
  
  // Vérifier AuthGuard
  const adminRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ACCOUNTANT', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ADMIN', 'admin', 'EMPLOYEE', 'COMPTABLE', 'STAGIAIRE'];
  const isAdmin = adminRoles.includes(decoded.role);
  console.log('✅ Autorisé pour l\'admin:', isAdmin ? 'OUI' : 'NON');
  
  if (!isAdmin) {
    console.log('❌ PROBLÈME: Le rôle', decoded.role, 'n\'est pas dans la liste des rôles admin');
  }
}

testLogin();
