'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingDown, TrendingUp, Users, DollarSign, AlertTriangle,
  Calendar, Mail, Phone, ArrowUpRight, ArrowDownRight, Target,
  Activity, Percent, Clock, Award
} from 'lucide-react';

interface ChurnMetrics {
  totalMRR: number;
  newMRR: number;
  churnedMRR: number;
  totalCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  activeTrials: number;
  churnRate: number;
  retentionRate: number;
  averageLTV: number;
}

interface AtRiskOrganization {
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  ownerName: string;
  plan: string;
  status: string;
  riskScore: number;
  riskFactors: string[];
  daysWithoutLogin: number;
  usageLevel: string;
  createdAt: string;
  trialEndsAt?: string;
  lastLogin?: string;
}

export default function ChurnManagementPage() {
  const [metrics, setMetrics] = useState<ChurnMetrics | null>(null);
  const [atRiskOrgs, setAtRiskOrgs] = useState<AtRiskOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Récupérer les métriques
      const metricsRes = await fetch(`/api/super-admin/churn/metrics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      // Récupérer les organisations à risque
      const atRiskRes = await fetch('/api/super-admin/churn/at-risk', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const atRiskData = await atRiskRes.json();
      if (atRiskData.success) {
        setAtRiskOrgs(atRiskData.profiles);
      }

    } catch (error) {
      console.error('Erreur chargement données churn:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'bg-red-100 text-red-700 border-red-300';
    if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 60) return 'Risque élevé';
    if (score >= 40) return 'Risque moyen';
    return 'Risque faible';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-500" />
              Gestion du Churn
            </h1>
            <p className="text-gray-600 mt-2">
              Analysez vos métriques de rétention et identifiez les clients à risque
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Métriques principales */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total MRR */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">MRR Total</span>
              </div>
              <p className="text-3xl font-bold">{metrics.totalMRR.toFixed(0)} €</p>
              <p className="text-sm opacity-80 mt-1">
                +{metrics.newMRR.toFixed(0)} € nouveau
              </p>
            </div>

            {/* Total Clients */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">Clients</span>
              </div>
              <p className="text-3xl font-bold">{metrics.totalCustomers}</p>
              <p className="text-sm opacity-80 mt-1">
                +{metrics.newCustomers} nouveaux
              </p>
            </div>

            {/* Churn Rate */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">Taux de Churn</span>
              </div>
              <p className="text-3xl font-bold">{metrics.churnRate.toFixed(1)}%</p>
              <p className="text-sm opacity-80 mt-1">
                -{metrics.churnedCustomers} clients
              </p>
            </div>

            {/* Retention Rate */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">Rétention</span>
              </div>
              <p className="text-3xl font-bold">{metrics.retentionRate.toFixed(1)}%</p>
              <p className="text-sm opacity-80 mt-1">
                {metrics.activeTrials} essais actifs
              </p>
            </div>

            {/* LTV Moyen */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">LTV Moyen</span>
              </div>
              <p className="text-3xl font-bold">{metrics.averageLTV.toFixed(0)} €</p>
              <p className="text-sm opacity-80 mt-1">
                Durée moyenne 12 mois
              </p>
            </div>
          </div>

          {/* Détails MRR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nouveau MRR</p>
                  <p className="text-2xl font-bold text-gray-900">+{metrics.newMRR.toFixed(0)} €</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">De {metrics.newCustomers} nouveaux clients</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MRR Perdu (Churn)</p>
                  <p className="text-2xl font-bold text-gray-900">-{metrics.churnedMRR.toFixed(0)} €</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">De {metrics.churnedCustomers} clients perdus</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MRR Net</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(metrics.newMRR - metrics.churnedMRR) >= 0 ? '+' : ''}
                    {(metrics.newMRR - metrics.churnedMRR).toFixed(0)} €
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {((metrics.newMRR - metrics.churnedMRR) / metrics.totalMRR * 100).toFixed(1)}% de croissance
              </p>
            </div>
          </div>
        </>
      )}

      {/* Organisations à risque */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Clients à Risque
              </h2>
              <p className="text-gray-600 mt-1">
                {atRiskOrgs.length} organisation(s) nécessitent votre attention
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {atRiskOrgs.map((org) => (
            <div key={org.organizationId} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{org.organizationName}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {org.plan}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(org.riskScore)}`}>
                      {getRiskLabel(org.riskScore)} - Score: {org.riskScore}
                    </span>
                    {org.status === 'TRIAL' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Période d'essai
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {org.ownerEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {org.daysWithoutLogin} jours sans connexion
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Créé le {new Date(org.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Facteurs de risque */}
                  <div className="flex flex-wrap gap-2">
                    {org.riskFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`mailto:${org.ownerEmail}`, '_blank')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Contacter
                  </button>
                  <button
                    onClick={() => window.location.href = `/super-admin/organizations/${org.organizationId}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voir fiche
                  </button>
                </div>
              </div>
            </div>
          ))}

          {atRiskOrgs.length === 0 && (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun client à risque détecté
              </h3>
              <p className="text-gray-600">
                Excellent ! Tous vos clients semblent engagés.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
