#!/bin/bash
# Script pour voir les logs du serveur Next.js

echo "📋 Logs du serveur Next.js (PID 7433)..."
echo "=========================================="
echo ""

# Essayer plusieurs méthodes
if [ -d "/proc/7433" ]; then
    echo "✅ Processus 7433 existe"
    echo ""

    # Vérifier les fichiers de log
    if [ -f "/proc/7433/fd/1" ]; then
        echo "📄 stdout:"
        cat /proc/7433/fd/1 2>/dev/null | tail -50
    fi

    if [ -f "/proc/7433/fd/2" ]; then
        echo ""
        echo "📄 stderr:"
        cat /proc/7433/fd/2 2>/dev/null | tail -50
    fi
else
    echo "❌ Processus 7433 non trouvé"
fi
