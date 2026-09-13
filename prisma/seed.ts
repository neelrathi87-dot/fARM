import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing existing data...");
  await prisma.dailyExpense.deleteMany();
  await prisma.pesticideLog.deleteMany();
  await prisma.waterLog.deleteMany();
  await prisma.field.deleteMany();

  console.log("🌱 Seeding Fields...");
  const field1 = await prisma.field.create({
    data: {
      name: "North Valley Cotton",
      cropType: "Upland Cotton",
      areaAcres: 42.5,
      latitude: 36.6384,
      longitude: -119.5632,
      polygonGeoJson: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-119.566, 36.636],
            [-119.560, 36.636],
            [-119.560, 36.641],
            [-119.566, 36.641],
            [-119.566, 36.636],
          ],
        ],
      }),
    },
  });

  const field2 = await prisma.field.create({
    data: {
      name: "Block 4 Estate Vineyard",
      cropType: "Cabernet Sauvignon",
      areaAcres: 28.0,
      latitude: 38.2975,
      longitude: -122.2869,
      polygonGeoJson: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-122.290, 38.295],
            [-122.284, 38.295],
            [-122.284, 38.300],
            [-122.290, 38.300],
            [-122.290, 38.295],
          ],
        ],
      }),
    },
  });

  const field3 = await prisma.field.create({
    data: {
      name: "Sunrise Orchard Almonds",
      cropType: "Nonpareil Almonds",
      areaAcres: 55.0,
      latitude: 37.6391,
      longitude: -120.9969,
      polygonGeoJson: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-121.002, 37.636],
            [-120.992, 37.636],
            [-120.992, 37.643],
            [-121.002, 37.643],
            [-121.002, 37.636],
          ],
        ],
      }),
    },
  });

  const field4 = await prisma.field.create({
    data: {
      name: "Green River Maize Plot",
      cropType: "Hybrid Sweet Corn",
      areaAcres: 35.0,
      latitude: 36.7468,
      longitude: -119.7726,
      polygonGeoJson: JSON.stringify({
        type: "Polygon",
        coordinates: [
          [
            [-119.776, 36.744],
            [-119.769, 36.744],
            [-119.769, 36.750],
            [-119.776, 36.750],
            [-119.776, 36.744],
          ],
        ],
      }),
    },
  });

  console.log("💧 Seeding Water Logs (Dual-Water Irrigation)...");
  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  await prisma.waterLog.createMany({
    data: [
      {
        fieldId: field1.id,
        date: daysAgo(0),
        startTime: "06:00",
        endTime: "09:30",
        durationMinutes: 210,
        waterType: "NORMAL_WATER",
        deliveryMethod: "DRIP",
        motorHp: 7.5,
        flowRateLpm: 1125,
        volumeLiters: 236250,
        notes: "Morning canal deep saturation before peak heat index.",
      },
      {
        fieldId: field1.id,
        date: daysAgo(2),
        startTime: "07:00",
        endTime: "08:15",
        durationMinutes: 75,
        waterType: "LIQUID_WATER",
        deliveryMethod: "DRIP",
        motorHp: 5.0,
        flowRateLpm: 750,
        volumeLiters: 56250,
        notes: "Liquid Humic acid and potassium silicate fertigation blend.",
      },
      {
        fieldId: field2.id,
        date: daysAgo(1),
        startTime: "05:30",
        endTime: "07:30",
        durationMinutes: 120,
        waterType: "NORMAL_WATER",
        deliveryMethod: "DRIP",
        motorHp: 5.0,
        flowRateLpm: 750,
        volumeLiters: 90000,
        notes: "Scheduled deficit irrigation cycle for veraison stress control.",
      },
      {
        fieldId: field2.id,
        date: daysAgo(3),
        startTime: "06:00",
        endTime: "07:00",
        durationMinutes: 60,
        waterType: "LIQUID_WATER",
        deliveryMethod: "DRIP",
        motorHp: 3.0,
        flowRateLpm: 450,
        volumeLiters: 27000,
        notes: "Microbial compost tea & marine kelp liquid extract injection.",
      },
      {
        fieldId: field3.id,
        date: daysAgo(1),
        startTime: "04:00",
        endTime: "08:30",
        durationMinutes: 270,
        waterType: "NORMAL_WATER",
        deliveryMethod: "SPRINKLER",
        motorHp: 10.0,
        flowRateLpm: 1500,
        volumeLiters: 405000,
        notes: "Micro-sprinkler root zone saturation across East grove.",
      },
      {
        fieldId: field4.id,
        date: daysAgo(2),
        startTime: "06:30",
        endTime: "10:30",
        durationMinutes: 240,
        waterType: "NORMAL_WATER",
        deliveryMethod: "FLOOD",
        motorHp: 10.0,
        flowRateLpm: 1500,
        volumeLiters: 360000,
        notes: "Furrow flood irrigation with canal seasonal allocation.",
      },
    ],
  });

  console.log("🧪 Seeding Pesticide Logs (SI Units)...");
  await prisma.pesticideLog.createMany({
    data: [
      {
        fieldId: field1.id,
        date: daysAgo(1),
        timestamp: daysAgo(1),
        chemicalName: "Chlorpyrifos 20% EC",
        targetPest: "Cotton Bollworm & Aphids",
        formulationType: "LIQUID",
        dosageRate: 2.5,
        dosageUnit: "ML_PER_L",
        sprayVolumeLiters: 600,
        netChemicalAmount: 1.5,
        netChemicalUnit: "L",
        applicationMethod: "FOLIAR",
      },
      {
        fieldId: field2.id,
        date: daysAgo(2),
        timestamp: daysAgo(2),
        chemicalName: "Mancozeb 75% WP",
        targetPest: "Powdery Mildew & Black Rot",
        formulationType: "DRY_POWDER",
        dosageRate: 2.0,
        dosageUnit: "G_PER_L",
        sprayVolumeLiters: 800,
        netChemicalAmount: 1.6,
        netChemicalUnit: "kg",
        applicationMethod: "FOLIAR",
      },
      {
        fieldId: field3.id,
        date: daysAgo(4),
        timestamp: daysAgo(4),
        chemicalName: "Cold-Pressed Neem Oil Extract",
        targetPest: "Spider Mites & San Jose Scale",
        formulationType: "LIQUID",
        dosageRate: 5.0,
        dosageUnit: "ML_PER_L",
        sprayVolumeLiters: 500,
        netChemicalAmount: 2.5,
        netChemicalUnit: "L",
        applicationMethod: "FOLIAR",
      },
      {
        fieldId: field4.id,
        date: daysAgo(3),
        timestamp: daysAgo(3),
        chemicalName: "Bacillus Thuringiensis (Dipel)",
        targetPest: "Fall Armyworm",
        formulationType: "DRY_POWDER",
        dosageRate: 1.5,
        dosageUnit: "G_PER_L",
        sprayVolumeLiters: 400,
        netChemicalAmount: 600,
        netChemicalUnit: "g",
        applicationMethod: "FOLIAR",
      },
      {
        fieldId: field1.id,
        date: daysAgo(6),
        timestamp: daysAgo(6),
        chemicalName: "Imidacloprid 17.8 SL",
        targetPest: "Whiteflies & Jassids",
        formulationType: "LIQUID",
        dosageRate: 0.5,
        dosageUnit: "ML_PER_L",
        sprayVolumeLiters: 300,
        netChemicalAmount: 150,
        netChemicalUnit: "mL",
        applicationMethod: "FOLIAR",
      },
    ],
  });

  console.log("💰 Seeding Daily Farm Expenditures...");
  await prisma.dailyExpense.createMany({
    data: [
      {
        fieldId: field1.id,
        date: daysAgo(0),
        category: "LABOUR",
        amount: 540.0,
        quantity: 6,
        unitRate: 90.0,
        description: "Manual weeding & drip line flushing crew (6 workers x $90)",
      },
      {
        fieldId: field3.id,
        date: daysAgo(1),
        category: "FUEL",
        amount: 228.25,
        quantity: 55,
        unitRate: 4.15,
        description: "Diesel for John Deere 5075E Orchard Tractor (55 L @ $4.15)",
      },
      {
        fieldId: field2.id,
        date: daysAgo(2),
        category: "PESTICIDES",
        amount: 340.0,
        quantity: 4,
        unitRate: 85.0,
        description: "4x 5kg bags Mancozeb 75% WP organic protective fungicide",
      },
      {
        fieldId: field1.id,
        date: daysAgo(3),
        category: "MAINTENANCE",
        amount: 185.5,
        quantity: 1,
        unitRate: 185.5,
        description: "Submersible pump pressure regulator valve & filter seal kit",
      },
      {
        fieldId: null, // Farm-wide general expense
        date: daysAgo(4),
        category: "OTHER",
        amount: 150.0,
        quantity: 1,
        unitRate: 150.0,
        description: "Soil salinity & composite laboratory electrical conductivity testing",
      },
      {
        fieldId: field4.id,
        date: daysAgo(5),
        category: "LABOUR",
        amount: 400.0,
        quantity: 5,
        unitRate: 80.0,
        description: "Furrow ridge repair and canal intake clearing crew",
      },
      {
        fieldId: field1.id,
        date: daysAgo(7),
        category: "FUEL",
        amount: 166.0,
        quantity: 40,
        unitRate: 4.15,
        description: "Borewell diesel generator backup runtime (40 L)",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
