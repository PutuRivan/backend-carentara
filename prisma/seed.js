const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Enkripsi password
  const hashedPassword1 = await bcrypt.hash('user123', 10);
  const hashedPassword2 = await bcrypt.hash('owner123', 10);
  const hashedPassword3 = await bcrypt.hash('admin123', 10);

  await prisma.user.createMany({
    data: [
      {
        id: 'user1', // bisa pakai cuid() atau biarkan prisma generate jika tidak ingin set manual
        email: 'user1@example.com',
        name: 'John Doe',
        password: hashedPassword1,
        phoneNumber: '628123456789', // format E.165 (tidak boleh diawali 0)
        role: 'USER',
      },
      {
        id: 'owner1',
        email: 'owner1@example.com',
        name: 'Jane Smith',
        password: hashedPassword2,
        phoneNumber: '628987654321',
        role: 'OWNER',
      },
      {
        id: 'admin1',
        email: 'admin1@example.com',
        name: 'Admin User',
        password: hashedPassword3,
        phoneNumber: '628555666777',
        profilePicture: 'https://example.com/profile3.jpg',
        role: 'ADMIN',
      },
    ],
    skipDuplicates: true, // supaya tidak error jika seed dijalankan ulang
  });

  console.log('✅ Seeding user selesai');
}

main()
  .catch((e) => {
    console.error("❌ Gagal menyimpan data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });