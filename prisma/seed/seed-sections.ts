import prisma from "@/lib/prisma";

async function seedSesctions() {
  const s = await prisma.teachingAssignment.count({
    where: {
      section: null,
    },
  });

  console.log("Count of teaching assignments with null section:", s);
  console.log("Updating teaching assignments with null section to 'A'...");
  await prisma.teachingAssignment.updateMany({
    where: {
      section: null,
    },
    data: {
      section: "A",
    },
  });

  const e = await prisma.enrollment.count({
    where: {
      section: null,
    },
  });

  console.log("Count of enrollments with null section:", e);
  console.log("Updating enrollments with null section to 'A'...");
  await prisma.enrollment.updateMany({
    where: {
      section: null,
    },
    data: {
      section: "A",
    },
  });
}

await seedSesctions();
