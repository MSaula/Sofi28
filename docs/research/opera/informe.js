(() => {
  const data = JSON.parse(document.querySelector('#photo-data').textContent);
  const cards = [...document.querySelectorAll('.photo-card')];
  const labels = {ballet:'Living Legacies',vistas:'Vistas de asientos',palcos:'Palcos',auditorio:'Auditorio',interiores:'Salones y acceso',exteriores:'Exteriores',backstage:'Backstage'};
  const norm = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let category = 'all', current = '', opener;
  const search = document.querySelector('#search');
  const visible = () => cards.filter(c => !c.hidden).map(c => data.find(p => p.id === c.dataset.id));
  const available = () => visible().filter(p => p.localFile);
  function filter() {
    const query = norm(search.value.trim());
    for (const card of cards) {
      const photo = data.find(p => p.id === card.dataset.id);
      card.hidden = (category !== 'all' && photo.category !== category) || !norm([photo.id, photo.title, photo.description, photo.piece || '', photo.author].join(' ')).includes(query);
    }
    const list = visible(), local = list.filter(p => p.localFile).length;
    document.querySelector('#result-count').textContent = `${list.length} registros · ${local} fotografías locales${list.length > local ? ' · ' + (list.length-local) + ' vistas enlazadas pendientes' : ''}`;
    document.querySelector('#empty').hidden = list.length !== 0;
  }
  search.addEventListener('input', filter);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', b === button));
    filter();
  }));
  filter();
  const dialog = document.querySelector('#viewer');
  function show(id) {
    const photo = data.find(p => p.id === id);
    if (!photo?.localFile) return;
    current = id;
    const byId = id => document.getElementById(id);
    byId('viewer-image').src = photo.localFile;
    byId('viewer-image').alt = photo.description;
    byId('viewer-title').textContent = photo.title;
    byId('viewer-id').textContent = photo.id + ' / ARCHIVO VISUAL';
    byId('viewer-category').textContent = labels[photo.category];
    byId('viewer-description').textContent = photo.description;
    byId('viewer-meta').textContent = `${photo.width} × ${photo.height} px · ${(photo.bytes/1e6).toFixed(2)} MB · ${photo.author}`;
    byId('viewer-rights').textContent = `${photo.license}. ${photo.rightsNote}`;
    byId('viewer-source').href = photo.sourcePage;
    byId('viewer-original').href = photo.originalUrl;
    byId('viewer-file').href = photo.localFile;
    let list = available();
    if (!list.some(p => p.id === id)) list = data.filter(p => p.localFile);
    byId('viewer-count').textContent = `${list.findIndex(p => p.id === id)+1} / ${list.length}`;
    byId('viewer-prev').disabled = byId('viewer-next').disabled = list.length < 2;
  }
  function next(direction) {
    let list = available();
    if (!list.some(p => p.id === current)) list = data.filter(p => p.localFile);
    show(list[(list.findIndex(p => p.id === current)+direction+list.length)%list.length].id);
  }
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    opener = button; show(button.dataset.photo); dialog.showModal();
  }));
  document.querySelector('#viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
  dialog.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); next(event.key==='ArrowLeft'?-1:1); }
  });
  document.querySelector('#viewer-prev').addEventListener('click', () => next(-1));
  document.querySelector('#viewer-next').addEventListener('click', () => next(1));
  const floors = [
    ['Planta baja / Ground Floor','Parterre, foso, escenario, Stehparterre, taquillas y servicios de acceso. El plano muestra funciones y recorridos de orientación, no un levantamiento de medidas.'],
    ['Palcos de parterre / Parterre Box Tier','Palcos junto al nivel inferior de la sala y foyer de descanso. Esta nomenclatura de la web oficial no identifica por sí sola la cota de la Mittelloge.'],
    ['Primer nivel de palcos / Box Tier 1','Palcos, Gustav Mahler Saal, Marmorsaal, Schwindfoyer, Schwindloggia y Teesalon. Diferentes espacios y condiciones de acceso: ver la información de cada sala.'],
    ['Segundo nivel de palcos / Box Tier 2','Otra planta de palcos alrededor de la sala. La superposición de niveles permite comprender la organización en herradura.'],
    ['Balcón / Balcony','Asientos y localidades de pie; guardarropa y salas de retransmisión para quienes llegan tarde. La información oficial indica 293 asientos y 92 plazas de pie en este nivel.'],
    ['Galería / Gallery','El nivel alto de la sala, con una visión más inclinada hacia el escenario. La ficha del edificio publica 342 asientos y 210 localidades de pie en sus áreas.'],
    ['Galería superior / Upper Gallery','Zona superior de descanso y buffet según el plano oficial. No debe confundirse con la ubicación de las entradas de Mittelloge.']
  ];
  document.querySelectorAll('[data-floor]').forEach(button => button.addEventListener('click', () => {
    const index=Number(button.dataset.floor), img=document.querySelector('#floor-plan');
    img.src=`planos/planta-${index}.svg`; img.alt='Plano oficial: '+floors[index][0];
    document.querySelector('#floor-title').textContent=floors[index][0];
    document.querySelector('#floor-description').textContent=floors[index][1];
    document.querySelectorAll('[data-floor]').forEach(b => b.setAttribute('aria-pressed',b===button));
  }));
  for(const [id,detail] of [['seat-detail',true],['seat-overview',false]]) {
    document.getElementById(id).addEventListener('click',()=>{
      const image=document.querySelector('#seat-plan');image.src=detail?'planos/mittelloge-marcada.svg':'planos/sala-marcada.svg';
      image.closest('figure').classList.toggle('overview',!detail);
      document.querySelector('#seat-detail').setAttribute('aria-pressed',detail);
      document.querySelector('#seat-overview').setAttribute('aria-pressed',!detail);
    });
  }
})();
