// src/components/Statistiques.jsx - VERSION COMPLÈTE ULTRA-AMÉLIORÉE

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line, Doughnut, Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import '../App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Statistiques = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/stats`,
          { withCredentials: true }
        );
        setStats(data.stats);
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const translateGender = (genderKey) => {
    const translations = {
      'Male': 'Hommes',
      'Female': 'Femmes', 
      'Other': 'Autres',
      'Non défini': 'Non défini'
    };
    return translations[genderKey] || genderKey;
  };

  const translateAgeGroup = (boundary) => {
    const ageGroups = {
      0: '0-17 ans',
      18: '18-29 ans',
      30: '30-44 ans',
      45: '45-59 ans',
      60: '60-74 ans',
      75: '75+ ans',
      'Inconnu': 'Inconnu'
    };
    return ageGroups[boundary] || boundary;
  };

  if (loading) {
    return <div className="loading-spinner">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div className="stats-container">Aucune statistique à afficher.</div>;
  }

  // Préparation des données pour les graphiques
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Graphique linéaire - Consultations mensuelles
  const monthlyLineData = {
    labels: stats.last12MonthsConsultations.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`),
    datasets: [{
      label: 'Consultations par mois',
      data: stats.last12MonthsConsultations.map(item => item.count),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true,
      tension: 0.4,
    }]
  };

  // Graphique par jour (7 derniers jours)
  const dailyLineData = stats.last7DaysConsultations ? {
    labels: stats.last7DaysConsultations.map(item => 
      `${item._id.day}/${item._id.month}`
    ),
    datasets: [{
      label: 'Consultations par jour',
      data: stats.last7DaysConsultations.map(item => item.count),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true,
      tension: 0.4,
    }]
  } : null;

  // Graphique par semaine
  const weeklyLineData = stats.last52WeeksConsultations ? {
    labels: stats.last52WeeksConsultations.slice(-12).map((item, idx) => 
      `S${item._id.week}`
    ),
    datasets: [{
      label: 'Consultations par semaine',
      data: stats.last52WeeksConsultations.slice(-12).map(item => item.count),
      borderColor: 'rgb(153, 102, 255)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      fill: true,
      tension: 0.4,
    }]
  } : null;

  // Graphique par année
  const yearlyBarData = stats.consultationsByYear ? {
    labels: stats.consultationsByYear.map(item => item._id.year),
    datasets: [{
      label: 'Consultations par année',
      data: stats.consultationsByYear.map(item => item.count),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
    }]
  } : null;

  // Graphique genre
  const genderDoughnutData = {
    labels: Object.keys(stats.genderDistribution).map(translateGender),
    datasets: [{
      label: 'Distribution par genre',
      data: Object.values(stats.genderDistribution),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 2,
    }]
  };

  // Graphique tranches d'âge
  const agePieData = stats.ageDistribution ? {
    labels: stats.ageDistribution.map(item => translateAgeGroup(item._id)),
    datasets: [{
      label: 'Patients par tranche d\'âge',
      data: stats.ageDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ],
      borderWidth: 2,
    }]
  } : null;

  // Graphique statuts RDV
  const statusBarData = stats.appointmentStatusDistribution ? {
    labels: Object.keys(stats.appointmentStatusDistribution),
    datasets: [{
      label: 'Rendez-vous par statut',
      data: Object.values(stats.appointmentStatusDistribution),
      backgroundColor: [
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(201, 203, 207, 0.7)',
      ],
      borderWidth: 2,
    }]
  } : null;

  // Calculs statistiques
  const avgConsultationsPerMonth = stats.last12MonthsConsultations.length > 0 
    ? (stats.last12MonthsConsultations.reduce((sum, item) => sum + item.count, 0) / stats.last12MonthsConsultations.length).toFixed(1)
    : 0;

  const maxConsultationsMonth = stats.last12MonthsConsultations.length > 0
    ? Math.max(...stats.last12MonthsConsultations.map(item => item.count))
    : 0;

  // Tendance
  let trend = "stable";
  let trendPercentage = 0;
  if (stats.last12MonthsConsultations.length >= 6) {
    const recentHalf = stats.last12MonthsConsultations.slice(-6).reduce((sum, item) => sum + item.count, 0);
    const olderHalf = stats.last12MonthsConsultations.slice(0, 6).reduce((sum, item) => sum + item.count, 0);
    if (olderHalf > 0) {
      trendPercentage = (((recentHalf - olderHalf) / olderHalf) * 100).toFixed(1);
      if (recentHalf > olderHalf * 1.1) trend = "hausse";
      else if (recentHalf < olderHalf * 0.9) trend = "baisse";
    }
  }

  // Sélection du graphique selon la période
  const getChartData = () => {
    switch(selectedPeriod) {
      case 'day': return dailyLineData;
      case 'week': return weeklyLineData;
      case 'month': return monthlyLineData;
      case 'year': return yearlyBarData;
      default: return monthlyLineData;
    }
  };

  const chartData = getChartData();

  return (
    <div className="stats-container">
      <h1>Tableau de bord statistique</h1>
      
      {/* Navigation */}
      <div className="stats-nav">
        <button 
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => setSelectedView('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={selectedView === 'detailed' ? 'active' : ''}
          onClick={() => setSelectedView('detailed')}
        >
          Analyse détaillée
        </button>
        <button 
          className={selectedView === 'demographics' ? 'active' : ''}
          onClick={() => setSelectedView('demographics')}
        >
          Démographie
        </button>
      </div>

      {selectedView === 'overview' && (
        <>
          {/* Cartes principales */}
          <div className="stats-cards">
            <div className="stat-card primary">
              <h2>Patients au total</h2>
              <p className="stat-number">{stats.totalPatients}</p>
              <span className="stat-label">Dossiers enregistrés</span>
            </div>
            <div className="stat-card success">
              <h2>Aujourd'hui</h2>
              <p className="stat-number">{stats.consultationsToday}</p>
              <span className="stat-label">Consultations</span>
            </div>
            <div className="stat-card info">
              <h2>Cette semaine</h2>
              <p className="stat-number">{stats.consultationsThisWeek}</p>
              <span className="stat-label">Consultations</span>
            </div>
            <div className="stat-card warning">
              <h2>Ce mois-ci</h2>
              <p className="stat-number">{stats.consultationsThisMonth}</p>
              <span className="stat-label">Consultations</span>
            </div>
          </div>

          {/* Indicateur de tendance */}
          <div className={`trend-indicator ${trend}`}>
            <span className="trend-icon">
              {trend === 'hausse' && '📈'}
              {trend === 'baisse' && '📉'}
              {trend === 'stable' && '➡️'}
            </span>
            <span className="trend-text">
              {trend === 'hausse' && `Tendance en hausse de ${trendPercentage}% sur les 6 derniers mois`}
              {trend === 'baisse' && `Tendance en baisse de ${Math.abs(trendPercentage)}% sur les 6 derniers mois`}
              {trend === 'stable' && 'Activité stable'}
            </span>
          </div>

          {/* Sélecteur de période */}
          <div className="period-selector">
            <button 
              className={selectedPeriod === 'day' ? 'active' : ''}
              onClick={() => setSelectedPeriod('day')}
            >
              Par jour
            </button>
            <button 
              className={selectedPeriod === 'week' ? 'active' : ''}
              onClick={() => setSelectedPeriod('week')}
            >
              Par semaine
            </button>
            <button 
              className={selectedPeriod === 'month' ? 'active' : ''}
              onClick={() => setSelectedPeriod('month')}
            >
              Par mois
            </button>
            <button 
              className={selectedPeriod === 'year' ? 'active' : ''}
              onClick={() => setSelectedPeriod('year')}
            >
              Par année
            </button>
          </div>

          {/* Graphique principal */}
          <div className="charts-grid">
            <div className="chart-container full-width">
              <h3>Évolution des consultations</h3>
              {chartData && (
                selectedPeriod === 'year' ? 
                  <Bar data={chartData} options={{
                    responsive: true,
                    plugins: { legend: { display: true, position: 'bottom' } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                  }} /> :
                  <Line data={chartData} options={{
                    responsive: true,
                    plugins: { legend: { display: true, position: 'bottom' } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                  }} />
              )}
            </div>

            <div className="chart-container">
              <h3>Répartition par genre</h3>
              <Doughnut data={genderDoughnutData} options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
              }} />
            </div>

            {agePieData && (
              <div className="chart-container">
                <h3>Tranches d'âge</h3>
                <Pie data={agePieData} options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }} />
              </div>
            )}
          </div>
        </>
      )}

      {selectedView === 'detailed' && (
        <>
          <h2>Analyse détaillée</h2>
          
          <div className="stats-comparison">
            <div className="comparison-card">
              <h3>Patients récents</h3>
              <p className="comparison-value">{stats.recentPatientsCount}</p>
              <span className="comparison-label">Derniers 30 jours</span>
            </div>
            <div className="comparison-card">
              <h3>Moyenne/patient</h3>
              <p className="comparison-value">{stats.avgConsultationsPerPatient}</p>
              <span className="comparison-label">Consultations/an</span>
            </div>
            <div className="comparison-card">
              <h3>Cette année</h3>
              <p className="comparison-value">{stats.consultationsThisYear}</p>
              <span className="comparison-label">Total consultations</span>
            </div>
            <div className="comparison-card">
              <h3>Moyenne mensuelle</h3>
              <p className="comparison-value">{avgConsultationsPerMonth}</p>
              <span className="comparison-label">Sur 12 mois</span>
            </div>
          </div>

          {/* Statuts des RDV */}
          {statusBarData && (
            <div className="chart-container full-width">
              <h3>Statuts des rendez-vous</h3>
              <Bar data={statusBarData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
              }} />
            </div>
          )}

          {/* Tableau mensuel */}
          <div className="monthly-table">
            <h3>Détail mensuel des consultations</h3>
            <table>
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Consultations</th>
                  <th>Évolution</th>
                  <th>% du total annuel</th>
                </tr>
              </thead>
              <tbody>
                {stats.last12MonthsConsultations.map((item, index) => {
                  const totalAnnual = stats.last12MonthsConsultations.reduce((sum, i) => sum + i.count, 0);
                  const prevCount = index > 0 ? stats.last12MonthsConsultations[index - 1].count : item.count;
                  const evolution = prevCount > 0 ? (((item.count - prevCount) / prevCount) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={index}>
                      <td>{monthNames[item._id.month - 1]} {item._id.year}</td>
                      <td className="table-number">{item.count}</td>
                      <td className={evolution > 0 ? 'positive' : evolution < 0 ? 'negative' : ''}>
                        {evolution > 0 ? `+${evolution}%` : `${evolution}%`}
                      </td>
                      <td>{((item.count / totalAnnual) * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedView === 'demographics' && (
        <>
          <h2>Analyse démographique</h2>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Répartition par genre</h3>
              <Doughnut data={genderDoughnutData} />
              <div className="gender-cards">
                {Object.entries(stats.genderDistribution).map(([gender, count]) => (
                  <div key={gender} className="gender-card">
                    <div className="gender-label">{translateGender(gender)}</div>
                    <div className="gender-count">{count}</div>
                    <div className="gender-percentage">
                      {((count / stats.totalPatients) * 100).toFixed(1)}%
                    </div>
                    <div className="gender-bar">
                      <div 
                        className="gender-bar-fill" 
                        style={{ width: `${(count / stats.totalPatients) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {agePieData && (
              <div className="chart-container">
                <h3>Tranches d'âge des patients</h3>
                <Pie data={agePieData} />
                <div className="age-details">
                  {stats.ageDistribution.map((item, idx) => (
                    <div key={idx} className="age-item">
                      <span className="age-label">{translateAgeGroup(item._id)}</span>
                      <span className="age-count">{item.count} patients</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Statistiques;