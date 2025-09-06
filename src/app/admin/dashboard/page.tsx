"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar, Users, Euro, TrendingUp, Clock, CheckCircle, 
  XCircle, AlertCircle, LogOut, Menu, X, Settings,
  FileText, Bell, BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = {
    todayAppointments: 8,
    weekAppointments: 42,
    monthRevenue: 5280,
    totalClients: 127,
    pendingAppointments: 3,
    confirmedToday: 5
  };

  const todayAppointments = [
    { id: 1, time: "10:00", client: "Marie Dupont", service: "LAIA Hydro'Cleaning", status: "confirmé" },
    { id: 2, time: "11:30", client: "Sophie Martin", service: "BB Glow", status: "confirmé" },
    { id: 3, time: "14:00", client: "Julie Bernard", service: "LAIA Renaissance", status: "en-attente" },
    { id: 4, time: "15:30", client: "Emma Petit", service: "LED Thérapie", status: "confirmé" },
    { id: 5, time: "17:00", client: "Laura Moreau", service: "Éclat Suprême", status: "confirmé" },
  ];

  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
    { id: "appointments", label: "Réservations", icon: Calendar },
    { id: "clients", label: "Clients", icon: Users },
    { id: "services", label: "Services", icon: FileText },
    { id: "availability", label: "Disponibilités", icon: Clock },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mr-4"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-serif text-primary">LAIA SKIN Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-primary">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/" className="p-2 text-gray-600 hover:text-primary">
              <LogOut size={20} />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed md:relative md:flex flex-col w-64 h-full bg-white shadow-lg transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-40`}>
          <nav className="flex-1 p-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm">RDV Aujourd'hui</h3>
                    <Calendar className="text-primary" size={20} />
                  </div>
                  <p className="text-3xl font-bold">{stats.todayAppointments}</p>
                  <p className="text-green-500 text-sm mt-2">+2 depuis hier</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm">RDV cette semaine</h3>
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                  <p className="text-3xl font-bold">{stats.weekAppointments}</p>
                  <p className="text-green-500 text-sm mt-2">+15% vs sem. dernière</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm">CA du mois</h3>
                    <Euro className="text-primary" size={20} />
                  </div>
                  <p className="text-3xl font-bold">{stats.monthRevenue}€</p>
                  <p className="text-green-500 text-sm mt-2">+8% vs mois dernier</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm">Total Clients</h3>
                    <Users className="text-primary" size={20} />
                  </div>
                  <p className="text-3xl font-bold">{stats.totalClients}</p>
                  <p className="text-blue-500 text-sm mt-2">12 nouveaux ce mois</p>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Rendez-vous du jour</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {todayAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Clock className="inline mr-2 text-gray-400" size={16} />
                            {apt.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{apt.client}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{apt.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apt.status === "confirmé" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {apt.status === "confirmé" ? (
                                <CheckCircle className="mr-1" size={12} />
                              ) : (
                                <AlertCircle className="mr-1" size={12} />
                              )}
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button className="text-primary hover:text-primary-dark mr-3">Voir</button>
                            <button className="text-red-500 hover:text-red-700">Annuler</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "appointments" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Gestion des réservations</h2>
              <p className="text-gray-600">Interface de gestion complète des réservations à venir...</p>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Gestion des clients</h2>
              <p className="text-gray-600">Liste et gestion de la base clients...</p>
            </div>
          )}

          {activeTab === "availability" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Gestion des disponibilités</h2>
              <p className="text-gray-600">Configurez vos créneaux disponibles...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}