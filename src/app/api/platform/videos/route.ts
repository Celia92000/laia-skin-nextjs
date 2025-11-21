import { NextResponse } from 'next/server'

// URLs des vidéos configurables uniquement par le super-admin
// Ces valeurs seront retournées aux clients pour affichage

export async function GET() {
  // TODO: Récupérer depuis la base de données (table PlatformSettings)
  // Pour l'instant, on lit depuis les variables d'environnement ou valeurs par défaut

  const videos = {
    welcomeTutorial: process.env.WELCOME_TUTORIAL_VIDEO_URL || '',
    demoVideo: process.env.DEMO_VIDEO_URL || '',
  }

  return NextResponse.json(videos)
}

// POST réservé au super-admin
export async function POST(request: Request) {
  try {
    // TODO: Vérifier que l'utilisateur est super-admin
    const body = await request.json()

    // TODO: Sauvegarder dans la base de données
    // await prisma.platformSettings.update({
    //   where: { key: 'videos' },
    //   data: { value: JSON.stringify(body) }
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}