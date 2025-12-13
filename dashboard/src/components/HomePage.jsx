// Fichier: src/components/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../App.css";

const HomePage = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    clinics: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/stats`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-container">
      {/* En-tête */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/medocliclog.png" alt="Medoclic Logo" className="logo" />
          </div>
          <nav className="nav-links">
            <Link to="/login" className="login-btn">Connexion</Link>
            <Link to="/signup" className="signup-btn">Inscription</Link>
          </nav>
        </div>
      </header>

      {/* Section Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Medoclic</h2>
          <p>
            Rejoignez la nouvelle génération de professionnels de santé avec Medoclic, notre solution médicale innovante pensée pour vous.
            Optimisez votre pratique, gagnez du temps, et améliorez la qualité de vos soins grâce à des outils intelligents, simples et performants.
            Des centaines de médecins font déjà confiance à Medoclic pour moderniser leur quotidien et se concentrer sur l’essentiel : leurs patients.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-primary">Commencer gratuitement</Link>
            <a href="#features" className="cta-secondary">Découvrir les fonctionnalités</a>
          </div>
        </div>
        <div className="hero-image-container">
          <img 
            src="/doc.png" 
            alt="Interface Medoclic" 
            className="dashboard-image"
          />
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="features" className="features-section">
        <h2>Nos Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Dossiers Patients</h3>
            <p>Gestion centralisée et sécurisée des dossiers médicaux</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Gestion de Rendez-vous</h3>
            <p>Calendrier intelligent avec rappels automatiques</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Prescriptions Numériques</h3>
            <p>Création et gestion des ordonnances en quelques clics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Statistiques Avancées</h3>
            <p>Tableaux de bord pour le suivi de votre activité</p>
          </div>
        </div>
      </section>

      {/* Section À Propos */}
      <section className="about-section">
        <div className="about-content">
          <h2>À Propos de Medoclic</h2>
          <p>
            Fondée en 2025, Medoclic est une plateforme algérienne spécialisée dans la digitalisation 
            des cliniques médicales. Notre mission est de simplifier la gestion administrative des 
            professionnels de santé pour leur permettre de se concentrer sur l'essentiel : leurs patients.
          </p>
          <p>
            Conçue par des médecins pour des médecins, notre solution intègre toutes les spécificités 
            du système de santé algérien et respecte les normes de confidentialité les plus strictes.
          </p>
        </div>
        <div className="about-video">
  <iframe
    className="about-video-player"
    width="100%"
    height="315"
    src="https://www.youtube.com/embed/lY51lwOwu5I"
    title="Vidéo de présentation"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  ></iframe>
</div>

      </section>

      {/* Footer avec informations de contact */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/medocliclog.png" alt="Medoclic Logo" />
            <p>Votre partenaire santé numérique</p>
          </div>
          
          <div className="footer-links">
            <h4>Liens Rapides</h4>
            <a href="/home">Accueil</a>
            <a href="#features">Fonctionnalités</a>
            <a href="/signup">Inscription</a>
            <a href="/login">Connexion</a>
          </div>
          
          <div className="footer-legal">
            <h4>Légal</h4>
            <a href="#">Conditions d'utilisation</a>
            <a href="#">Politique de confidentialité</a>
            <a href="#">Mentions légales</a>
          </div>
          
          <div className="footer-contact">
            <h4>Contact</h4>
            <div className="contact-item">
              <span>📧 Email:</span>
              <a href="mailto:contact@medoclic.dz">contact@medoclic.dz</a>
            </div>
            <div className="contact-item">
              <span>📞 Téléphone:</span>
              <a href="tel:+21312345678">+213 123 45 678</a>
            </div>
            <div className="social-links">
              <a href="#" className="social-icon">f</a>
              <a href="#" className="social-icon">in</a>
              <a href="#" className="social-icon">ig</a>
            </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 Medoclic. Tous droits réservés.</p>
      </div>
      </footer>
    </div>
  );
};

export default HomePage;