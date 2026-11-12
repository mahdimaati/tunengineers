// Données de départ. Les ingénieurs sont FICTIFS (démonstration) ; les entreprises sont réelles
// (les villes sont indicatives : vérifiez-les avant la soutenance).

/** [nom, secteur, ville, site officiel] */
const COMPANIES = [
  // Télécoms
  ['Tunisie Telecom', 'Télécoms', 'Tunis', 'https://www.tunisietelecom.tn'],
  ['Ooredoo Tunisie', 'Télécoms', 'Tunis', 'https://www.ooredoo.tn'],
  ['Orange Tunisie', 'Télécoms', 'Tunis', 'https://www.orange.tn'],
  ['Huawei Tunisie', 'Télécoms', 'Tunis', 'https://www.huawei.com'],
  ['Ericsson Tunisie', 'Télécoms', 'Tunis', 'https://www.ericsson.com'],
  ['Nokia Tunisie', 'Télécoms', 'Tunis', 'https://www.nokia.com'],
  // Informatique
  ['Vermeg', 'Informatique', 'Tunis', 'https://www.vermeg.com'],
  ['Sofrecom Tunisie', 'Informatique', 'Tunis', 'https://www.sofrecom.com'],
  ['Telnet Holding', 'Informatique', 'Ariana', 'https://www.telnet.com.tn'],
  ['Focus Corporation', 'Informatique', 'Tunis', 'https://www.focus.com.tn'],
  ['Proxym Group', 'Informatique', 'Sousse', 'https://www.proxym-group.com'],
  ['Capgemini Tunisie', 'Informatique', 'Tunis', 'https://www.capgemini.com'],
  ['Talan Tunisie', 'Informatique', 'Tunis', 'https://www.talan.com'],
  ['Linedata Services', 'Informatique', 'Tunis', 'https://www.linedata.com'],
  ['Sopra Steria Tunisie', 'Informatique', 'Tunis', 'https://www.soprasteria.com'],
  ['InstaDeep', 'Informatique', 'Tunis', 'https://www.instadeep.com'],
  ['Expensya', 'Informatique', 'Tunis', 'https://www.expensya.com'],
  ['Ubisoft Tunisie', 'Informatique', 'Tunis', 'https://www.ubisoft.com'],
  ['Microsoft Tunisie', 'Informatique', 'Tunis', 'https://www.microsoft.com'],
  // Industrie
  ['Sartex', 'Industrie', 'Sfax', 'https://www.sartex.com.tn'],
  ['Poulina Group Holding', 'Industrie', 'Ben Arous', 'https://www.poulinagh.com'],
  ['Délice Danone', 'Industrie', 'Ben Arous', 'https://www.delice.tn'],
  ['Schneider Electric Tunisie', 'Industrie', 'Tunis', 'https://www.se.com'],
  ['Siemens Tunisie', 'Industrie', 'Tunis', 'https://www.siemens.com'],
  ['ABB Tunisie', 'Industrie', 'Tunis', 'https://www.abb.com'],
  ['Carthage Cement', 'Industrie', 'Tunis', 'https://www.carthagecement.com.tn'],
  // Énergie
  ['STEG', 'Énergie', 'Tunis', 'https://www.steg.com.tn'],
  ['ETAP', 'Énergie', 'Tunis', 'https://www.etap.com.tn'],
  ['Star Oil Tunisie', 'Énergie', 'Tunis', 'https://www.staroil.com.tn'],
  ['Agil Energy', 'Énergie', 'Tunis', 'https://www.agil.com.tn'],
  ['TotalEnergies Tunisie', 'Énergie', 'Tunis', 'https://totalenergies.com'],
  ['Eni Tunisie', 'Énergie', 'Tunis', 'https://www.eni.com'],
  // Automobile
  ['Leoni Tunisie', 'Automobile', 'Sousse', 'https://www.leoni.com'],
  ['Yazaki Tunisie', 'Automobile', 'Bizerte', 'https://www.yazaki-europe.com'],
  ['Stellantis Tunisie', 'Automobile', 'Ben Arous', 'https://www.stellantis.com'],
  ['Lear Corporation Tunisie', 'Automobile', 'Bizerte', 'https://www.lear.com'],
  ['Valeo Tunisie', 'Automobile', 'Tunis', 'https://www.valeo.com'],
  ['Dräxlmaier Tunisie', 'Automobile', 'Tunis', 'https://www.draexlmaier.com'],
  ['Aptiv Tunisie', 'Automobile', 'Tunis', 'https://www.aptiv.com'],
  // Aéronautique & transport
  ['Airbus Tunisie', 'Aéronautique', 'Tunis', 'https://www.airbus.com'],
  ['Safran Tunisie', 'Aéronautique', 'Tunis', 'https://www.safran-group.com'],
  ['Tunisair', 'Transport', 'Tunis', 'https://www.tunisair.com'],
  ['SNCFT', 'Transport', 'Tunis', 'https://www.sncft.com.tn'],
  // BTP
  ['Bouygues Construction', 'BTP', 'Tunis', 'https://www.bouygues-construction.com'],
  ['Eiffage', 'BTP', 'Tunis', 'https://www.eiffage.com'],
  ['Vinci Construction', 'BTP', 'Tunis', 'https://www.vinci-construction.com'],
  // Chimie & pharma
  ['Groupe Chimique Tunisien', 'Chimie', 'Gabès', 'https://www.gct.com.tn'],
  ['Saint-Gobain Tunisie', 'Chimie', 'Tunis', 'https://www.saint-gobain.com'],
  ['Medis', 'Chimie', 'Tunis', 'https://www.medis.com.tn'],
];

/** [nom, genre (F/M), domaine, compétences, ville, expérience, statut] */
const ENGINEERS = [
  ['Amine Mejri', 'M', 'Informatique', 'Angular,Node.js,SQL,DevOps', 'Tunis', '3 à 5 ans', 'approuve'],
  ['Salma Ben Ali', 'F', 'Génie civil', 'AutoCAD,Revit,Béton armé', 'Sfax', '3 à 5 ans', 'approuve'],
  ['Yassine Trabelsi', 'M', 'Électrique', 'SCADA,Automates,Schémas', 'Sousse', '6 à 10 ans', 'approuve'],
  ['Nour Haddad', 'F', 'Télécoms', '5G,Réseaux,Python', 'Tunis', '1 à 2 ans', 'approuve'],
  ['Lina Mansour', 'F', 'Industriel', 'Lean,Six Sigma,Supply chain', 'Bizerte', '3 à 5 ans', 'approuve'],
  ['Rami Gharbi', 'M', 'Énergie', 'Solaire,Efficacité énergétique', 'Gabès', '6 à 10 ans', 'approuve'],
  ['Oussama Zied', 'M', 'Chimie', 'Procédés,Qualité,HSE', 'Monastir', '6 à 10 ans', 'approuve'],
  ['Mariem Chaabane', 'F', 'Mécanique', 'SolidWorks,CAO,Fabrication', 'Nabeul', '1 à 2 ans', 'approuve'],
  ['Karim Jlassi', 'M', 'Informatique', 'Python,Machine Learning,Docker', 'Ariana', '3 à 5 ans', 'en_attente'],
  ['Hajer Bouzid', 'F', 'Génie civil', 'Topographie,Route,Structures', 'Kairouan', '1 à 2 ans', 'en_attente'],
  ['Walid Sassi', 'M', 'Électrique', 'Électronique,Embarqué,C', 'Tunis', '3 à 5 ans', 'refuse'],

  // Informatique
  ['Ines Ben Salah', 'F', 'Informatique', 'React,TypeScript,UX', 'Tunis', '3 à 5 ans', 'approuve'],
  ['Mehdi Khelifi', 'M', 'Informatique', 'Java,Spring,Microservices', 'Sousse', '6 à 10 ans', 'approuve'],
  ['Rania Dridi', 'F', 'Informatique', 'Data Science,Python,Power BI', 'Ariana', '1 à 2 ans', 'approuve'],
  ['Fares Ouertani', 'M', 'Informatique', 'Cybersécurité,Pentest,SOC', 'Sfax', '3 à 5 ans', 'approuve'],
  ['Asma Belhaj', 'F', 'Informatique', 'QA,Selenium,Agile', 'Monastir', '3 à 5 ans', 'approuve'],
  ['Hatem Zouari', 'M', 'Informatique', 'Cloud,AWS,Kubernetes', 'Tunis', 'Plus de 10 ans', 'approuve'],
  ['Yosra Mabrouk', 'F', 'Informatique', 'Flutter,Mobile,Firebase', 'Nabeul', 'Jeune diplômé', 'approuve'],
  ['Bilel Cherif', 'M', 'Informatique', 'IA,NLP,PyTorch', 'Bizerte', '1 à 2 ans', 'approuve'],
  ['Rahma Chebbi', 'F', 'Informatique', 'Vue.js,Laravel,MySQL', 'Mahdia', 'Jeune diplômé', 'en_attente'],
  // Génie civil
  ['Sonia Gharbi', 'F', 'Génie civil', 'Structures,Robot,Béton', 'Tunis', '6 à 10 ans', 'approuve'],
  ['Anis Rebai', 'M', 'Génie civil', 'Routes,Topographie,Covadis', 'Sfax', '3 à 5 ans', 'approuve'],
  ['Dorra Karray', 'F', 'Génie civil', 'BIM,Revit,Chantier', 'Gabès', '1 à 2 ans', 'approuve'],
  ['Marwen Hamdi', 'M', 'Génie civil', 'Hydraulique,Barrages,Irrigation', 'Gafsa', 'Plus de 10 ans', 'approuve'],
  ['Emna Slimani', 'F', 'Génie civil', 'Géotechnique,Fondations', 'Sousse', '3 à 5 ans', 'approuve'],
  // Électrique
  ['Taher Ayari', 'M', 'Électrique', 'Haute tension,Postes,Protection', 'Tunis', '6 à 10 ans', 'approuve'],
  ['Khawla Msakni', 'F', 'Électrique', 'Automatisme,API Siemens,TIA Portal', 'Sfax', '3 à 5 ans', 'approuve'],
  ['Ghassen Nasri', 'M', 'Électrique', 'Électronique de puissance,Variateurs', 'Bizerte', '1 à 2 ans', 'approuve'],
  ['Sabrine Fradi', 'F', 'Électrique', 'Embarqué,STM32,C', 'Ariana', 'Jeune diplômé', 'approuve'],
  ['Mourad Lahmar', 'M', 'Électrique', 'Maintenance,GMAO,Diagnostic', 'Ben Arous', 'Plus de 10 ans', 'approuve'],
  ['Anouar Sahli', 'M', 'Électrique', 'Domotique,KNX,Schémas', 'Kasserine', '1 à 2 ans', 'en_attente'],
  // Télécoms
  ['Wafa Jebali', 'F', 'Télécoms', 'Fibre optique,FTTH,Radio', 'Tunis', '3 à 5 ans', 'approuve'],
  ['Nizar Bouazizi', 'M', 'Télécoms', 'Core réseau,IMS,VoLTE', 'Sousse', '6 à 10 ans', 'approuve'],
  ['Amal Tlili', 'F', 'Télécoms', 'Cisco,CCNP,SD-WAN', 'Ariana', '3 à 5 ans', 'approuve'],
  ['Skander Mahjoub', 'M', 'Télécoms', 'IoT,LoRa,MQTT', 'Monastir', '1 à 2 ans', 'approuve'],
  ['Maha Ferchichi', 'F', 'Télécoms', '5G,RAN,Planification radio', 'Tunis', '1 à 2 ans', 'approuve'],
  ['Nesrine Ghanmi', 'F', 'Télécoms', 'Antennes,Mesures RF', 'Jendouba', '3 à 5 ans', 'refuse'],
  // Industriel
  ['Zied Hammami', 'M', 'Industriel', 'Lean,Kaizen,5S', 'Sfax', '6 à 10 ans', 'approuve'],
  ['Cyrine Aloui', 'F', 'Industriel', 'Qualité,ISO 9001,Audit', 'Ben Arous', '3 à 5 ans', 'approuve'],
  ['Hichem Marzouki', 'M', 'Industriel', 'Logistique,ERP,SAP', 'Bizerte', '6 à 10 ans', 'approuve'],
  ['Olfa Kefi', 'F', 'Industriel', 'Planification,Ordonnancement', 'Sousse', '1 à 2 ans', 'approuve'],
  ['Aymen Bouslama', 'M', 'Industriel', 'Méthodes,Chronométrage,Ergonomie', 'Nabeul', 'Jeune diplômé', 'approuve'],
  // Énergie
  ['Hela Naceur', 'F', 'Énergie', 'Photovoltaïque,PVsyst,Audit énergétique', 'Tunis', '3 à 5 ans', 'approuve'],
  ['Slim Bejaoui', 'M', 'Énergie', 'Éolien,Maintenance,SCADA', 'Gabès', '6 à 10 ans', 'approuve'],
  ['Rim Dhouib', 'F', 'Énergie', 'Biogaz,Hydrogène vert', 'Sfax', '1 à 2 ans', 'approuve'],
  ['Fedi Louati', 'M', 'Énergie', 'Pétrole,Forage,HSE', 'Tataouine', 'Plus de 10 ans', 'approuve'],
  ['Ahlem Sebai', 'F', 'Énergie', 'Solaire thermique,Dessalement', 'Médenine', '3 à 5 ans', 'approuve'],
  // Chimie
  ['Najla Ketata', 'F', 'Chimie', 'Pharma,BPF,Validation', 'Monastir', '6 à 10 ans', 'approuve'],
  ['Ramzi Kallel', 'M', 'Chimie', 'Phosphates,Procédés,Analyse', 'Sfax', '3 à 5 ans', 'approuve'],
  ['Sirine Abid', 'F', 'Chimie', 'Environnement,Traitement des eaux', 'Gabès', '1 à 2 ans', 'approuve'],
  ['Houssem Gasmi', 'M', 'Chimie', 'Polymères,Plasturgie', 'Bizerte', '3 à 5 ans', 'approuve'],
  // Mécanique
  ['Lotfi Ben Youssef', 'M', 'Mécanique', 'CATIA,Usinage CNC', 'Sousse', '6 à 10 ans', 'approuve'],
  ['Imen Zarrouk', 'F', 'Mécanique', 'Aéronautique,Conception,CAO', 'Tunis', '3 à 5 ans', 'approuve'],
  ['Nabil Hadj Salah', 'M', 'Mécanique', 'Thermique,CVC,Fluides', 'Sfax', '6 à 10 ans', 'approuve'],
  ['Chaima Ben Romdhane', 'F', 'Mécanique', 'Soudage,Métallurgie,Contrôle', 'Ben Arous', 'Jeune diplômé', 'approuve'],
  ['Ali Bouhlel', 'M', 'Mécanique', 'Robotique,Mécatronique', 'Nabeul', '1 à 2 ans', 'approuve'],
  ['Tarek Maaloul', 'M', 'Mécanique', 'Maintenance,Vibrations,Fiabilité', 'Gabès', 'Plus de 10 ans', 'approuve'],
];

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
/** « Délice Danone » → « delice-danone » (nom des fichiers logo/avatar) */
const slug = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

module.exports = { COMPANIES, ENGINEERS, slug, strip };
