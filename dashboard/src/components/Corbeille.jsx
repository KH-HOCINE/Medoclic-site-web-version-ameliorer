import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrashAlt, FaSync, FaSearch, FaFileAlt, FaTimes } from "react-icons/fa";
import "../App.css";

const Corbeille = () => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filters, setFilters] = useState({
    itemType: 'all',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });

  const itemTypeLabels = {
    patient: "Patient",
    appointment: "Rendez-vous",
    medicament: "Médicament",
    prescription: "Ordonnance",
    bilan: "Bilan",
    certificat: "Certificat d'arrêt",
    justification: "Justification",
    lettre: "Lettre",
    note: "Note médicale",
    medicalFile: "Fichier médical"
  };

  const testLabels = {
    groupageSanguin: "Groupage sanguin",
    fnsComplete: "FNS Complète",
    glycemieAJeun: "Glycémie à jeun",
    hemoglobineGlyqueeHbA1c: "Hémoglobine glyquée (HbA1c)",
    hbpo: "HBPO",
    cholesterolTotalHDLLDL: "Cholestérol Total, HDL, LDL",
    triglycerides: "Triglycérides",
    ureeSanguine: "Urée sanguine",
    acideUrique: "Acide urique",
    bilirubineASATALAT: "Bilirubine : (ASAT, ALAT)",
    cpk: "CPK",
    testosteronemie: "Testostéronémie",
    prolactinemie: "Prolactinémie",
    tauxHCG: "Taux hCG",
    psaTotal: "PSA total",
    psaLibre: "PSA libre",
    phosphatasesAlcalines: "Phosphatases alcalines",
    tauxProthrombineTP: "Taux de prothrombine (TP)",
    tckInr: "TCK-INR",
    vsCrpFibrinogene: "VS, CRP, Fibrinogène",
    ferSerique: "Fer Sérique",
    ionogrammeSanguin: "Ionogramme sanguin (NA+, K+, CA)",
    phosphoremie: "Phosphorémie",
    magnesemie: "Magnésémie",
    ecbuAntibiogramme: "ECBU, Antibiogramme",
    chimieDesUrines: "Chimie des urines + Protéinurie des 24H",
    microalbuminurie: "Microalbuminurie",
    spermogramme: "Spermogramme",
    fshLh: "FSH, LH",
    tshT3T4: "TSH, T3, T4",
    covid19Pcr: "Covid-19: PCR",
    covid19Antigenique: "Covid-19: Antigénique",
    covid19Serologique: "Covid-19: Sérologique"
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchTrashItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/trash?${params}`,
        { withCredentials: true }
      );

      setTrashItems(response.data.trashItems);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (error) {
      console.error("Erreur lors du chargement de la corbeille:", error);
      toast.error("Erreur lors du chargement de la corbeille");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/trash/stats`,
        { withCredentials: true }
      );
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  useEffect(() => {
    fetchTrashItems();
    fetchStats();
  }, [filters]);

  const handleItemClick = (item) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleRestore = async (itemId, itemName, event) => {
    event.stopPropagation(); // Empêcher l'ouverture de la prévisualisation
    
    if (!window.confirm(`Êtes-vous sûr de vouloir restaurer "${itemName}" ?`)) {
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/trash/restore/${itemId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Élément restauré avec succès");
      fetchTrashItems();
      fetchStats();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la restauration");
    }
  };

  const handlePermanentDelete = async (itemId, itemName, event) => {
    event.stopPropagation(); // Empêcher l'ouverture de la prévisualisation
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${itemName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/trash/permanent/${itemId}`,
        { withCredentials: true }
      );
      toast.success("Élément supprimé définitivement");
      fetchTrashItems();
      fetchStats();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression définitive");
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir vider toute la corbeille ? Cette action est irréversible.")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/trash/empty`,
        { 
          data: { itemType: filters.itemType },
          withCredentials: true 
        }
      );
      toast.success("Corbeille vidée avec succès");
      fetchTrashItems();
      fetchStats();
    } catch (error) {
      console.error("Erreur lors du vidage de la corbeille:", error);
      toast.error("Erreur lors du vidage de la corbeille");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const renderPreviewContent = (item) => {
    const data = item.originalData;
    const doc = data.document;

    switch (item.itemType) {
      case 'patient':
        return (
          <div className="preview-patient">
            <h3>Informations du Patient</h3>
            <p><strong>Nom complet:</strong> {data.firstName} {data.lastName}</p>
            <p><strong>Numéro patient:</strong> {data.patientNumber}</p>
            <p><strong>Sexe:</strong> {data.gender === "Male" ? "Masculin" : data.gender === "Female" ? "Féminin" : "/"}</p>
            <p><strong>Date de naissance:</strong> {new Date(data.dob).toLocaleDateString('fr-FR')}</p>
            <p><strong>Groupe Sanguin:</strong> {data.bloodGroup}</p>
            <p><strong>Téléphone:</strong> {data.phoneNumber}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Adresse:</strong> {data.address}</p>
            {data.chronicDiseases && <p><strong>Antécédents médicaux:</strong> {data.chronicDiseases}</p>}
            {data.pastSurgeries && <p><strong>Antécédents chirurgicaux:</strong> {data.pastSurgeries}</p>}
          </div>
        );

      case 'medicament':
        return (
          <div className="preview-medicament">
            <h3>Médicament</h3>
            <p><strong>Nom commercial:</strong> {data.nomCommercial}</p>
            <p><strong>DCI:</strong> {data.dci}</p>
            <p><strong>Dosage:</strong> {data.dosage}</p>
            <p><strong>Forme:</strong> {data.forme}</p>
            <p><strong>Présentation:</strong> {data.presentation}</p>
            {data.classeTherapeutique && <p><strong>Classe thérapeutique:</strong> {data.classeTherapeutique}</p>}
            {data.sousClasseTherapeutique && <p><strong>Sous-classe:</strong> {data.sousClasseTherapeutique}</p>}
            {data.princepsGenerique && <p><strong>Type:</strong> {data.princepsGenerique}</p>}
            {data.laboratoire && <p><strong>Laboratoire:</strong> {data.laboratoire}</p>}
          </div>
        );

      case 'prescription':
        return (
          <div className="preview-prescription">
            <div className="preview-header">
              <h3>ORDONNANCE</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            <div className="preview-patient-info">
              <h4>Informations du Patient</h4>
              <p><strong>Nom complet:</strong> {data.patient?.firstName} {data.patient?.lastName}</p>
              {data.patient?.patientNumber && (
                <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
              )}
              {data.patient?.dob && (
                <p><strong>Date de naissance:</strong> {new Date(data.patient.dob).toLocaleDateString('fr-FR')}</p>
              )}
              {data.patient?.age && (
                <p><strong>Âge:</strong> {data.patient.age} ans</p>
              )}
              {data.patient?.gender && (
                <p><strong>Sexe:</strong> {data.patient.gender === "Male" ? "Masculin" : data.patient.gender === "Female" ? "Féminin" : "/"}</p>
              )}
            </div>

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
              {doc.doctor?.cabinetPhone && <p><strong>Téléphone:</strong> {doc.doctor.cabinetPhone}</p>}
              {doc.doctor?.ordreNumber && <p><strong>N° Ordre:</strong> {doc.doctor.ordreNumber}</p>}
            </div>
            
            {doc.notes && <p className="preview-notes"><strong>Notes:</strong> {doc.notes}</p>}
            
            <h4>Médicaments prescrits:</h4>
            <ul className="preview-medications">
              {doc.medications?.map((med, idx) => (
                <li key={idx}>
                  <strong>{med.nomCommercial} {med.dosage}</strong> - {med.boxes} boîte(s)
                  {med.note && <div className="med-note">{med.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'bilan':
        const predefinedTests = Object.entries(doc.tests || {})
          .filter(([_, isChecked]) => isChecked)
          .map(([key]) => testLabels[key] || key);
        const allTests = [...predefinedTests, ...(doc.additionalTests || [])];

        return (
          <div className="preview-bilan">
            <div className="preview-header">
              <h3>DEMANDE DE BILAN</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
                {data.patient.age && (
                  <p><strong>Âge:</strong> {data.patient.age} ans</p>
                )}
              </div>
            )}

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
            </div>
            
            <h4>Tests demandés:</h4>
            <ul className="preview-tests">
              {allTests.map((test, idx) => (
                <li key={idx}>{test}</li>
              ))}
            </ul>
          </div>
        );

      case 'certificat':
        return (
          <div className="preview-certificat">
            <div className="preview-header">
              <h3>CERTIFICAT D'ARRÊT DE TRAVAIL</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
              </div>
            )}

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
            </div>
            
            <div className="preview-content">
              {!doc.prolongationJours ? (
                <p><strong>Arrêt de travail:</strong> {doc.arretJours} jours</p>
              ) : (
                <>
                  <p><strong>Prolongation d'arrêt:</strong> {doc.prolongationJours} jours</p>
                  {doc.prolongationStart && (
                    <p><strong>Période:</strong> Du {new Date(doc.prolongationStart).toLocaleDateString('fr-FR')} au {new Date(doc.prolongationEnd).toLocaleDateString('fr-FR')}</p>
                  )}
                </>
              )}
              <p><strong>Reprise du travail le:</strong> {new Date(doc.returnDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        );

      case 'lettre':
        return (
          <div className="preview-lettre">
            <div className="preview-header">
              <h3>{doc.letterType?.toUpperCase()}</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
              </div>
            )}

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
            </div>
            
            <div className="preview-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{doc.contentText}</pre>
            </div>
          </div>
        );

      case 'justification':
        return (
          <div className="preview-justification">
            <div className="preview-header">
              <h3>JUSTIFICATION</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
              </div>
            )}

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
            </div>
            
            <div className="preview-content">
              <p>Je soussigné: <strong>{doc.doctorName}</strong></p>
              <p>Certifie avoir vu et examiné le(la) patient(e) ce jour dont certificat</p>
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="preview-note">
            <div className="preview-header">
              <h3>NOTE MÉDICALE</h3>
              <p><strong>Date:</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
            </div>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
              </div>
            )}

            <div className="preview-doctor-info">
              <p><strong>Médecin:</strong> {doc.doctorName}</p>
            </div>
            
            <div className="preview-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{doc.noteText}</pre>
            </div>
          </div>
        );

      case 'medicalFile':
        return (
          <div className="preview-file">
            <h3>Fichier Médical</h3>
            <p><strong>Nom du fichier:</strong> {item.fileName || 'Sans nom'}</p>
            <p><strong>Date d'ajout:</strong> {new Date(data.file?.addedDate || item.deletedAt).toLocaleDateString('fr-FR')}</p>
            
            {/* Informations du patient */}
            {data.patient && (
              <div className="preview-patient-info">
                <h4>Informations du Patient</h4>
                <p><strong>Nom complet:</strong> {data.patient.firstName} {data.patient.lastName}</p>
                {data.patient.patientNumber && (
                  <p><strong>Numéro patient:</strong> {data.patient.patientNumber}</p>
                )}
              </div>
            )}
            
            {data.file?.url && (
              <div className="file-preview-container">
                {data.file.url.startsWith("data:application/pdf") ? (
                  <iframe src={data.file.url} style={{ width: '100%', height: '500px', border: 'none' }} />
                ) : (
                  <img src={data.file.url} alt="Fichier médical" style={{ maxWidth: '100%', height: 'auto' }} />
                )}
              </div>
            )}
          </div>
        );

      default:
        return <p>Type de document non reconnu</p>;
    }
  };

  const renderItemDetails = (item) => {
    try {
      switch (item.itemType) {
        case 'patient':
          return `${item.originalData.firstName} ${item.originalData.lastName} (${item.originalData.patientNumber})`;
        case 'medicament':
          return `${item.originalData.nomCommercial} - ${item.originalData.dosage}`;
        case 'appointment':
          const apptDate = item.originalData.document?.date || item.appointmentDate;
          return `RDV du ${new Date(apptDate).toLocaleDateString('fr-FR')}`;
        case 'prescription':
          const prescDate = item.originalData.document?.date;
          const patientName = item.originalData.patient 
            ? `${item.originalData.patient.firstName} ${item.originalData.patient.lastName}`
            : 'Patient inconnu';
          return `Ordonnance pour ${patientName} - ${prescDate ? new Date(prescDate).toLocaleDateString('fr-FR') : 'Date inconnue'}`;
        case 'medicalFile':
          return `Fichier médical - ${item.fileName || 'Sans nom'}`;
        default:
          const docDate = item.originalData.document?.date || item.deletedAt;
          const defaultPatientName = item.originalData.patient 
            ? `${item.originalData.patient.firstName} ${item.originalData.patient.lastName}`
            : '';
          return `${itemTypeLabels[item.itemType]} ${defaultPatientName ? `pour ${defaultPatientName}` : ''} du ${new Date(docDate).toLocaleDateString('fr-FR')}`;
      }
    } catch (error) {
      return `Élément ${item.itemType} - Données corrompues`;
    }
  };

  if (loading) {
    return <div className="loading">Chargement de la corbeille...</div>;
  }

  return (
    <div className="corbeille-container">
      <div className="corbeille-header">
        <h2><FaTrashAlt /> Corbeille</h2>
        {stats && (
          <div className="trash-stats">
            <span>Total: {stats.totalItems} éléments</span>
            {stats.byType && stats.byType.map(stat => (
              <span key={stat._id}>{itemTypeLabels[stat._id]}: {stat.count}</span>
            ))}
          </div>
        )}
      </div>

      <div className="trash-filters">
        <select 
          value={filters.itemType} 
          onChange={(e) => handleFilterChange('itemType', e.target.value)}
        >
          <option value="all">Tous les types</option>
          {Object.entries(itemTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <input
          type="date"
          placeholder="Date de début"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />

        <input
          type="date"
          placeholder="Date de fin"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />

        <button 
          className="btn-empty-trash"
          onClick={handleEmptyTrash}
          disabled={trashItems.length === 0}
        >
          <FaTrashAlt /> Vider la corbeille
        </button>
      </div>

      <div className="trash-items-list">
        {trashItems.length === 0 ? (
          <div className="empty-trash">
            <p><FaTrashAlt /> La corbeille est vide</p>
          </div>
        ) : (
          trashItems.map((item) => (
            <div key={item._id} className="trash-item">
              <div 
                className="trash-item-details"
                onClick={() => handleItemClick(item)}
                title="Cliquer pour voir l'aperçu"
              >
                <div className="trash-item-header">
                  <span className="item-type-badge">{itemTypeLabels[item.itemType]}</span>
                </div>
                
                <div className="item-content">
                  {renderItemDetails(item)}
                </div>

                {item.deletedBy && (
                  <div className="deleted-by">
                    Supprimé par: Dr. {item.deletedBy.firstName} {item.deletedBy.lastName}, le {new Date(item.deletedAt).toLocaleDateString('fr-FR')} à {new Date(item.deletedAt).toLocaleTimeString('fr-FR')}
                  </div>
                )}
              </div>

              <div className="trash-item-actions">
                <button 
                  className="btn-restore"
                  onClick={(e) => handleRestore(item._id, renderItemDetails(item), e)}
                >
                  <FaSync /> Restaurer
                </button>
                <button 
                  className="btn-permanent-delete"
                  onClick={(e) => handlePermanentDelete(item._id, renderItemDetails(item), e)}
                >
                  <FaTrashAlt /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="trash-pagination">
          <button 
            disabled={filters.page <= 1}
            onClick={() => handleFilterChange('page', filters.page - 1)}
          >
            Précédent
          </button>
          
          <span>Page {filters.page} sur {pagination.totalPages}</span>
          
          <button 
            disabled={filters.page >= pagination.totalPages}
            onClick={() => handleFilterChange('page', filters.page + 1)}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {isPreviewOpen && previewItem && (
        <div className="preview-modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header-bar">
              <h2><FaFileAlt /> Aperçu - {itemTypeLabels[previewItem.itemType]}</h2>
              <button 
                className="preview-close-btn"
                onClick={() => setIsPreviewOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="preview-body">
              {renderPreviewContent(previewItem)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corbeille;