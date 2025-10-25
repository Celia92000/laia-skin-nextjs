#!/bin/bash

# Tester l'API avec le token admin
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZ4ZTFzeXYwMDAyYmx6OHd6NHAyOHcyIiwicm9sZSI6Ik9SR19BRE1JTiIsImlhdCI6MTc2MDExMTMwNywiZXhwIjoxNzYwNzE2MTA3fQ.nkJKIcL-rmAOAHXS5xee-GnnKj8cJCsHQabOyw6dED4"

echo "🧪 Test de l'API /api/admin/api-tokens"
echo "========================================"
echo ""

curl -s http://localhost:3001/api/admin/api-tokens \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

echo ""
echo "✅ Test terminé"
