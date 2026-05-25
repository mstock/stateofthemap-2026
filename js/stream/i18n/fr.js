/* =============================================================================
   Traduction : Français (fr)
   -----------------------------------------------------------------------------
   Pour ajouter une langue : copier ce fichier, traduire les valeurs (ne pas
   toucher aux clés ni aux {variables}), l'enregistrer dans ce même dossier
   (ex. it.js), puis suivre les 3 étapes décrites en haut de assets/js/app.js.
   ============================================================================= */
window.SOTM_I18N = window.SOTM_I18N || {};
window.SOTM_I18N.fr = {
  topbar: {
    title: "State of the Map 2026",
    subtitle: "Diffusion en direct · Paris",
    liveLoading: "Chargement des statuts…",
    liveCount: "{live} / {total} en direct",
    langLabel: "Langue"
  },
  stage: {
    emptyText: "Choisissez un flux dans la légende pour démarrer la lecture.",
    emptyHint: "Un seul lecteur actif à la fois",
    popout: "Ouvrir dans une nouvelle fenêtre",
    close: "Fermer le lecteur"
  },
  legend: {
    eyebrow: "Légende",
    heading: "Flux disponibles",
    toggle: "Réduire ou afficher la liste des flux",
    viewAllReplays: "Voir toutes les rediffusions ({count})",
    replaysHeading: "Rediffusions",
    mapButton: "Voir la carte des salles et les flux en direct",
    mapOpenExternal: "Ouvrir dans un nouvel onglet ↗"
  },
  status: {
    live: "En direct",
    offline: "Hors ligne",
    standby: "En pause",
    unknown: "Statut inconnu",
    pending: "Statut…",
    pano: "Caméra 360°"
  },
  channels: {
    ch1:  { title: "Flux 1", room: "Guadeloupe" },
    ch2:  { title: "Flux 2", room: "La Réunion" },
    ch3:  { title: "Flux 3", room: "Martinique" },
    ch4:  { title: "Flux 4", room: "Plateau TV" },
    pano: { title: "Caméra panoramique", room: "Vue 360°" }
  }
};
