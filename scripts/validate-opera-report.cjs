/* Validate the independent dossier with local files served by interception. */
const {chromium}=require('playwright');
const {AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const work='/workspace/artifacts/opera-research';
const report=path.join(work,'report');
const out=process.env.QA_OUT||path.join(work,'validation');fs.mkdirSync(out,{recursive:true});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const catalog=JSON.parse(fs.readFileSync(path.join(report,'indice-imagenes.json')));
const evidence=JSON.parse(fs.readFileSync(path.join(report,'evidencia-asientos.json')));
const local=catalog.images.filter(p=>p.localFile);
const pending=catalog.images.filter(p=>!p.localFile);
assert.equal(local.length,45);assert.equal(pending.length,2);
assert.equal(local.filter(p=>p.category==='ballet').length,11);
assert.equal(new Set(local.map(p=>p.sha256)).size,45);
for(const p of local){const bytes=fs.readFileSync(path.join(report,p.localFile));assert.equal(hash(bytes),p.sha256);assert.equal(bytes.length,p.bytes);assert.ok(p.width>=1000&&p.height>=1000);}
assert.ok(local.filter(p=>p.category==='ballet').every(p=>Math.max(p.width,p.height)>=2500));
assert.deepEqual(evidence.rows,{'1':9,'2':10,'3':9,'4':8});
assert.deepEqual(evidence.selectedSeats.map(s=>[s.id,s.row,s.seatNumber,s.priceCategoryId]),[['s500','3','23','p3'],['s501','3','24','p3']]);
assert.equal(hash(fs.readFileSync(path.join(report,'planos/Saalplan-2026_27-DE.pdf'))),evidence.pdfSha256);
const reconstruction=JSON.parse(fs.readFileSync(path.join(report,'reconstruccion-butacas.json')));
assert.equal(reconstruction.seats.length,1753);assert.equal(new Set(reconstruction.seats.map(s=>s.id)).size,1753);
assert.equal(reconstruction.sourceAndPerformanceVersionsMatch,true);
const bounds=reconstruction.annotationBounds;
assert.equal(reconstruction.seats.filter(s=>s.x>bounds.x-25&&s.x<bounds.x+bounds.width+25&&s.y>bounds.y-25&&s.y<bounds.y+bounds.height+25).length,0);
assert.equal(reconstruction.seats.filter(s=>s.blockId===489).length,36);
for(const s of reconstruction.seats){assert.equal(s.x,8192-s.sourceX);assert.equal(s.y,8192-s.sourceY);}
assert.deepEqual(reconstruction.selectedSeatNumbers,{'s500':{row:'3',seat:'23'},'s501':{row:'3',seat:'24'}});
const mapSvg=fs.readFileSync(path.join(report,'planos/mapa-completo-reconstruido.svg'),'utf8');
assert.equal((mapSvg.match(/data-seat-id=/g)||[]).length,1753);assert.equal((mapSvg.match(/class="seat-selected"/g)||[]).length,2);
for(const id of ['s500','s501']){const s=reconstruction.seats.find(s=>s.id===id);assert.ok(mapSvg.includes(`data-seat-id="${id}" data-block-id="489" cx="${s.x}" cy="${s.y}"`));}
const sameBox=local.find(p=>p.id==='OP47');assert.equal(sameBox.evidence,'same-box-source-confirmed');assert.equal(sameBox.exactSeatConfirmed,false);assert.equal(sameBox.row,null);assert.equal(sameBox.seatNumber,null);assert.deepEqual([sameBox.width,sameBox.height],[5300,3520]);
const baseline=JSON.parse(fs.readFileSync(path.join(work,'baseline.json')));
for(const group of ['src','public'])for(const [file,sha] of Object.entries(baseline[group]))assert.equal(hash(fs.readFileSync(path.join(root,file))),sha,file);
assert.equal(hash(fs.readFileSync(path.join(root,'downloads/Viena.zip'))),baseline.giftZipSha256);

let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const results={browser:browser.version(),revision:2,offlineValidation:'Local file bytes fulfilled at an intercepted localhost origin; no real HTTP traffic. Direct file navigation is blocked by managed browser policy.',directFileNavigationVerified:false,mainWebsitePreserved:true,photosVerified:45,linkedViews:2,reconstructedPositions:1753,sameBoxPhotoVerified:true,exactSeatPhotoAvailable:false,modes:[]};
 const modes=[['desktop',1440,1000,false],['laptop',1280,800,false],['mobile',390,844,false],['narrow',320,700,false],['reduced',1440,1000,true]];
 for(const [name,width,height,reduced] of modes){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();const errors=[],http=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='http://127.0.0.1:4777'){http.push(url.href);return route.abort();}
   const file=path.resolve(report,'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(report+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
   const types={'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.csv':'text/csv','.pdf':'application/pdf'};
   return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  await page.goto('http://127.0.0.1:4777/Informe-Opera-Viena.html',{waitUntil:'load'});
  await page.locator('.cover img').evaluate(i=>i.decode());
  assert.equal(await page.locator('.photo-card').count(),47);
  assert.equal(await page.locator('.photo-card .image-button').count(),45);
  assert.equal(await page.locator('.pending-visual').count(),2);
  const badLocalLinks=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')).filter(h=>h&&!/^(https?:|#|mailto:)/.test(h)));
  for(const link of badLocalLinks)assert.ok(fs.existsSync(path.join(report,decodeURI(link))),link);
  await page.screenshot({path:path.join(out,`${name}-cover.png`)});
  const filters=page.locator('[data-filter]');
  for(const category of ['ballet','interiores','exteriores','palcos','auditorio','backstage','vistas']){
   await page.locator(`[data-filter="${category}"]`).click();
   assert.equal(await page.locator('.photo-card:visible').count(),catalog.images.filter(p=>p.category===category).length);
  }
  await page.locator('[data-filter="all"]').click();
  await page.locator('#search').fill('rhapsody');assert.equal(await page.locator('.photo-card:visible').count(),4);
  await page.locator('#search').fill('SCHWIND');assert.equal(await page.locator('.photo-card:visible').count(),5);
  await page.locator('#search').fill('xyz-no-result');assert.ok(await page.locator('#empty').isVisible());
  await page.locator('#search').fill('');assert.equal(await page.locator('.photo-card:visible').count(),47);
  await page.locator('[data-id="OP01"] [data-photo]').click();
  assert.ok(await page.locator('#viewer').isVisible());
  await page.locator('#viewer-image').evaluate(i=>i.decode());
  await page.keyboard.press('ArrowRight');assert.ok((await page.locator('#viewer-id').innerText()).startsWith('OP02'));
  await page.screenshot({path:path.join(out,`${name}-viewer.png`)});
  await page.keyboard.press('Escape');assert.equal(await page.locator('[data-id="OP01"] [data-photo]').evaluate(n=>document.activeElement===n),true);
  const imageIds=name==='desktop'?local.map(p=>p.id):['OP12','OP25','OP35','OP42','OP47'];
  for(const id of imageIds){
   await page.locator(`[data-id="${id}"] [data-photo]`).click();
   const dimensions=await page.locator('#viewer-image').evaluate(async img=>{await img.decode();return [img.naturalWidth,img.naturalHeight]});
   const photo=local.find(p=>p.id===id);assert.deepEqual(dimensions,[photo.width,photo.height]);await page.keyboard.press('Escape');
  }
  await page.locator('[data-id="OP25"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${name}-archive.png`)});
  for(let floor=0;floor<7;floor++){
   await page.locator(`[data-floor="${floor}"]`).click();
   const dims=await page.locator('#floor-plan').evaluate(async i=>{await i.decode();return [i.naturalWidth,i.naturalHeight]});assert.ok(dims[0]>1000&&dims[1]>700);
  }
  await page.locator('[data-floor="2"]').click();await page.locator('.building-view').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${name}-building.png`)});
  for(const selector of ['#global-seat-plan','#seat-detail-plan']){await page.locator(selector).evaluate(i=>i.decode());assert.ok(await page.locator(selector).isVisible());}
  await page.locator('.global-seating-layout').screenshot({path:path.join(out,`${name}-seats.png`)});
  await page.locator('.official-seat-plan summary').click();await page.locator('#seat-plan').evaluate(i=>i.decode());assert.ok((await page.locator('#seat-plan').getAttribute('src')).endsWith('sala-marcada.svg'));
  await page.locator('.official-seat-plan summary').click();
  await page.locator('.same-box-photo').screenshot({path:path.join(out,`${name}-same-box-photo.png`)});
  await page.locator('.same-box-photo [data-photo="OP47"]').click();await page.locator('#viewer-image').evaluate(i=>i.decode());
  assert.match(await page.locator('#viewer-description').innerText(),/fila y el asiento.*no están documentados/);
  await page.screenshot({path:path.join(out,`${name}-same-box-viewer.png`)});await page.keyboard.press('Escape');
  const overflow=[];
  for(const section of ['inicio','resumen','edificio','asientos','ballet','visita','archivo','fuentes']){
   await page.locator('#'+section).evaluate(n=>n.scrollIntoView());
   const size=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);if(size[0]>size[1]+1)overflow.push({section,size});
  }
  assert.deepEqual(overflow,[]);assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  fs.writeFileSync(path.join(out,`${name}-axe.json`),JSON.stringify(axe.violations,null,2));
  const serious=axe.violations.filter(v=>['serious','critical'].includes(v.impact));assert.deepEqual(serious.map(v=>({id:v.id,nodes:v.nodes.length})),[]);
  if(name==='desktop'){
   await page.locator('[data-id="OP02"] [data-photo]').click();
   const modalAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   fs.writeFileSync(path.join(out,'viewer-axe.json'),JSON.stringify(modalAxe.violations,null,2));
   assert.deepEqual(modalAxe.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id),[]);await page.keyboard.press('Escape');
  }
  results.modes.push({name,width,height,reduced,errors,httpRequests:http.length,overflow,localViewerImagesChecked:imageIds.length,floorPlansChecked:7,seatPlansChecked:3,globalMapAndInsetVisibleTogether:true,sameBoxPhotoOpened:true,seriousCriticalAxe:serious.length});
  fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(results,null,2));
  console.log(`${name}: offline, images, filters, viewer, plans, keyboard and accessibility passed`);await context.close();
 }
 await browser.close();console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>browser?.close());
