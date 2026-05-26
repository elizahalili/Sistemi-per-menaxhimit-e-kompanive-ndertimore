// High-Fidelity Client-side Database for Offline presentation
const SEED_DATA = {
  clients: [
    { id: 1, emri: "Arben", mbiemriKompania: "Limani", email: "arben.limani@gmail.com", telefoni: "+383 44 111 222", adresa: "Rruga UÇK, Prishtinë", llojiKlientit: "Individual" },
    { id: 2, emri: "Albi", mbiemriKompania: "Alba Group SH.P.K.", email: "info@albagroup.com", telefoni: "+383 49 222 333", adresa: "Zona Industriale, Fushë Kosovë", llojiKlientit: "Kompani" },
    { id: 3, emri: "Eliza", mbiemriKompania: "Halili", email: "eliza.halili@live.com", telefoni: "+383 45 333 444", adresa: "Lagjja Marigona, Çagllavicë", llojiKlientit: "Individual" },
    { id: 4, emri: "Valon", mbiemriKompania: "Krasniqi Construction", email: "valon@krasniqic.com", telefoni: "+383 44 444 555", adresa: "Bulevardi Bill Clinton, Prishtinë", llojiKlientit: "Kompani" }
  ],
  projects: [
    { id: 1, emertimi: "Rezidenti Elite Marigona", pershkrimi: "Ndërtimi i një lagjeje rezidenciale me 15 vila luksoze, parqe dhe infrastrukturë moderne elektrike dhe ujore.", klientiId: 3, clientName: "Eliza Halili", lokacioni: "Çagllavicë, Prishtinë", buxheti: 2500000.00, dataFillimit: "2026-01-10", dataPerfundimit: "2026-12-20", statusi: "Ne Progres", progresiTotal: 65 },
    { id: 2, emertimi: "Qendra Tregtare Alba Mall", pershkrimi: "Punimet e strukturës së betonit dhe metalit për qendrën e re tregtare me sipërfaqe 12,000 m2.", klientiId: 2, clientName: "Albi Alba Group SH.P.K.", lokacioni: "Zona Industriale, Fushë Kosovë", buxheti: 4800000.00, dataFillimit: "2025-08-01", dataPerfundimit: "2026-09-30", statusi: "Ne Progres", progresiTotal: 40 },
    { id: 3, emertimi: "Kompleksi Banesor Rilindja", pershkrimi: "Ndërtimi i dy blloqeve banesore me 80 njësi banimi, parking nëntokësor dhe lokale afariste në katin përdhes.", klientiId: 4, clientName: "Valon Krasniqi Construction", lokacioni: "Lagjja e Spitalit, Prishtinë", buxheti: 3200000.00, dataFillimit: "2026-03-01", dataPerfundimit: "2027-05-15", statusi: "Ne Progres", progresiTotal: 15 },
    { id: 4, emertimi: "Vila Individuale Gërmia", pershkrimi: "Rikonstruksion i viles private pranë parkut kombëtar të Gërmisë me teknologji të fundit efiçiente.", klientiId: 1, clientName: "Arben Limani", lokacioni: "Rruga e Gërmisë, Prishtinë", buxheti: 350000.00, dataFillimit: "2025-09-01", dataPerfundimit: "2026-02-15", statusi: "I Perfunduar", progresiTotal: 100 }
  ],
  workers: [
    { id: 1, emri: "Fidan", mbiemri: "Gashi", email: "fidan.gashi@ndertimi.com", telefoni: "+383 44 777 888", profesioni: "Inxhinier Ndërtimi", pagaDitore: 45.00, dataPunesimit: "2022-04-01", statusi: "Aktiv" },
    { id: 2, emri: "Blerim", mbiemri: "Hoti", email: "blerim.hoti@ndertimi.com", telefoni: "+383 49 888 999", profesioni: "Mjeshtër Armature", pagaDitore: 30.00, dataPunesimit: "2023-02-15", statusi: "Aktiv" },
    { id: 3, emri: "Fatmir", mbiemri: "Morina", email: "fatmir.morina@ndertimi.com", telefoni: "+383 45 123 456", profesioni: "Mjeshtër Zidari", pagaDitore: 28.00, dataPunesimit: "2024-01-10", statusi: "Aktiv" },
    { id: 4, emri: "Ardit", mbiemri: "Shala", email: "ardit.shala@ndertimi.com", telefoni: "+383 44 987 654", profesioni: "Instalues Elektrik", pagaDitore: 25.00, dataPunesimit: "2024-05-20", statusi: "Aktiv" },
    { id: 5, emri: "Ilir", mbiemri: "Peci", email: "ilir.peci@ndertimi.com", telefoni: "+383 49 654 321", profesioni: "Arkitekt", pagaDitore: 50.00, dataPunesimit: "2021-09-01", statusi: "Pushim" }
  ],
  projectPhases: [
    { id: 1, projektiId: 1, projectName: "Rezidenti Elite Marigona", emertimi: "Gërmimi dhe Themelet", pershkrimi: "Hapja e gropave dhe hedhja e betonit për themelet e 15 vilave.", rendi: 1, dataFillimit: "2026-01-10", dataPerfundimit: "2026-03-15", statusi: "E perfunduar", perqindjaKompletimit: 100 },
    { id: 2, projektiId: 1, projectName: "Rezidenti Elite Marigona", emertimi: "Struktura e Karabinës", pershkrimi: "Ndërtimi i mureve mbajtëse, kolonave dhe pllakave të katit të parë dhe të dytë.", rendi: 2, dataFillimit: "2026-03-16", dataPerfundimit: "2026-07-30", statusi: "Ne Progres", perqindjaKompletimit: 60 },
    { id: 3, projektiId: 1, projectName: "Rezidenti Elite Marigona", emertimi: "Instalimet dhe Suvatimi", pershkrimi: "Instalimet elektrike, hidraulike, ngrohja qendrore dhe suvatimi i brendshëm.", rendi: 3, dataFillimit: "2026-08-01", dataPerfundimit: "2026-10-15", statusi: "E paplanifikuar", perqindjaKompletimit: 0 },
    { id: 4, projektiId: 2, projectName: "Qendra Tregtare Alba Mall", emertimi: "Struktura Bazë e Çelikut", pershkrimi: "Montimi i shtyllave të çelikut dhe strukturës mbajtëse të çatisë.", rendi: 1, dataFillimit: "2025-08-01", dataPerfundimit: "2025-11-20", statusi: "E perfunduar", perqindjaKompletimit: 100 },
    { id: 5, projektiId: 2, projectName: "Qendra Tregtare Alba Mall", emertimi: "Guxhimi dhe Muret e Jashtme", pershkrimi: "Vendosja e paneleve sanduiç dhe fasadës së qelqit.", rendi: 2, dataFillimit: "2025-11-21", dataPerfundimit: "2026-04-30", statusi: "Ne Progres", perqindjaKompletimit: 75 }
  ],
  tasks: [
    { id: 1, fazaId: 2, phaseName: "Struktura e Karabinës", emertimi: "Armimi i kolonave të vilave 1-5", pershkrimi: "Lidhja e hekurit sipas specifikave inxhinierike të projektit statik.", prioriteti: "I larte", dataFillimit: "2026-03-20", dataPerfundimit: "2026-04-10", statusi: "E perfunduar" },
    { id: 2, fazaId: 2, phaseName: "Struktura e Karabinës", emertimi: "Betonimi i pllakës së parë", pershkrimi: "Mbushja me beton e pllakave të vilave 1-5 duke përdorur pompën statike.", prioriteti: "I larte", dataFillimit: "2026-04-11", dataPerfundimit: "2026-04-30", statusi: "E perfunduar" },
    { id: 3, fazaId: 2, phaseName: "Struktura e Karabinës", emertimi: "Zidimi i mureve të jashtme vilat 6-10", pershkrimi: "Vendosja e bllokut termo-izolues Ytong sipas standardit.", prioriteti: "Mesatar", dataFillimit: "2026-05-01", dataPerfundimit: "2026-06-15", statusi: "Ne Progres" }
  ],
  taskAssignments: [
    { id: 1, detyraId: 3, taskName: "Zidimi i mureve të jashtme vilat 6-10", punetoriId: 3, workerName: "Fatmir Morina", dataCaktimit: "2026-05-01", oretPunuara: 96 },
    { id: 2, detyraId: 3, taskName: "Zidimi i mureve të jashtme vilat 6-10", punetoriId: 2, workerName: "Blerim Hoti", dataCaktimit: "2026-05-01", oretPunuara: 80 }
  ],
  suppliers: [
    { id: 1, emertimi: "Sharrcem", kontakti: "Ramadan Hoda", email: "info@sharrcem.com", telefoni: "+383 290 310 10", adresa: "Hani i Elezit, Kosovë", specialiteti: "Çimento dhe Llaç" },
    { id: 2, emertimi: "Kastrioti Steel SH.P.K.", kontakti: "Luan Kastrati", email: "sales@kastra-steel.com", telefoni: "+383 44 500 600", adresa: "Magjistralja Prishtinë-Ferizaj", specialiteti: "Hekur Ndërtimi dhe Profila" },
    { id: 3, emertimi: "Graniti Depo", kontakti: "Faton Rrustemi", email: "contact@granitidepo.com", telefoni: "+383 49 100 200", adresa: "Llapnasellë, Graçanicë", specialiteti: "Qeramikë dhe Sanitarí" }
  ],
  materials: [
    { id: 1, emertimi: "Çimento Sharrcem Profi 42.5", njesiaMatese: "Thes 25kg", cmimiNjesi: 4.80, furnitoriId: 1, supplierName: "Sharrcem", sasiaStokut: 350, kategoria: "Çimento" },
    { id: 2, emertimi: "Hekur Armature FI 12", njesiaMatese: "Ton", cmimiNjesi: 750.00, furnitoriId: 2, supplierName: "Kastrioti Steel SH.P.K.", sasiaStokut: 8.5, kategoria: "Metale" },
    { id: 3, emertimi: "Blloqe Ndërtimi Ytong 20cm", njesiaMatese: "Cope", cmimiNjesi: 1.65, furnitoriId: 3, supplierName: "Graniti Depo", sasiaStokut: 1200, kategoria: "Zidari" },
    { id: 4, emertimi: "Beton i Gatshëm MB 30", njesiaMatese: "m3", cmimiNjesi: 65.00, furnitoriId: 1, supplierName: "Sharrcem", sasiaStokut: 15, kategoria: "Çimento" } // Alert: Low stock threshold is <= 20!
  ],
  materialUsages: [
    { id: 1, projektiId: 1, projectName: "Rezidenti Elite Marigona", materialiId: 4, materialName: "Beton i Gatshëm MB 30", fazaId: 1, phaseName: "Gërmimi dhe Themelet", sasia: 120, dataPerdorimit: "2026-02-10" },
    { id: 2, projektiId: 1, projectName: "Rezidenti Elite Marigona", materialiId: 2, materialName: "Hekur Armature FI 12", fazaId: 2, phaseName: "Struktura e Karabinës", sasia: 3.5, dataPerdorimit: "2026-03-25" }
  ],
  equipment: [
    { id: 1, emertimi: "Eskavator Caterpillar 320D", lloji: "Makineri e Rëndë", statusi: "Ne Pune", kostojaDitore: 180.00, dataBlerjes: "2021-05-12" },
    { id: 2, emertimi: "Garrua Kamion MAN 26t", lloji: "Transport", statusi: "I Lire", kostojaDitore: 90.00, dataBlerjes: "2020-09-18" },
    { id: 3, emertimi: "Mixer Betoni Liebherr", lloji: "Betonim", statusi: "Mirembajtje", kostojaDitore: 110.00, dataBlerjes: "2022-11-05" }
  ],
  invoices: [
    { id: 1, projektiId: 1, projectName: "Rezidenti Elite Marigona", klientiId: 3, clientName: "Eliza Halili", shuma: 150000.00, pershkrimi: "Kësti i parë i pagesës pas përfundimit të fazës së themeleve.", dataFatures: "2026-03-15", dataPageses: "2026-03-20", statusi: "E paguar" },
    { id: 2, projektiId: 1, projectName: "Rezidenti Elite Marigona", klientiId: 3, clientName: "Eliza Halili", shuma: 300000.00, pershkrimi: "Kësti i dytë i pagesës për punimet e karabinës.", dataFatures: "2026-05-15", dataPageses: null, statusi: "E papaguar" },
    { id: 3, projektiId: 2, projectName: "Qendra Tregtare Alba Mall", klientiId: 2, clientName: "Albi Alba Group SH.P.K.", shuma: 450000.00, pershkrimi: "Pagesa e situacionit financiar nr. 3 - çeliku.", dataFatures: "2026-04-30", dataPageses: null, statusi: "E vonuar" }
  ]
};

// Initialize DB in LocalStorage
export const initLocalDatabase = () => {
  if (!localStorage.getItem('ndertimi_local_db')) {
    localStorage.setItem('ndertimi_local_db', JSON.stringify(SEED_DATA));
  }
}

const getDB = () => {
  initLocalDatabase();
  return JSON.parse(localStorage.getItem('ndertimi_local_db'));
}

const saveDB = (db) => {
  localStorage.setItem('ndertimi_local_db', JSON.stringify(db));
}

// Global CRUD Helpers for Mock API layer
export const mockApi = {
  get: (resource, params = {}) => {
    const db = getDB();
    let data = db[resource] || [];

    // Search filter
    if (params.search) {
      const s = params.search.toLowerCase();
      data = data.filter(item => {
        return Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(s)
        );
      });
    }

    // Status filter
    if (params.status) {
      data = data.filter(item => item.statusi === params.status || item.status === params.status);
    }

    // Custom Category or Project filters
    if (params.projektiId) {
      data = data.filter(item => item.projektiId === parseInt(params.projektiId));
    }
    if (params.klientiId) {
      data = data.filter(item => item.klientiId === parseInt(params.klientiId));
    }

    // Sorting
    if (params.sortBy) {
      const key = params.sortBy;
      const isDesc = params.sortOrder === 'desc';
      data.sort((a, b) => {
        let valA = a[key] || '';
        let valB = b[key] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Pagination
    const page = parseInt(params.pageNumber) || 1;
    const size = parseInt(params.pageSize) || 10;
    const totalCount = data.length;
    const items = data.slice((page - 1) * size, page * size);

    return Promise.resolve({
      data: {
        totalCount,
        pageNumber: page,
        pageSize: size,
        items
      }
    });
  },

  getById: (resource, id) => {
    const db = getDB();
    const item = (db[resource] || []).find(x => x.id === parseInt(id));
    if (!item) return Promise.reject({ response: { data: { message: "Nuk u gjet." } } });
    return Promise.resolve({ data: item });
  },

  post: (resource, payload) => {
    const db = getDB();
    const items = db[resource] || [];
    
    // Generate new ID
    const newId = items.length > 0 ? Math.max(...items.map(x => x.id)) + 1 : 1;
    const newItem = { id: newId, ...payload };

    // Custom business logic triggers: Auto-deduct inventory stoku
    if (resource === 'materialUsages') {
      const materials = db.materials || [];
      const mat = materials.find(m => m.id === parseInt(payload.materialiId));
      if (mat) {
        if (mat.sasiaStokut < payload.sasia) {
          return Promise.reject({ response: { data: { message: `Sasi e pamjaftueshme në stok. Stoku aktual: ${mat.sasiaStokut} ${mat.njesiaMatese}.` } } });
        }
        mat.sasiaStokut = parseFloat((mat.sasiaStokut - payload.sasia).toFixed(2));
      }
      // Attach names for joins
      const projects = db.projects || [];
      const phases = db.projectPhases || [];
      newItem.projectName = projects.find(p => p.id === parseInt(payload.projektiId))?.emertimi || '';
      newItem.materialName = mat?.emertimi || '';
      newItem.phaseName = phases.find(ph => ph.id === parseInt(payload.fazaId))?.emertimi || '';
    }

    // Connect display name triggers for visual aesthetics in UI
    if (resource === 'projects') {
      const clients = db.clients || [];
      const c = clients.find(cl => cl.id === parseInt(payload.klientiId));
      newItem.clientName = c ? `${c.emri} ${c.mbiemriKompania}` : '';
    }
    if (resource === 'projectPhases') {
      const projects = db.projects || [];
      newItem.projectName = projects.find(p => p.id === parseInt(payload.projektiId))?.emertimi || '';
    }
    if (resource === 'tasks') {
      const phases = db.projectPhases || [];
      newItem.phaseName = phases.find(p => p.id === parseInt(payload.fazaId))?.emertimi || '';
    }
    if (resource === 'taskAssignments') {
      const tasks = db.tasks || [];
      const workers = db.workers || [];
      newItem.taskName = tasks.find(t => t.id === parseInt(payload.detyraId))?.emertimi || '';
      const w = workers.find(work => work.id === parseInt(payload.punetoriId));
      newItem.workerName = w ? `${w.emri} ${w.mbiemri}` : '';
    }
    if (resource === 'materials') {
      const suppliers = db.suppliers || [];
      newItem.supplierName = suppliers.find(s => s.id === parseInt(payload.furnitoriId))?.emertimi || '';
    }
    if (resource === 'invoices') {
      const projects = db.projects || [];
      const clients = db.clients || [];
      newItem.projectName = projects.find(p => p.id === parseInt(payload.projektiId))?.emertimi || '';
      const c = clients.find(cl => cl.id === parseInt(payload.klientiId));
      newItem.clientName = c ? `${c.emri} ${c.mbiemriKompania}` : '';
    }

    items.push(newItem);
    db[resource] = items;
    saveDB(db);

    return Promise.resolve({ data: newItem });
  },

  put: (resource, id, payload) => {
    const db = getDB();
    const items = db[resource] || [];
    const idx = items.findIndex(x => x.id === parseInt(id));
    if (idx === -1) return Promise.reject({ response: { data: { message: "Nuk u gjet." } } });

    const original = items[idx];
    const updatedItem = { ...original, ...payload };

    // Resolve name binds
    if (resource === 'projects') {
      const clients = db.clients || [];
      const c = clients.find(cl => cl.id === parseInt(payload.klientiId));
      updatedItem.clientName = c ? `${c.emri} ${c.mbiemriKompania}` : '';
    }
    if (resource === 'projectPhases') {
      const projects = db.projects || [];
      updatedItem.projectName = projects.find(p => p.id === parseInt(payload.projektiId))?.emertimi || '';
    }
    if (resource === 'tasks') {
      const phases = db.projectPhases || [];
      updatedItem.phaseName = phases.find(p => p.id === parseInt(payload.fazaId))?.emertimi || '';
    }
    if (resource === 'taskAssignments') {
      const tasks = db.tasks || [];
      const workers = db.workers || [];
      updatedItem.taskName = tasks.find(t => t.id === parseInt(payload.detyraId))?.emertimi || '';
      const w = workers.find(work => work.id === parseInt(payload.punetoriId));
      updatedItem.workerName = w ? `${w.emri} ${w.mbiemri}` : '';
    }
    if (resource === 'materials') {
      const suppliers = db.suppliers || [];
      updatedItem.supplierName = suppliers.find(s => s.id === parseInt(payload.furnitoriId))?.emertimi || '';
    }
    if (resource === 'invoices') {
      const projects = db.projects || [];
      const clients = db.clients || [];
      updatedItem.projectName = projects.find(p => p.id === parseInt(payload.projektiId))?.emertimi || '';
      const c = clients.find(cl => cl.id === parseInt(payload.klientiId));
      updatedItem.clientName = c ? `${c.emri} ${c.mbiemriKompania}` : '';
    }

    items[idx] = updatedItem;
    db[resource] = items;
    saveDB(db);

    return Promise.resolve({ data: updatedItem });
  },

  delete: (resource, id) => {
    const db = getDB();
    const items = db[resource] || [];
    const idx = items.findIndex(x => x.id === parseInt(id));
    if (idx === -1) return Promise.reject({ response: { data: { message: "Nuk u gjet." } } });

    // Custom cleanup overrides: restore stok quantities if deleting a usage
    if (resource === 'materialUsages') {
      const usage = items[idx];
      const materials = db.materials || [];
      const mat = materials.find(m => m.id === usage.materialiId);
      if (mat) {
        mat.sasiaStokut = parseFloat((mat.sasiaStokut + usage.sasia).toFixed(2));
      }
    }

    items.splice(idx, 1);
    db[resource] = items;
    saveDB(db);

    return Promise.resolve({ data: { message: "Fshirja u krye me sukses." } });
  }
};
