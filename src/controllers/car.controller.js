const cloudinary = require('../utils/cloudinary-config');
const uploadToCloudinary = require('../utils/cloudinary-upload');
const prisma = require('../utils/prisma');

async function getCars(req, res) {
  const cars = await prisma.car.findMany();
  res.json(cars);
}

async function getCarsById(req, res) {
  const car = await prisma.car.findUnique({ where: { id: Number(req.params.id) } });
  if (!car) return res.status(404).json({ message: 'Mobil tidak ditemukan' });
  res.json(car);
}

async function createCar(req, res) {
  try {
    const {
      make,
      model,
      year,
      licensePlate,
      pricePerDay,
      description,
      ownerId,
      city,
      district,
      street,
      postalCode
    } = req.body;

    if (!make || !model || !year || !licensePlate || !pricePerDay || !description || !ownerId || !city || !district || !street) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingCar = await prisma.car.findUnique({
      where: { licensePlate },
    });

    if (existingCar) {
      return res.status(400).json({ message: 'License Plate already exists' });
    }

    let cloudinaryResults = [];

    // Upload semua gambar (jika ada) sebelum simpan ke DB
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file =>
          uploadToCloudinary(file.buffer, 'cars')
        );
        cloudinaryResults = await Promise.all(uploadPromises);
      } catch (err) {
        return res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
      }
    }

    // Buat Address dan Car di dalam transaction
    const [address, car] = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          city,
          district,
          street,
          postalCode: postalCode || null,
        },
      });

      const car = await tx.car.create({
        data: {
          make,
          model,
          year: parseInt(year),
          licensePlate,
          pricePerDay: parseFloat(pricePerDay),
          description,
          ownerId,
          addressId: address.id,
        },
      });

      return [address, car];
    });

    // Simpan semua gambar ke tabel CarImage
    let savedImages = [];
    if (cloudinaryResults.length > 0) {
      const carImageData = cloudinaryResults.map((result, index) => ({
        url: result.secure_url,
        isPrimary: index === 0, // gambar pertama sebagai primary
        carId: car.id,
      }));

      savedImages = await prisma.carImage.createMany({
        data: carImageData,
      });
    }

    res.status(201).json({
      message: 'Car, Address & Images created successfully',
      car,
      address,
      images: savedImages
    });

  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async function updateCarById(req, res) {
  const { name, brand, price } = req.body;
  const updated = await prisma.car.update({
    where: { id: Number(req.params.id) },
    data: { name, brand, price },
  });
  res.json(updated);
}

async function deleteCarById(req, res) {
  await prisma.car.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Mobil dihapus' });
}

module.exports = { getCars, getCarsById, createCar, updateCarById, deleteCarById };