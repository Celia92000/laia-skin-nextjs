import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🖼️ Mise à jour des images des articles de blog...")

  const blogUpdates = [
    {
      slug: "hydro-naissance-soin-signature-anti-age",
      mainImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=80",
        "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80",
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80"
      ])
    },
    {
      slug: "renaissance-dermapen-regeneration-cellulaire",
      mainImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
        "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
      ])
    },
    {
      slug: "hydro-cleaning-alternative-hydrafacial",
      mainImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1487412840599-d0e5537f5c52?w=800&q=80",
        "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80",
        "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=800&q=80"
      ])
    },
    {
      slug: "bb-glow-teint-parfait-sans-maquillage",
      mainImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
        "https://images.unsplash.com/photo-1560750133-c5d4ef4de911?w=800&q=80",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80"
      ])
    },
    {
      slug: "led-therapie-lumiere-regeneratrice",
      mainImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
        "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&q=80"
      ])
    }
  ]

  for (const update of blogUpdates) {
    const updated = await prisma.blogPost.update({
      where: { slug: update.slug },
      data: {
        mainImage: update.mainImage,
        gallery: update.gallery
      }
    })
    console.log(`✅ Images mises à jour pour : ${updated.title}`)
  }

  console.log("\n🎉 Toutes les images des articles ont été mises à jour !")
  console.log("Les articles de blog ont maintenant des photos différentes des prestations.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())