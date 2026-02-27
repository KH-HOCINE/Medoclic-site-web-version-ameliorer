import React, { useState } from "react";
import '../App.css';

const scoresBySpecialty = {
  "Cardiologie": [
    { id: "cha2ds2vasc", name: "CHA2DS2-VASc (Score)", description: "Risque embolique sur ACFA (Fibrillation Atriale)" },
    { id: "wells-dvt", name: "Wells, Phlébite (Score)", description: "Probabilité de thrombose veineuse profonde (TVP)" },
    { id: "grace", name: "GRACE (Score)", description: "Risque de mortalité dans le syndrome coronarien aigu" },
    { id: "hasbled", name: "HAS-BLED (Score)", description: "Risque hémorragique sous anticoagulants" },
    { id: "nyha", name: "NYHA (Classification)", description: "Classification de l'insuffisance cardiaque" },
  ],
  "Gériatrie": [
    { id: "4peps", name: "4PEPS (Score)", description: "Dépistage de la fragilité chez la personne âgée" },
    { id: "mmse", name: "MMSE (Score)", description: "Mini-Mental State Examination - Évaluation cognitive" },
    { id: "iadl", name: "IADL (Score)", description: "Activités instrumentales de la vie quotidienne" },
    { id: "adl", name: "ADL (Score)", description: "Activités de base de la vie quotidienne (Katz)" },
  ],
  "Hépato-Gastroentérologie": [
    { id: "child-pugh", name: "Child-Pugh (Score)", description: "Stades de sévérité d'une cirrhose hépatique" },
    { id: "meld", name: "MELD (Score)", description: "Sévérité de la maladie hépatique terminale" },
    { id: "rockall", name: "Rockall (Score)", description: "Risque de mortalité dans l'hémorragie digestive haute" },
  ],
  "Neurologie": [
    { id: "glasgow", name: "Glasgow (Score)", description: "Evaluation de l'état de conscience" },
    { id: "nihss", name: "NIHSS (Score)", description: "Évaluation de la sévérité d'un AVC" },
    { id: "rankin", name: "Rankin modifié (Score)", description: "Degré d'incapacité après un AVC" },
  ],
  "Nutrition": [
    { id: "imc", name: "Indice de Masse Corporelle (IMC)", description: "Évaluation du statut pondéral (surpoids, obésité)" },
    { id: "mna", name: "MNA (Score)", description: "Mini Nutritional Assessment - Dépistage de la dénutrition" },
  ],
  "Pneumologie": [
    { id: "curb65", name: "CURB-65 (Score)", description: "Sévérité d'une pneumonie communautaire" },
    { id: "wells-ep", name: "Wells, Embolie Pulmonaire (Score)", description: "Probabilité d'embolie pulmonaire" },
    { id: "gold", name: "GOLD (Classification)", description: "Stades de sévérité de la BPCO" },
  ],
  "Réanimation": [
    { id: "qsofa", name: "qSOFA (Score)", description: "Gravité sepsis simplifiée (Quick SOFA)" },
    { id: "sofa", name: "SOFA (Score)", description: "Évaluation des défaillances d'organes" },
    { id: "saps2", name: "SAPS II (Score)", description: "Simplified Acute Physiology Score" },
    { id: "apache2", name: "APACHE II (Score)", description: "Acute Physiology and Chronic Health Evaluation" },
  ],
  "Néphrologie": [
    { id: "mdrd", name: "MDRD (Formule)", description: "Estimation du débit de filtration glomérulaire" },
    { id: "ckd-epi", name: "CKD-EPI (Formule)", description: "Estimation du DFG (plus précise que MDRD)" },
    { id: "cockroft", name: "Cockcroft-Gault (Formule)", description: "Clairance de la créatinine" },
  ],
  "Obstétrique": [
    { id: "apgar", name: "Score d'Apgar", description: "Vitalité du nouveau-né à la naissance" },
    { id: "bishop", name: "Bishop (Score)", description: "Maturation cervicale avant déclenchement" },
  ],
  "Psychiatrie": [
    { id: "phq9", name: "PHQ-9 (Score)", description: "Dépistage et évaluation de la dépression" },
    { id: "gad7", name: "GAD-7 (Score)", description: "Dépistage du trouble anxieux généralisé" },
  ],
  "Rhumatologie": [
    { id: "das28", name: "DAS28 (Score)", description: "Activité de la polyarthrite rhumatoïde" },
    { id: "frax", name: "FRAX (Score)", description: "Risque de fracture ostéoporotique" },
  ],
  "Urologie": [
    { id: "ipss", name: "IPSS (Score)", description: "Symptômes prostatiques (International Prostate Symptom Score)" },
  ],
};

const ModalScores = ({ onInsertScore, onClose }) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScore, setSelectedScore] = useState(null);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const allScores = Object.keys(scoresBySpecialty).reduce((acc, specialty) => {
    return [...acc, ...scoresBySpecialty[specialty].map(score => ({ ...score, specialty }))];
  }, []);

  const filteredScores = allScores.filter(score => {
    const matchesSpecialty = selectedSpecialty === "Tous" || score.specialty === selectedSpecialty;
    const matchesSearch = score.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          score.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue;

    if (type === 'checkbox') {
        finalValue = checked;
    } else if (type === 'radio') {
        finalValue = value;
    } else {
        finalValue = value === '' ? '' : parseFloat(value);
    }
    setInputs(prev => ({ ...prev, [name]: finalValue }));
  };

  const calculateScore = () => {
    let calculatedResult = '';
    const scoreId = selectedScore.id;

    switch (scoreId) {
      case "imc": {
        const { poids, taille } = inputs;
        if (!poids || !taille) return;
        const tailleEnMetres = taille / 100;
        const imc = poids / (tailleEnMetres * tailleEnMetres);
        let interpretation = "";
        if (imc < 18.5) interpretation = "Maigreur";
        else if (imc < 25) interpretation = "Poids normal";
        else if (imc < 30) interpretation = "Surpoids";
        else interpretation = "Obésité";
        calculatedResult = `IMC = ${imc.toFixed(2)} (${interpretation})`;
        break;
      }
      
      case "glasgow": {
        const score = (inputs.yeux || 0) + (inputs.verbal || 0) + (inputs.moteur || 0);
        let interpretation = "";
        if (score <= 8) interpretation = "Coma sévère";
        else if (score <= 12) interpretation = "Coma modéré";
        else if (score < 15) interpretation = "Coma léger";
        else interpretation = "Normal";
        calculatedResult = `Score de Glasgow : ${score}/15 (${interpretation})`;
        break;
      }
      
      case "4peps": {
        let score = 0;
        if (inputs.fatigue === "souvent" || inputs.fatigue === "toujours") score += 1;
        if (inputs.poids === "oui") score += 1;
        if (inputs.marche === "oui") score += 1;
        if (inputs.chutes === "oui") score += 1;
        let interpretation = "";
        if (score === 0) interpretation = "Pas de fragilité détectée";
        else if (score === 1) interpretation = "Fragilité légère";
        else if (score === 2) interpretation = "Fragilité modérée";
        else interpretation = "Fragilité élevée";
        calculatedResult = `Score 4PEPS : ${score}/4 (${interpretation})`;
        break;
      }
      
      case "cha2ds2vasc": {
        let score = 0;
        if (inputs.c) score += 1;
        if (inputs.h) score += 1;
        if (inputs.a2) score += 2;
        if (inputs.d) score += 1;
        if (inputs.s2) score += 2;
        if (inputs.v) score += 1;
        if (inputs.a1) score += 1;
        if (inputs.sc) score += 1;
        let interpretation = "Risque faible";
        if (score === 1) interpretation = "Risque modéré (anticoagulation à considérer)";
        if (score >= 2) interpretation = "Risque élevé (anticoagulation recommandée)";
        calculatedResult = `Score CHA2DS2-VASc : ${score} (${interpretation})`;
        break;
      }
      
      case "wells-dvt": {
        let score = 0;
        if (inputs.cancer) score += 1;
        if (inputs.paralysie) score += 1;
        if (inputs.alitement) score += 1;
        if (inputs.douleur) score += 1;
        if (inputs.gonflementJambe) score += 1;
        if (inputs.gonflementMollet) score += 1;
        if (inputs.oedeme) score += 1;
        if (inputs.veines) score += 1;
        if (inputs.autreDiag) score -= 2;
        let interpretation = "";
        if (score <= 0) interpretation = "Probabilité faible";
        else if (score <= 2) interpretation = "Probabilité modérée";
        else interpretation = "Probabilité élevée";
        calculatedResult = `Score de Wells (TVP) : ${score} (${interpretation})`;
        break;
      }
      
      case "child-pugh": {
        let score = 0;
        const { bilirubine, albumine, inr, ascite, encephalopathie } = inputs;
        if (!bilirubine || !albumine || !inr || !ascite || !encephalopathie) return;
        if (bilirubine > 3) score += 3; else if (bilirubine >= 2) score += 2; else score += 1;
        if (albumine < 2.8) score += 3; else if (albumine <= 3.5) score += 2; else score += 1;
        if (inr > 2.3) score += 3; else if (inr >= 1.7) score += 2; else score += 1;
        score += (ascite || 0) + (encephalopathie || 0);
        let interpretation = "";
        if (score <= 6) interpretation = "Classe A (Bien compensée)";
        else if (score <= 9) interpretation = "Classe B (Compromis fonctionnel)";
        else interpretation = "Classe C (Décompensée)";
        calculatedResult = `Score de Child-Pugh : ${score} points (${interpretation})`;
        break;
      }
      
      case "qsofa": {
        let score = 0;
        if (inputs.fr && inputs.fr >= 22) score += 1;
        if (inputs.conscience === "oui") score += 1;
        if (inputs.pas && inputs.pas <= 100) score += 1;
        let interpretation = "Risque faible d'évolution défavorable.";
        if (score >= 2) interpretation = "Risque élevé. Suspecter une dysfonction d'organe.";
        calculatedResult = `Score qSOFA : ${score}/3 (${interpretation})`;
        break;
      }
      
      case "grace": {
        const { age, fc, pas, creat, killip, arret, stElevation, troponine } = inputs;
        if (!age || !fc || !pas || !creat || !killip) return;
        let score = 0;
        // Âge
        if (age < 40) score += 0;
        else if (age < 50) score += 18;
        else if (age < 60) score += 36;
        else if (age < 70) score += 55;
        else if (age < 80) score += 73;
        else score += 91;
        // FC
        if (fc < 70) score += 0;
        else if (fc < 90) score += 7;
        else if (fc < 110) score += 13;
        else if (fc < 150) score += 23;
        else score += 36;
        // PAS
        if (pas < 80) score += 63;
        else if (pas < 100) score += 58;
        else if (pas < 120) score += 47;
        else if (pas < 140) score += 37;
        else if (pas < 160) score += 26;
        else if (pas < 200) score += 11;
        else score += 0;
        // Créatinine (approximation)
        if (creat < 0.4) score += 2;
        else if (creat < 0.8) score += 5;
        else if (creat < 1.2) score += 8;
        else if (creat < 1.6) score += 11;
        else if (creat < 2.0) score += 14;
        else if (creat < 4.0) score += 23;
        else score += 31;
        // Killip
        score += (killip - 1) * 20;
        if (arret === "oui") score += 43;
        if (stElevation === "oui") score += 28;
        if (troponine === "oui") score += 15;
        
        let interpretation = "";
        if (score <= 108) interpretation = "Risque faible (<1% mortalité)";
        else if (score <= 140) interpretation = "Risque intermédiaire (1-3%)";
        else interpretation = "Risque élevé (>3%)";
        calculatedResult = `Score GRACE : ${score} (${interpretation})`;
        break;
      }
      
      case "hasbled": {
        let score = 0;
        if (inputs.h) score += 1;
        if (inputs.a) score += 1;
        if (inputs.s) score += 1;
        if (inputs.b) score += 1;
        if (inputs.l) score += 1;
        if (inputs.e) score += 1;
        if (inputs.d) score += 1;
        let interpretation = "";
        if (score <= 2) interpretation = "Risque hémorragique faible";
        else interpretation = "Risque hémorragique élevé (prudence avec anticoagulants)";
        calculatedResult = `Score HAS-BLED : ${score} (${interpretation})`;
        break;
      }
      
      case "nyha": {
        const classe = parseInt(inputs.classe);
        let interpretation = "";
        if (classe === 1) interpretation = "Classe I : Pas de limitation. Activité physique normale sans fatigue.";
        else if (classe === 2) interpretation = "Classe II : Limitation légère. Asymptomatique au repos.";
        else if (classe === 3) interpretation = "Classe III : Limitation marquée. Confortable au repos uniquement.";
        else interpretation = "Classe IV : Incapable d'activité sans gêne. Symptômes au repos.";
        calculatedResult = interpretation;
        break;
      }
      
      case "mmse": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score >= 24) interpretation = "Normal";
        else if (score >= 18) interpretation = "Troubles cognitifs légers";
        else if (score >= 10) interpretation = "Troubles cognitifs modérés";
        else interpretation = "Troubles cognitifs sévères";
        calculatedResult = `MMSE : ${score}/30 (${interpretation})`;
        break;
      }
      
      case "iadl": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score === 8) interpretation = "Autonomie complète";
        else if (score >= 4) interpretation = "Autonomie partielle";
        else interpretation = "Dépendance importante";
        calculatedResult = `Score IADL : ${score}/8 (${interpretation})`;
        break;
      }
      
      case "adl": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score === 6) interpretation = "Indépendance totale";
        else if (score >= 4) interpretation = "Dépendance légère";
        else if (score >= 2) interpretation = "Dépendance modérée";
        else interpretation = "Dépendance sévère";
        calculatedResult = `Score ADL (Katz) : ${score}/6 (${interpretation})`;
        break;
      }
      
      case "meld": {
        const { bilirubine, inr, creat, dialyse } = inputs;
        if (!bilirubine || !inr || !creat) return;
        const bili = Math.max(1, bilirubine);
        const inrVal = Math.max(1, inr);
        const creatVal = dialyse === "oui" ? 4 : Math.max(1, creat);
        const score = Math.round(9.57 * Math.log(creatVal) + 3.78 * Math.log(bili) + 11.2 * Math.log(inrVal) + 6.43);
        let interpretation = "";
        if (score < 10) interpretation = "Maladie hépatique compensée";
        else if (score < 20) interpretation = "Maladie modérée";
        else if (score < 30) interpretation = "Maladie sévère";
        else interpretation = "Maladie très sévère (transplantation urgente)";
        calculatedResult = `Score MELD : ${score} (${interpretation})`;
        break;
      }
      
      case "rockall": {
        let score = 0;
        const { age, choc, comorbidites, diagnostic, saignement } = inputs;
        if (age < 60) score += 0;
        else if (age < 80) score += 1;
        else score += 2;
        score += parseInt(choc || 0);
        score += parseInt(comorbidites || 0);
        score += parseInt(diagnostic || 0);
        score += parseInt(saignement || 0);
        let interpretation = "";
        if (score <= 2) interpretation = "Risque faible (<5% mortalité)";
        else if (score <= 4) interpretation = "Risque intermédiaire";
        else interpretation = "Risque élevé (>10% mortalité)";
        calculatedResult = `Score de Rockall : ${score} (${interpretation})`;
        break;
      }
      
      case "nihss": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score === 0) interpretation = "Pas de déficit";
        else if (score <= 4) interpretation = "AVC mineur";
        else if (score <= 15) interpretation = "AVC modéré";
        else if (score <= 20) interpretation = "AVC modéré à sévère";
        else interpretation = "AVC sévère";
        calculatedResult = `Score NIHSS : ${score} (${interpretation})`;
        break;
      }
      
      case "rankin": {
        const score = parseInt(inputs.score);
        let interpretation = "";
        if (score === 0) interpretation = "Aucun symptôme";
        else if (score === 1) interpretation = "Pas d'incapacité significative";
        else if (score === 2) interpretation = "Incapacité légère";
        else if (score === 3) interpretation = "Incapacité modérée (aide nécessaire)";
        else if (score === 4) interpretation = "Incapacité modérée à sévère";
        else if (score === 5) interpretation = "Incapacité sévère (alité)";
        else interpretation = "Décès";
        calculatedResult = `Score de Rankin modifié : ${score} (${interpretation})`;
        break;
      }
      
      case "mna": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score >= 24) interpretation = "État nutritionnel normal";
        else if (score >= 17) interpretation = "Risque de dénutrition";
        else interpretation = "Dénutrition";
        calculatedResult = `MNA : ${score}/30 (${interpretation})`;
        break;
      }
      
      case "curb65": {
        let score = 0;
        if (inputs.c) score += 1;
        if (inputs.u) score += 1;
        if (inputs.r) score += 1;
        if (inputs.b) score += 1;
        if (inputs.age65) score += 1;
        let interpretation = "";
        if (score <= 1) interpretation = "Faible risque (traitement ambulatoire possible)";
        else if (score === 2) interpretation = "Risque modéré (hospitalisation recommandée)";
        else interpretation = "Risque élevé (hospitalisation urgente, réanimation si nécessaire)";
        calculatedResult = `Score CURB-65 : ${score} (${interpretation})`;
        break;
      }
      
      case "wells-ep": {
        let score = 0;
        if (inputs.tvp) score += 3;
        if (inputs.autreDiag) score += 3;
        if (inputs.fc) score += 1.5;
        if (inputs.immobilisation) score += 1.5;
        if (inputs.antecedent) score += 1.5;
        if (inputs.hemoptysie) score += 1;
        if (inputs.cancer) score += 1;
        let interpretation = "";
        if (score < 2) interpretation = "Probabilité faible";
        else if (score <= 6) interpretation = "Probabilité modérée";
        else interpretation = "Probabilité élevée";
        calculatedResult = `Score de Wells (EP) : ${score.toFixed(1)} (${interpretation})`;
        break;
      }
      
      case "gold": {
        const { vems } = inputs;
        if (!vems) return;
        let interpretation = "";
        if (vems >= 80) interpretation = "GOLD 1 : BPCO légère";
        else if (vems >= 50) interpretation = "GOLD 2 : BPCO modérée";
        else if (vems >= 30) interpretation = "GOLD 3 : BPCO sévère";
        else interpretation = "GOLD 4 : BPCO très sévère";
        calculatedResult = `VEMS : ${vems}% (${interpretation})`;
        break;
      }
      
      case "sofa": {
        let score = 0;
        score += parseInt(inputs.respiration || 0);
        score += parseInt(inputs.coagulation || 0);
        score += parseInt(inputs.foie || 0);
        score += parseInt(inputs.cardio || 0);
        score += parseInt(inputs.snc || 0);
        score += parseInt(inputs.renal || 0);
        let interpretation = "";
        if (score < 2) interpretation = "Pas de dysfonction";
        else if (score <= 6) interpretation = "Dysfonction légère";
        else if (score <= 11) interpretation = "Dysfonction modérée";
        else interpretation = "Dysfonction sévère (mortalité >50%)";
        calculatedResult = `Score SOFA : ${score} (${interpretation})`;
        break;
      }
      
      case "saps2": {
        const score = inputs.score || 0;
        const mortalite = Math.exp(-7.7631 + 0.0737 * score + 0.9971 * Math.log(score + 1)) / (1 + Math.exp(-7.7631 + 0.0737 * score + 0.9971 * Math.log(score + 1)));
        calculatedResult = `Score SAPS II : ${score} (Mortalité estimée : ${(mortalite * 100).toFixed(1)}%)`;
        break;
      }
      
      case "apache2": {
        const score = inputs.score || 0;
        let mortalite = 0;
        if (score < 10) mortalite = 4;
        else if (score < 15) mortalite = 8;
        else if (score < 20) mortalite = 15;
        else if (score < 25) mortalite = 25;
        else if (score < 30) mortalite = 40;
        else if (score < 35) mortalite = 55;
        else mortalite = 85;
        calculatedResult = `Score APACHE II : ${score} (Mortalité estimée : ~${mortalite}%)`;
        break;
      }
      
      case "mdrd": {
        const { creat, age, sexe, ethnie } = inputs;
        if (!creat || !age || !sexe) return;
        let dfg = 175 * Math.pow(creat, -1.154) * Math.pow(age, -0.203);
        if (sexe === "femme") dfg *= 0.742;
        if (ethnie === "afro") dfg *= 1.212;
        let interpretation = "";
        if (dfg >= 90) interpretation = "Fonction rénale normale";
        else if (dfg >= 60) interpretation = "IRC stade 2 (légère)";
        else if (dfg >= 30) interpretation = "IRC stade 3 (modérée)";
        else if (dfg >= 15) interpretation = "IRC stade 4 (sévère)";
        else interpretation = "IRC stade 5 (terminale)";
        calculatedResult = `DFG (MDRD) : ${dfg.toFixed(1)} mL/min/1.73m² (${interpretation})`;
        break;
      }
      
      case "ckd-epi": {
        const { creat, age, sexe, ethnie } = inputs;
        if (!creat || !age || !sexe) return;
        const kappa = sexe === "homme" ? 0.9 : 0.7;
        const alpha = sexe === "homme" ? -0.411 : -0.329;
        const min = Math.min(creat / kappa, 1);
        const max = Math.max(creat / kappa, 1);
        let dfg = 141 * Math.pow(min, alpha) * Math.pow(max, -1.209) * Math.pow(0.993, age);
        if (sexe === "femme") dfg *= 1.018;
        if (ethnie === "afro") dfg *= 1.159;
        let interpretation = "";
        if (dfg >= 90) interpretation = "Fonction rénale normale";
        else if (dfg >= 60) interpretation = "IRC stade 2 (légère)";
        else if (dfg >= 30) interpretation = "IRC stade 3 (modérée)";
        else if (dfg >= 15) interpretation = "IRC stade 4 (sévère)";
        else interpretation = "IRC stade 5 (terminale)";
        calculatedResult = `DFG (CKD-EPI) : ${dfg.toFixed(1)} mL/min/1.73m² (${interpretation})`;
        break;
      }
      
      case "cockroft": {
        const { creat, age, poids, sexe } = inputs;
        if (!creat || !age || !poids || !sexe) return;
        let clcr = ((140 - age) * poids) / (creat * 72);
        if (sexe === "femme") clcr *= 0.85;
        calculatedResult = `Clairance de la créatinine : ${clcr.toFixed(1)} mL/min`;
        break;
      }
      
      case "apgar": {
        let score = 0;
        score += parseInt(inputs.fc || 0);
        score += parseInt(inputs.respiration || 0);
        score += parseInt(inputs.tonus || 0);
        score += parseInt(inputs.reactivite || 0);
        score += parseInt(inputs.coloration || 0);
        let interpretation = "";
        if (score >= 7) interpretation = "Bon état";
        else if (score >= 4) interpretation = "État moyen (réanimation légère)";
        else interpretation = "État critique (réanimation urgente)";
        calculatedResult = `Score d'Apgar : ${score}/10 (${interpretation})`;
        break;
      }
      
      case "bishop": {
        let score = 0;
        score += parseInt(inputs.col || 0);
        score += parseInt(inputs.effacement || 0);
        score += parseInt(inputs.consistance || 0);
        score += parseInt(inputs.position || 0);
        score += parseInt(inputs.hauteur || 0);
        let interpretation = "";
        if (score >= 9) interpretation = "Col favorable (déclenchement possible)";
        else if (score >= 5) interpretation = "Col intermédiaire (maturation à considérer)";
        else interpretation = "Col défavorable (maturation recommandée)";
        calculatedResult = `Score de Bishop : ${score}/13 (${interpretation})`;
        break;
      }
      
      case "phq9": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score < 5) interpretation = "Symptômes dépressifs minimes";
        else if (score < 10) interpretation = "Dépression légère";
        else if (score < 15) interpretation = "Dépression modérée";
        else if (score < 20) interpretation = "Dépression modérément sévère";
        else interpretation = "Dépression sévère";
        calculatedResult = `PHQ-9 : ${score}/27 (${interpretation})`;
        break;
      }
      
      case "gad7": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score < 5) interpretation = "Anxiété minimale";
        else if (score < 10) interpretation = "Anxiété légère";
        else if (score < 15) interpretation = "Anxiété modérée";
        else interpretation = "Anxiété sévère";
        calculatedResult = `GAD-7 : ${score}/21 (${interpretation})`;
        break;
      }
      
      case "das28": {
        const { nad, nag, evg, vs } = inputs;
        if (!nad || !nag || !evg || !vs) return;
        const score = 0.56 * Math.sqrt(nad) + 0.28 * Math.sqrt(nag) + 0.70 * Math.log(vs) + 0.014 * evg;
        let interpretation = "";
        if (score < 2.6) interpretation = "Rémission";
        else if (score < 3.2) interpretation = "Activité faible";
        else if (score < 5.1) interpretation = "Activité modérée";
        else interpretation = "Activité élevée";
        calculatedResult = `DAS28 : ${score.toFixed(2)} (${interpretation})`;
        break;
      }
      
      case "frax": {
        const score = inputs.risque || 0;
        let interpretation = "";
        if (score < 10) interpretation = "Risque faible";
        else if (score < 20) interpretation = "Risque modéré (traitement à discuter)";
        else interpretation = "Risque élevé (traitement recommandé)";
        calculatedResult = `Risque de fracture à 10 ans : ${score}% (${interpretation})`;
        break;
      }
      
      case "ipss": {
        const score = inputs.score || 0;
        let interpretation = "";
        if (score <= 7) interpretation = "Symptômes légers";
        else if (score <= 19) interpretation = "Symptômes modérés";
        else interpretation = "Symptômes sévères";
        calculatedResult = `IPSS : ${score}/35 (${interpretation})`;
        break;
      }
      
      default:
        calculatedResult = "Score non implémenté dans la version modale";
    }
    
    setResult(calculatedResult);
  };

  const handleInsert = () => {
    if (result && onInsertScore) {
      onInsertScore(result);
      onClose();
    }
  };

  const renderCheckbox = (name, label) => (
    <div className="checkbox-group">
      <label>
        <input type="checkbox" name={name} checked={!!inputs[name]} onChange={handleChange} />
        {label}
      </label>
    </div>
  );
  
  const renderRadioGroup = (groupName, options) => (
    <div className="input-group">
        <div className="radio-group">
            {options.map(opt => (
                <label key={opt.value}>
                    <input type="radio" name={groupName} value={opt.value} checked={inputs[groupName] === opt.value} onChange={handleChange} required /> {opt.label}
                </label>
            ))}
        </div>
    </div>
  );

  const renderSelect = (name, options) => (
    <select name={name} value={inputs[name] || ''} onChange={handleChange} required className="form-input">
        <option value="" disabled>Sélectionner...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );

  const renderNumberInput = (name, placeholder, step = "any") => (
    <input type="number" name={name} value={inputs[name] || ''} onChange={handleChange} required placeholder={placeholder} step={step} className="form-input"/>
  );

  const getScoreForm = () => {
    if (!selectedScore) return null;
    
    const scoreId = selectedScore.id;
    
    switch (scoreId) {
        case "imc":
            return (
                <>
                    <h3 className="form-section-title">Paramètres</h3>
                    <div className="input-group">
                        <label className="input-label">Poids (kg):</label>
                        {renderNumberInput("poids", "Ex: 70")}
                        <div className="input-hint">Entrez votre poids en kilogrammes</div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Taille (cm):</label>
                        {renderNumberInput("taille", "Ex: 175", "1")}
                        <div className="input-hint">Entrez votre taille en centimètres (ex: 175 pour 1,75m)</div>
                    </div>
                </>
            );
            
        case "glasgow":
            return (
                <>
                    <h3 className="form-section-title">Évaluation de la conscience</h3>
                    <div className="input-group"><label className="input-label">Ouverture des yeux :</label>{renderSelect("yeux", [{value:4, label:"4 - Spontanée"}, {value:3, label:"3 - À la voix"}, {value:2, label:"2 - À la douleur"}, {value:1, label:"1 - Aucune"}])}</div>
                    <div className="input-group"><label className="input-label">Réponse verbale :</label>{renderSelect("verbal", [{value:5, label:"5 - Orientée"}, {value:4, label:"4 - Confuse"}, {value:3, label:"3 - Mots inappropriés"}, {value:2, label:"2 - Sons incompréhensibles"}, {value:1, label:"1 - Aucune"}])}</div>
                    <div className="input-group"><label className="input-label">Réponse motrice :</label>{renderSelect("moteur", [{value:6, label:"6 - Obéit aux ordres"}, {value:5, label:"5 - Orientée"}, {value:4, label:"4 - Évitement"}, {value:3, label:"3 - Flexion anormale"}, {value:2, label:"2 - Extension anormale"}, {value:1, label:"1 - Aucune"}])}</div>
                </>
            );
            
        case "4peps":
            return (
                <>
                    <h3 className="form-section-title">Questionnaire de fragilité</h3>
                    <div className="input-group"><label className="input-label">1. Sensation de fatigue constante (4 dernières semaines) ?</label>{renderRadioGroup("fatigue", [{value:"jamais", label:"Jamais"}, {value:"parfois", label:"Parfois"}, {value:"souvent", label:"Souvent"}, {value:"toujours", label:"Toujours"}])}</div>
                    <div className="input-group"><label className="input-label">2. Perte de poids &gt; 3 kg (3 derniers mois) ?</label>{renderRadioGroup("poids", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                    <div className="input-group"><label className="input-label">3. Problèmes pour marcher ?</label>{renderRadioGroup("marche", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                    <div className="input-group"><label className="input-label">4. Chutes (6 derniers mois) ?</label>{renderRadioGroup("chutes", [{value:"non", label:"Non"}, {value:"oui",label:"Oui"}])}</div>
                </>
            );
            
        case "cha2ds2vasc":
            return (
                <>
                    <h3 className="form-section-title">Critères (1 point chacun, sauf si spécifié)</h3>
                    {renderCheckbox("c", "Insuffisance Cardiaque Congestive")}
                    {renderCheckbox("h", "Hypertension artérielle")}
                    {renderCheckbox("a2", "Âge ≥ 75 ans (+2 points)")}
                    {renderCheckbox("d", "Diabète")}
                    {renderCheckbox("s2", "AVC / AIT / Thromboembolie antérieur (+2 points)")}
                    {renderCheckbox("v", "Maladie vasculaire (IDM, AOMI, plaque aortique)")}
                    {renderCheckbox("a1", "Âge entre 65 et 74 ans")}
                    {renderCheckbox("sc", "Sexe féminin")}
                </>
            );
            
        case "wells-dvt":
            return (
                <>
                    <h3 className="form-section-title">Critères cliniques</h3>
                    {renderCheckbox("cancer", "Cancer actif")}
                    {renderCheckbox("paralysie", "Paralysie ou immobilisation plâtrée récente")}
                    {renderCheckbox("alitement", "Alitement > 3 jours ou chirurgie majeure < 12 sem.")}
                    {renderCheckbox("douleur", "Douleur localisée sur le trajet veineux profond")}
                    {renderCheckbox("gonflementJambe", "Gonflement de la jambe entière")}
                    {renderCheckbox("gonflementMollet", "Gonflement du mollet > 3 cm vs côté sain")}
                    {renderCheckbox("oedeme", "Œdème prenant le godet")}
                    {renderCheckbox("veines", "Veines superficielles collatérales (non variqueuses)")}
                    {renderCheckbox("autreDiag", "Un autre diagnostic est au moins aussi probable (-2 points)")}
                </>
            );
            
        case "child-pugh":
            return (
                <>
                    <h3 className="form-section-title">Paramètres cliniques et biologiques</h3>
                    <div className="input-group"><label className="input-label">Bilirubine totale (mg/dL):</label>{renderNumberInput("bilirubine", "Ex: 1.5", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Albumine sérique (g/dL):</label>{renderNumberInput("albumine", "Ex: 3.2", "0.1")}</div>
                    <div className="input-group"><label className="input-label">INR:</label>{renderNumberInput("inr", "Ex: 1.5", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Ascite:</label>{renderSelect("ascite", [{value:1, label:"Absente (1pt)"}, {value:2, label:"Minime (2pts)"}, {value:3, label:"Modérée à sévère (3pts)"}])}</div>
                    <div className="input-group"><label className="input-label">Encéphalopathie Hépatique:</label>{renderSelect("encephalopathie", [{value:1, label:"Aucune (1pt)"}, {value:2, label:"Grade I-II (2pts)"}, {value:3, label:"Grade III-IV (3pts)"}])}</div>
                </>
            );
            
        case "qsofa":
            return (
                <>
                    <h3 className="form-section-title">Critères (1 point par critère présent)</h3>
                    <div className="input-group"><label className="input-label">Fréquence respiratoire (/min):</label>{renderNumberInput("fr", "≥ 22")}</div>
                    <div className="input-group"><label className="input-label">Altération de la conscience ?</label>{renderRadioGroup("conscience", [{value:"oui", label:"Oui"}, {value:"non", label:"Non"}])}</div>
                    <div className="input-group"><label className="input-label">Pression artérielle systolique (mmHg):</label>{renderNumberInput("pas", "≤ 100")}</div>
                </>
            );
            
        case "grace":
            return (
                <>
                    <h3 className="form-section-title">Paramètres cliniques</h3>
                    <div className="input-group"><label className="input-label">Âge (années):</label>{renderNumberInput("age", "Ex: 65", "1")}</div>
                    <div className="input-group"><label className="input-label">Fréquence cardiaque (bpm):</label>{renderNumberInput("fc", "Ex: 80", "1")}</div>
                    <div className="input-group"><label className="input-label">Pression artérielle systolique (mmHg):</label>{renderNumberInput("pas", "Ex: 120", "1")}</div>
                    <div className="input-group"><label className="input-label">Créatinine (mg/dL):</label>{renderNumberInput("creat", "Ex: 1.0", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Classe de Killip:</label>{renderSelect("killip", [{value:1, label:"I - Pas de signe d'IC"}, {value:2, label:"II - Râles ou turgescence jugulaire"}, {value:3, label:"III - Œdème pulmonaire"}, {value:4, label:"IV - Choc cardiogénique"}])}</div>
                    <div className="input-group"><label className="input-label">Arrêt cardiaque à l'admission ?</label>{renderRadioGroup("arret", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                    <div className="input-group"><label className="input-label">Sus-décalage du segment ST ?</label>{renderRadioGroup("stElevation", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                    <div className="input-group"><label className="input-label">Troponine élevée ?</label>{renderRadioGroup("troponine", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                </>
            );
            
        case "hasbled":
            return (
                <>
                    <h3 className="form-section-title">Critères (1 point chacun)</h3>
                    {renderCheckbox("h", "Hypertension non contrôlée (PAS > 160 mmHg)")}
                    {renderCheckbox("a", "Anomalie fonction rénale/hépatique")}
                    {renderCheckbox("s", "AVC (antécédent)")}
                    {renderCheckbox("b", "Saignement (antécédent ou prédisposition)")}
                    {renderCheckbox("l", "INR labile (< 60% du temps dans zone thérapeutique)")}
                    {renderCheckbox("e", "Âge > 65 ans")}
                    {renderCheckbox("d", "Drogues/alcool (AINS, antiagrégants, alcool)")}
                </>
            );
            
        case "nyha":
            return (
                <>
                    <h3 className="form-section-title">Classification de l'insuffisance cardiaque</h3>
                    <div className="input-group">
                        <label className="input-label">Classe NYHA:</label>
                        {renderSelect("classe", [
                            {value:1, label:"Classe I - Pas de limitation"},
                            {value:2, label:"Classe II - Limitation légère"},
                            {value:3, label:"Classe III - Limitation marquée"},
                            {value:4, label:"Classe IV - Symptômes au repos"}
                        ])}
                    </div>
                </>
            );
            
        case "mmse":
            return (
                <>
                    <h3 className="form-section-title">Score total du MMSE</h3>
                    <div className="input-group">
                        <label className="input-label">Score MMSE (sur 30):</label>
                        {renderNumberInput("score", "0-30", "1")}
                        <div className="input-hint">Entrez le score total obtenu au test MMSE</div>
                    </div>
                </>
            );
            
        case "iadl":
            return (
                <>
                    <h3 className="form-section-title">Activités Instrumentales de la Vie Quotidienne</h3>
                    <div className="input-group">
                        <label className="input-label">Score IADL (sur 8):</label>
                        {renderNumberInput("score", "0-8", "1")}
                        <div className="input-hint">Nombre d'activités réalisées de façon autonome (téléphone, transport, médicaments, finances, etc.)</div>
                    </div>
                </>
            );
            
        case "adl":
            return (
                <>
                    <h3 className="form-section-title">Activités de Base de la Vie Quotidienne</h3>
                    <div className="input-group">
                        <label className="input-label">Score ADL (sur 6):</label>
                        {renderNumberInput("score", "0-6", "1")}
                        <div className="input-hint">Nombre d'activités réalisées sans aide (toilette, habillage, alimentation, continence, etc.)</div>
                    </div>
                </>
            );
            
        case "meld":
            return (
                <>
                    <h3 className="form-section-title">Paramètres biologiques</h3>
                    <div className="input-group"><label className="input-label">Bilirubine (mg/dL):</label>{renderNumberInput("bilirubine", "Ex: 1.5", "0.1")}</div>
                    <div className="input-group"><label className="input-label">INR:</label>{renderNumberInput("inr", "Ex: 1.2", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Créatinine (mg/dL):</label>{renderNumberInput("creat", "Ex: 1.0", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Dialyse (≥ 2 fois dans la dernière semaine) ?</label>{renderRadioGroup("dialyse", [{value:"non", label:"Non"}, {value:"oui", label:"Oui"}])}</div>
                </>
            );
            
        case "rockall":
            return (
                <>
                    <h3 className="form-section-title">Critères</h3>
                    <div className="input-group"><label className="input-label">Âge (années):</label>{renderNumberInput("age", "Ex: 65", "1")}</div>
                    <div className="input-group"><label className="input-label">Choc:</label>{renderSelect("choc", [{value:0, label:"Pas de choc (PAS ≥ 100, FC < 100)"}, {value:1, label:"Tachycardie (PAS ≥ 100, FC ≥ 100)"}, {value:2, label:"Hypotension (PAS < 100)"}])}</div>
                    <div className="input-group"><label className="input-label">Comorbidités:</label>{renderSelect("comorbidites", [{value:0, label:"Aucune majeure"}, {value:2, label:"Insuffisance cardiaque, coronaropathie"}, {value:3, label:"Insuffisance rénale, hépatique, cancer métastatique"}])}</div>
                    <div className="input-group"><label className="input-label">Diagnostic endoscopique:</label>{renderSelect("diagnostic", [{value:0, label:"Mallory-Weiss, pas de lésion"}, {value:1, label:"Toutes autres lésions"}, {value:2, label:"Néoplasie GI haute"}])}</div>
                    <div className="input-group"><label className="input-label">Stigmates de saignement récent:</label>{renderSelect("saignement", [{value:0, label:"Aucun ou tache pigmentée"}, {value:2, label:"Sang dans le tube digestif, caillot, vaisseau visible"}])}</div>
                </>
            );
            
        case "nihss":
            return (
                <>
                    <h3 className="form-section-title">Score total du NIHSS</h3>
                    <div className="input-group">
                        <label className="input-label">Score NIHSS (sur 42):</label>
                        {renderNumberInput("score", "0-42", "1")}
                        <div className="input-hint">Entrez le score total obtenu à l'évaluation NIHSS</div>
                    </div>
                </>
            );
            
        case "rankin":
            return (
                <>
                    <h3 className="form-section-title">Degré d'incapacité</h3>
                    <div className="input-group">
                        <label className="input-label">Score de Rankin modifié:</label>
                        {renderSelect("score", [
                            {value:0, label:"0 - Aucun symptôme"},
                            {value:1, label:"1 - Pas d'incapacité significative"},
                            {value:2, label:"2 - Incapacité légère"},
                            {value:3, label:"3 - Incapacité modérée"},
                            {value:4, label:"4 - Incapacité modérée à sévère"},
                            {value:5, label:"5 - Incapacité sévère"},
                            {value:6, label:"6 - Décès"}
                        ])}
                    </div>
                </>
            );
            
        case "mna":
            return (
                <>
                    <h3 className="form-section-title">Score total du MNA</h3>
                    <div className="input-group">
                        <label className="input-label">Score MNA (sur 30):</label>
                        {renderNumberInput("score", "0-30", "0.5")}
                        <div className="input-hint">Entrez le score total obtenu au questionnaire MNA</div>
                    </div>
                </>
            );
            
        case "curb65":
            return (
                <>
                    <h3 className="form-section-title">Critères (1 point chacun)</h3>
                    {renderCheckbox("c", "Confusion mentale nouvelle")}
                    {renderCheckbox("u", "Urée > 7 mmol/L (ou > 20 mg/dL)")}
                    {renderCheckbox("r", "Fréquence Respiratoire ≥ 30/min")}
                    {renderCheckbox("b", "Pression artérielle Basse (PAS < 90 ou PAD ≤ 60 mmHg)")}
                    {renderCheckbox("age65", "Âge ≥ 65 ans")}
                </>
            );
            
        case "wells-ep":
            return (
                <>
                    <h3 className="form-section-title">Critères cliniques</h3>
                    {renderCheckbox("tvp", "Signes cliniques de TVP (+3 points)")}
                    {renderCheckbox("autreDiag", "EP est le diagnostic le plus probable (+3 points)")}
                    {renderCheckbox("fc", "Fréquence cardiaque > 100 bpm (+1.5 points)")}
                    {renderCheckbox("immobilisation", "Immobilisation ≥ 3j ou chirurgie < 4 sem (+1.5 points)")}
                    {renderCheckbox("antecedent", "Antécédent de TVP ou EP (+1.5 points)")}
                    {renderCheckbox("hemoptysie", "Hémoptysie (+1 point)")}
                    {renderCheckbox("cancer", "Cancer actif ou traité < 6 mois (+1 point)")}
                </>
            );
            
        case "gold":
            return (
                <>
                    <h3 className="form-section-title">Fonction respiratoire</h3>
                    <div className="input-group">
                        <label className="input-label">VEMS post-bronchodilatateur (% de la théorique):</label>
                        {renderNumberInput("vems", "Ex: 65", "1")}
                        <div className="input-hint">Pourcentage du VEMS par rapport à la valeur théorique</div>
                    </div>
                </>
            );
            
        case "sofa":
            return (
                <>
                    <h3 className="form-section-title">Dysfonctions d'organes</h3>
                    <div className="input-group"><label className="input-label">Respiration (PaO2/FiO2):</label>{renderSelect("respiration", [{value:0, label:"≥ 400 (0pt)"}, {value:1, label:"< 400 (1pt)"}, {value:2, label:"< 300 (2pts)"}, {value:3, label:"< 200 avec VM (3pts)"}, {value:4, label:"< 100 avec VM (4pts)"}])}</div>
                    <div className="input-group"><label className="input-label">Coagulation (Plaquettes):</label>{renderSelect("coagulation", [{value:0, label:"≥ 150 (0pt)"}, {value:1, label:"< 150 (1pt)"}, {value:2, label:"< 100 (2pts)"}, {value:3, label:"< 50 (3pts)"}, {value:4, label:"< 20 (4pts)"}])}</div>
                    <div className="input-group"><label className="input-label">Foie (Bilirubine mg/dL):</label>{renderSelect("foie", [{value:0, label:"< 1.2 (0pt)"}, {value:1, label:"1.2-1.9 (1pt)"}, {value:2, label:"2.0-5.9 (2pts)"}, {value:3, label:"6.0-11.9 (3pts)"}, {value:4, label:"≥ 12 (4pts)"}])}</div>
                    <div className="input-group"><label className="input-label">Cardiovasculaire:</label>{renderSelect("cardio", [{value:0, label:"PAM ≥ 70 (0pt)"}, {value:1, label:"PAM < 70 (1pt)"}, {value:2, label:"Dopamine ≤ 5 (2pts)"}, {value:3, label:"Dopamine > 5 (3pts)"}, {value:4, label:"Dopamine > 15 (4pts)"}])}</div>
                    <div className="input-group"><label className="input-label">SNC (Glasgow):</label>{renderSelect("snc", [{value:0, label:"15 (0pt)"}, {value:1, label:"13-14 (1pt)"}, {value:2, label:"10-12 (2pts)"}, {value:3, label:"6-9 (3pts)"}, {value:4, label:"< 6 (4pts)"}])}</div>
                    <div className="input-group"><label className="input-label">Rénal (Créatinine mg/dL):</label>{renderSelect("renal", [{value:0, label:"< 1.2 (0pt)"}, {value:1, label:"1.2-1.9 (1pt)"}, {value:2, label:"2.0-3.4 (2pts)"}, {value:3, label:"3.5-4.9 (3pts)"}, {value:4, label:"≥ 5.0 (4pts)"}])}</div>
                </>
            );
            
        case "saps2":
            return (
                <>
                    <h3 className="form-section-title">Score total du SAPS II</h3>
                    <div className="input-group">
                        <label className="input-label">Score SAPS II (sur 163):</label>
                        {renderNumberInput("score", "0-163", "1")}
                        <div className="input-hint">Entrez le score SAPS II calculé (âge + 12 variables physiologiques + 3 variables de morbidité)</div>
                    </div>
                </>
            );
            
        case "apache2":
            return (
                <>
                    <h3 className="form-section-title">Score total de l'APACHE II</h3>
                    <div className="input-group">
                        <label className="input-label">Score APACHE II (sur 71):</label>
                        {renderNumberInput("score", "0-71", "1")}
                        <div className="input-hint">Entrez le score APACHE II total calculé</div>
                    </div>
                </>
            );
            
        case "mdrd":
            return (
                <>
                    <h3 className="form-section-title">Paramètres pour calcul du DFG</h3>
                    <div className="input-group"><label className="input-label">Créatininémie (mg/dL):</label>{renderNumberInput("creat", "Ex: 1.2", "0.01")}</div>
                    <div className="input-group"><label className="input-label">Âge (années):</label>{renderNumberInput("age", "Ex: 65", "1")}</div>
                    <div className="input-group"><label className="input-label">Sexe:</label>{renderRadioGroup("sexe", [{value:"homme", label:"Homme"}, {value:"femme", label:"Femme"}])}</div>
                    <div className="input-group"><label className="input-label">Origine ethnique:</label>{renderRadioGroup("ethnie", [{value:"autre", label:"Caucasien/Autre"}, {value:"afro", label:"Afro-américain"}])}</div>
                </>
            );
            
        case "ckd-epi":
            return (
                <>
                    <h3 className="form-section-title">Paramètres pour calcul du DFG</h3>
                    <div className="input-group"><label className="input-label">Créatininémie (mg/dL):</label>{renderNumberInput("creat", "Ex: 1.2", "0.01")}</div>
                    <div className="input-group"><label className="input-label">Âge (années):</label>{renderNumberInput("age", "Ex: 65", "1")}</div>
                    <div className="input-group"><label className="input-label">Sexe:</label>{renderRadioGroup("sexe", [{value:"homme", label:"Homme"}, {value:"femme", label:"Femme"}])}</div>
                    <div className="input-group"><label className="input-label">Origine ethnique:</label>{renderRadioGroup("ethnie", [{value:"autre", label:"Caucasien/Autre"}, {value:"afro", label:"Afro-américain"}])}</div>
                </>
            );
            
        case "cockroft":
            return (
                <>
                    <h3 className="form-section-title">Paramètres pour clairance de la créatinine</h3>
                    <div className="input-group"><label className="input-label">Créatininémie (mg/dL):</label>{renderNumberInput("creat", "Ex: 1.2", "0.01")}</div>
                    <div className="input-group"><label className="input-label">Âge (années):</label>{renderNumberInput("age", "Ex: 65", "1")}</div>
                    <div className="input-group"><label className="input-label">Poids (kg):</label>{renderNumberInput("poids", "Ex: 70", "0.1")}</div>
                    <div className="input-group"><label className="input-label">Sexe:</label>{renderRadioGroup("sexe", [{value:"homme", label:"Homme"}, {value:"femme", label:"Femme"}])}</div>
                </>
            );
            
        case "apgar":
            return (
                <>
                    <h3 className="form-section-title">Évaluation du nouveau-né</h3>
                    <div className="input-group"><label className="input-label">Fréquence cardiaque:</label>{renderSelect("fc", [{value:0, label:"0 - Absente"}, {value:1, label:"1 - < 100 bpm"}, {value:2, label:"2 - ≥ 100 bpm"}])}</div>
                    <div className="input-group"><label className="input-label">Respiration:</label>{renderSelect("respiration", [{value:0, label:"0 - Absente"}, {value:1, label:"1 - Irrégulière, faible"}, {value:2, label:"2 - Normale, cris"}])}</div>
                    <div className="input-group"><label className="input-label">Tonus musculaire:</label>{renderSelect("tonus", [{value:0, label:"0 - Flasque"}, {value:1, label:"1 - Flexion légère"}, {value:2, label:"2 - Mouvements actifs"}])}</div>
                    <div className="input-group"><label className="input-label">Réactivité (grimace):</label>{renderSelect("reactivite", [{value:0, label:"0 - Aucune"}, {value:1, label:"1 - Grimace"}, {value:2, label:"2 - Cri vigoureux"}])}</div>
                    <div className="input-group"><label className="input-label">Coloration:</label>{renderSelect("coloration", [{value:0, label:"0 - Cyanose généralisée"}, {value:1, label:"1 - Extrémités cyanosées"}, {value:2, label:"2 - Rosé"}])}</div>
                </>
            );
            
        case "bishop":
            return (
                <>
                    <h3 className="form-section-title">Maturation cervicale</h3>
                    <div className="input-group"><label className="input-label">Dilatation du col:</label>{renderSelect("col", [{value:0, label:"0 - Fermé"}, {value:1, label:"1 - 1-2 cm"}, {value:2, label:"2 - 3-4 cm"}, {value:3, label:"3 - ≥ 5 cm"}])}</div>
                    <div className="input-group"><label className="input-label">Effacement du col:</label>{renderSelect("effacement", [{value:0, label:"0 - 0-30%"}, {value:1, label:"1 - 40-50%"}, {value:2, label:"2 - 60-70%"}, {value:3, label:"3 - ≥ 80%"}])}</div>
                    <div className="input-group"><label className="input-label">Consistance:</label>{renderSelect("consistance", [{value:0, label:"0 - Ferme"}, {value:1, label:"1 - Intermédiaire"}, {value:2, label:"2 - Mou"}])}</div>
                    <div className="input-group"><label className="input-label">Position du col:</label>{renderSelect("position", [{value:0, label:"0 - Postérieur"}, {value:1, label:"1 - Intermédiaire"}, {value:2, label:"2 - Antérieur"}])}</div>
                    <div className="input-group"><label className="input-label">Hauteur de la présentation:</label>{renderSelect("hauteur", [{value:0, label:"0 - -3"}, {value:1, label:"1 - -2"}, {value:2, label:"2 - -1 ou 0"}, {value:3, label:"3 - +1 ou +2"}])}</div>
                </>
            );
            
        case "phq9":
            return (
                <>
                    <h3 className="form-section-title">Score total du PHQ-9</h3>
                    <div className="input-group">
                        <label className="input-label">Score PHQ-9 (sur 27):</label>
                        {renderNumberInput("score", "0-27", "1")}
                        <div className="input-hint">Somme des 9 questions (0-3 points chacune)</div>
                    </div>
                </>
            );
            
        case "gad7":
            return (
                <>
                    <h3 className="form-section-title">Score total du GAD-7</h3>
                    <div className="input-group">
                        <label className="input-label">Score GAD-7 (sur 21):</label>
                        {renderNumberInput("score", "0-21", "1")}
                        <div className="input-hint">Somme des 7 questions (0-3 points chacune)</div>
                    </div>
                </>
            );
            
        case "das28":
            return (
                <>
                    <h3 className="form-section-title">Paramètres cliniques</h3>
                    <div className="input-group"><label className="input-label">Nombre d'articulations douloureuses (NAD, sur 28):</label>{renderNumberInput("nad", "0-28", "1")}</div>
                    <div className="input-group"><label className="input-label">Nombre d'articulations gonflées (NAG, sur 28):</label>{renderNumberInput("nag", "0-28", "1")}</div>
                    <div className="input-group"><label className="input-label">VS (mm/1ère heure):</label>{renderNumberInput("vs", "Ex: 20", "1")}</div>
                    <div className="input-group"><label className="input-label">Évaluation globale par le patient (EVG, 0-100 mm):</label>{renderNumberInput("evg", "0-100", "1")}</div>
                </>
            );
            
        case "frax":
            return (
                <>
                    <h3 className="form-section-title">Risque de fracture</h3>
                    <div className="input-group">
                        <label className="input-label">Risque de fracture ostéoporotique à 10 ans (%):</label>
                        {renderNumberInput("risque", "0-100", "0.1")}
                        <div className="input-hint">Calculez ce risque sur le site officiel FRAX puis entrez le résultat ici</div>
                    </div>
                </>
            );
            
        case "ipss":
            return (
                <>
                    <h3 className="form-section-title">Score total de l'IPSS</h3>
                    <div className="input-group">
                        <label className="input-label">Score IPSS (sur 35):</label>
                        {renderNumberInput("score", "0-35", "1")}
                        <div className="input-hint">Somme des 7 questions sur les symptômes urinaires (0-5 points chacune)</div>
                    </div>
                </>
            );
            
        default:
            return <p>Sélectionnez un score pour commencer.</p>;
    }
  };

  if (selectedScore) {
    return (
      <div className="modal-scores-content">
        <div className="modal-header">
          <button className="back-button" onClick={() => setSelectedScore(null)}>
            ← Retour à la liste
          </button>
          <h3>{selectedScore.name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="score-description">{selectedScore.description}</p>
          
          <div className="score-form-container">
            {getScoreForm()}
          </div>
          
          <div className="score-actions">
            <button className="calculate-button" onClick={calculateScore}>
              Calculer
            </button>
            
            {result && (
              <div className="score-result">
                <h4>Résultat :</h4>
                <p>{result}</p>
                <button className="insert-button" onClick={handleInsert}>
                  Insérer dans la note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-scores-content">
      <div className="modal-header">
        <h2>Calculateur de Scores</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="modal-body">
        <div className="filter-container">
          <div className="filter-group">
            <label>Filtrer par spécialité :</label>
            <select 
              className="filter-select"
              value={selectedSpecialty} 
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="Tous">Toutes les spécialités</option>
              {Object.keys(scoresBySpecialty).sort().map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Rechercher un score :</label>
            <input
              className="filter-input"
              type="text"
              placeholder="Nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="results-count">
          {filteredScores.length} score(s) trouvé(s)
        </div>

        <div className="score-grid">
          {filteredScores
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(score => (
              <div 
                key={score.id} 
                className="score-card"
                onClick={() => setSelectedScore(score)}
              >
                <h3>{score.name}</h3>
                <p>{score.description}</p>
                <span className="specialty-badge">{score.specialty}</span>
              </div>
            ))
          }
        </div>

        {filteredScores.length === 0 && (
          <div className="no-results-message">
            Aucun score ne correspond à vos critères de recherche.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalScores;