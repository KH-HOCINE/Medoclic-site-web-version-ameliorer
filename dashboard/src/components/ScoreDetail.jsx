import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../App.css'; // Importez le fichier CSS

const ScoreDetail = () => {
  const { scoreId } = useParams();
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  // Réinitialiser le formulaire quand l'ID du score change
  useEffect(() => {
    setInputs({});
    setResult(null);
  }, [scoreId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue;

    if (type === 'checkbox') {
        finalValue = checked;
    } else if (type === 'radio') {
        finalValue = value;
    } else {
        // Garde la valeur comme string si vide, sinon la convertit en nombre
        finalValue = value === '' ? '' : parseFloat(value);
    }
    setInputs(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let calculatedResult = '';

    switch (scoreId) {
      case "imc": {
        const { poids, taille } = inputs;
        if (!poids || !taille) return;
        const imc = poids / (taille * taille);
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
      default:
        break;
    }
    setResult(calculatedResult);
  };

  const getScoreTitle = () => {
    switch(scoreId) {
      case "imc": return "Indice de Masse Corporelle (IMC)";
      case "glasgow": return "Score de Glasgow";
      case "4peps": return "Score 4PEPS - Dépistage de la fragilité";
      case "cha2ds2vasc": return "Score CHA2DS2-VASc";
      case "wells-dvt": return "Score de Wells - Probabilité de TVP";
      case "apgar": return "Score d'Apgar";
      case "child-pugh": return "Score de Child-Pugh";
      case "qsofa": return "Score qSOFA (Quick SOFA)";
      default: return "Score non trouvé";
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

  const renderFormContent = () => {
    switch (scoreId) {
        case "imc":
            return (
                <>
                    <h3 className="form-section-title">Paramètres</h3>
                    <div className="input-group"><label className="input-label">Poids (kg):</label>{renderNumberInput("poids", "Ex: 70")}</div>
                    <div className="input-group"><label className="input-label">Taille (m):</label>{renderNumberInput("taille", "Ex: 1.75", "0.01")}</div>
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
        default:
            return <p>Sélectionnez un score pour commencer.</p>;
    }
  }

  return (
    <div className="main-container">
      <div className="score-detail-container">
        <h2>{getScoreTitle()}</h2>
        
        <form onSubmit={handleSubmit} className="score-form">
          {renderFormContent()}
          <button type="submit" className="submit-button">Calculer le Score</button>
        </form>

        {result && (
          <div className="result-box">
            <h3>Résultat :</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDetail;
