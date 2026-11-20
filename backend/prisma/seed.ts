import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOVIES_SEED = [
  {
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    watched: false,
    prerequisiteTitles: [] as string[],
  },
  {
    title: 'Captain America: The First Avenger',
    releaseYear: 2011,
    runtime: 124,
    watched: false,
    prerequisiteTitles: [] as string[],
  },
  {
    title: 'The Avengers',
    releaseYear: 2012,
    runtime: 143,
    watched: false,
    prerequisiteTitles: ['Iron Man', 'Captain America: The First Avenger'],
  },
  {
    title: 'Captain America: Civil War',
    releaseYear: 2016,
    runtime: 147,
    watched: false,
    prerequisiteTitles: ['The Avengers'],
  },
  {
    title: 'Thor: Ragnarok',
    releaseYear: 2017,
    runtime: 130,
    watched: false,
    prerequisiteTitles: [] as string[],
  },
  {
    title: 'Avengers: Infinity War',
    releaseYear: 2018,
    runtime: 149,
    watched: false,
    prerequisiteTitles: ['Captain America: Civil War', 'Thor: Ragnarok'],
  },
  {
    title: 'Avengers: Endgame',
    releaseYear: 2019,
    runtime: 181,
    watched: false,
    prerequisiteTitles: ['Avengers: Infinity War'],
  },
  {
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    runtime: 180,
    watched: false,
    prerequisiteTitles: ['Avengers: Endgame'],
  },
];

const CINEMAS_SEED = [
  { name: 'Stark Starkplex IMAX', bundleSizes: [1, 3, 4] },
  { name: 'Wakanda Grand Cinema', bundleSizes: [2, 5] },
  { name: 'Sanctum Sanctorum Theatres', bundleSizes: [6, 9, 20] },
  { name: 'Quantum Realm Odeon', bundleSizes: [4, 6] },
];

async function main() {
  console.log('Seeding DOOMSDAY READY database with assessment sample data...');

  // Clear existing
  await prisma.movieDependency.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.cinemaBundle.deleteMany();
  await prisma.cinema.deleteMany();

  // Create movies
  const movieMap = new Map<string, string>();
  for (const m of MOVIES_SEED) {
    const created = await prisma.movie.create({
      data: {
        title: m.title,
        releaseYear: m.releaseYear,
        runtime: m.runtime,
        watched: m.watched,
      },
    });
    movieMap.set(m.title, created.id);
  }

  // Create movie dependencies
  for (const m of MOVIES_SEED) {
    const movieId = movieMap.get(m.title)!;
    for (const prereqTitle of m.prerequisiteTitles) {
      const prereqId = movieMap.get(prereqTitle)!;
      await prisma.movieDependency.create({
        data: {
          movieId,
          prerequisiteMovieId: prereqId,
        },
      });
    }
  }

  // Create cinemas with bundles
  for (const c of CINEMAS_SEED) {
    await prisma.cinema.create({
      data: {
        name: c.name,
        bundles: {
          create: c.bundleSizes.map(size => ({ bundleSize: size })),
        },
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
