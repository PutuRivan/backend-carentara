const cloudinary = require('../utils/cloudinary-config');
const deleteFromCloudinary = require('../utils/cloudinary-delete');
const extractPublicId = require('../utils/cloudinary-extract-publicid');
const uploadToCloudinary = require('../utils/cloudinary-upload');
const prisma = require('../utils/prisma');

async function getAllCars(req, res) {
  try {
    const cars = await prisma.car.findMany({
      include: {
        address: true,
        images: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            phoneNumber: true,
            profilePicture: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Success',
      data: cars
    });

  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

async function getCarsById(req, res) {
  const { id } = req.params;

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      address: true,
      images: true,
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          profilePicture: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!car) {
    return res.status(404).json({ message: 'Mobil tidak ditemukan' });
  }

  res.status(200).json({ message: "Success", data: car });
}

async function getSearchCars(req, res) {
  try {
    const { q, make, model, minPrice, maxPrice } = req.query;

    const filters = {
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(minPrice && { pricePerDay: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && {
        pricePerDay: {
          ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
          lte: parseFloat(maxPrice)
        }
      }),
    };

    const cars = await prisma.car.findMany({
      where: {
        AND: [
          filters,
          q
            ? {
              OR: [
                { make: { contains: q, mode: 'insensitive' } },
                { model: { contains: q, mode: 'insensitive' } },
                { address: { city: { contains: q, mode: 'insensitive' } } }
              ]
            }
            : {}
        ]
      },
      include: { address: true, images: true, owner: true }
    });

    res.status(200).json({
      message: 'Cars retrieved successfully',
      data: cars
    });

  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

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

async function updateCarStatus(req, res) {
  const { id_car, status } = req.body;

  if (!id_car || status === undefined) {
    return res.status(400).json({ message: 'Data Tidak Lengkap' });
  }

  const car = await prisma.car.findUnique({ where: { id: id_car } });

  if (!car) {
    return res.status(404).json({ message: 'Mobil Tidak Ditemukan' });
  }

  const updated = await prisma.car.update({
    where: { id: id_car },
    data: {
      isAvailable: status
    },
  });
  res.status(200).json({ message: "Status Mobil Di Update", data: updated });
}

async function deleteCarById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'ID mobil tidak diberikan' });
  }

  try {
    // Ambil data mobil + gambar
    const car = await prisma.car.findUnique({
      where: { id: id },
      include: { images: true } // pastikan relasi images ada di Prisma schema
    });

    if (!car) {
      return res.status(404).json({ message: 'Mobil tidak ditemukan' });
    }

    // Hapus semua gambar mobil dari Cloudinary
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        const publicId = extractPublicId(image.url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    // Hapus mobil dari database
    await prisma.car.delete({ where: { id: id } });

    res.status(200).json({ message: 'Mobil dan semua gambar berhasil dihapus' });

  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Gagal menghapus mobil', error: error.message });
  }
};


module.exports = { getAllCars, getCarsById, getSearchCars, createCar, updateCarStatus, deleteCarById };