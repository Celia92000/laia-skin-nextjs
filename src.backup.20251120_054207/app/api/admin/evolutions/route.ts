import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      // Récupérer les évolutions d'un client spécifique
      const evolutions = await prisma.clientEvolution.findMany({
        where: { userId },
        orderBy: { sessionDate: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      return NextResponse.json(evolutions);
    }
    
    // Récupérer toutes les évolutions
    const evolutions = await prisma.clientEvolution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(evolutions);
  } catch (error) {
    log.error("Erreur lors de la récupération des évolutions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Créer une nouvelle évolution
    const evolution = await prisma.clientEvolution.create({
      data: {
        userId: data.userId,
        sessionNumber: data.sessionNumber,
        serviceName: data.serviceName,
        sessionDate: new Date(data.sessionDate),
        beforePhoto: data.beforePhoto,
        afterPhoto: data.afterPhoto,
        videoUrl: data.videoUrl,
        improvements: data.improvements ? JSON.stringify(data.improvements) : null,
        clientFeedback: data.clientFeedback,
        adminNotes: data.adminNotes,
        skinAnalysis: data.skinAnalysis,
        treatedAreas: data.treatedAreas ? JSON.stringify(data.treatedAreas) : null,
        productsUsed: data.productsUsed ? JSON.stringify(data.productsUsed) : null,
        hydrationLevel: data.hydrationLevel,
        elasticity: data.elasticity,
        pigmentation: data.pigmentation,
        wrinkleDepth: data.wrinkleDepth
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(evolution);
  } catch (error) {
    log.error("Erreur lors de la création de l'évolution:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Mettre à jour une évolution existante
    const evolution = await prisma.clientEvolution.update({
      where: { id: data.id },
      data: {
        sessionNumber: data.sessionNumber,
        serviceName: data.serviceName,
        sessionDate: new Date(data.sessionDate),
        beforePhoto: data.beforePhoto,
        afterPhoto: data.afterPhoto,
        videoUrl: data.videoUrl,
        improvements: data.improvements ? JSON.stringify(data.improvements) : null,
        clientFeedback: data.clientFeedback,
        adminNotes: data.adminNotes,
        skinAnalysis: data.skinAnalysis,
        treatedAreas: data.treatedAreas ? JSON.stringify(data.treatedAreas) : null,
        productsUsed: data.productsUsed ? JSON.stringify(data.productsUsed) : null,
        hydrationLevel: data.hydrationLevel,
        elasticity: data.elasticity,
        pigmentation: data.pigmentation,
        wrinkleDepth: data.wrinkleDepth
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(evolution);
  } catch (error) {
    log.error("Erreur lors de la mise à jour de l'évolution:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }
    
    await prisma.clientEvolution.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Erreur lors de la suppression de l'évolution:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}