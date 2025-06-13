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
      addressId,
    } = req.body;

    // Validasi field wajib
    if (!make || !model || !year || !licensePlate || !pricePerDay || !description || !ownerId || !addressId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Cek plat nomor unik
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate },
    });

    if (existingCar) {
      return res.status(400).json({ message: 'License Plate already exists' });
    }

    // Buat data mobil (tanpa gambar dulu)
    const car = await prisma.car.create({
      data: {
        make,
        model,
        year: parseInt(year),
        licensePlate,
        pricePerDay: parseFloat(pricePerDay),
        description,
        ownerId,
        addressId,
      },
    });

    // Upload gambar jika ada file
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'cars' }, // folder di Cloudinary
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Image upload failed', error: error.message });
          }

          // Simpan data gambar ke database
          await prisma.carImage.create({
            data: {
              id: uuidv4(),
              url: result.secure_url,
              isPrimary: true,
              carId: car.id,
            },
          });

          res.status(201).json({ message: 'Car created successfully', car });
        }
      );

      // Kirim buffer ke Cloudinary
      result.end(req.file.buffer);
    } else {
      // Jika tanpa gambar
      res.status(201).json({ message: 'Car created successfully (without image)', car });
    }
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