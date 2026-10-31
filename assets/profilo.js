/* profilo.unlikeacademy.it · sblocchi per data, esercizi, telefono che si riempie, riepilogo
   Tutto resta nel localStorage di questo browser (chiave profilo-v1)
   Prove: ?oggi=2026-11-20 simula una data · ?anteprima=tutti apre tutti i pezzi */
(function(){
  var PZ = window.PEZZI || [];
  var K = 'profilo-v1';
  var q = new URLSearchParams(location.search);
  var ORA = q.get('oggi') ? new Date(q.get('oggi') + 'T12:00:00Z') : new Date();
  var TUTTI = q.get('anteprima') === 'tutti';
  var GIORNO = 86400000;
  var REELS = 'https://www.instagram.com/gemmalenoci/reels/';
  var TIKTOK = 'https://www.tiktok.com/@gemmalenoci';

  var S = {fatti: {}, c: {}};
  try { var x = JSON.parse(localStorage.getItem(K) || 'null'); if (x && x.c) S = x; } catch (e) {}
  if (!S.fatti) S.fatti = {};
  function salva(){ try { localStorage.setItem(K, JSON.stringify(S)); } catch (e) {} }
  function io(){ try { return JSON.parse(localStorage.getItem('profilo-io') || '{}') || {}; } catch (e) { return {}; } }
  function v(k){ var x = S.c[k]; return (x == null ? '' : String(x)).trim(); }
  function arr(k){ return Array.isArray(S.c[k]) ? S.c[k] : []; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* date: si sblocca alle 7 ora italiana (6 UTC, ora solare) */
  function quando(p){ var a = p.data.split('-'); return Date.UTC(+a[0], a[1] - 1, +a[2], 6, 0); }
  function aperto(p){ return TUTTI || ORA.getTime() >= quando(p); }
  function giorno(p){ var a = p.data.split('-'); return new Date(Date.UTC(+a[0], a[1] - 1, +a[2], 12)).toLocaleDateString('it-IT', {weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome'}); }
  function tra(p){
    var d = quando(p) - ORA.getTime();
    if (d <= 0) return 'adesso';
    var g = Math.ceil(d / GIORNO);
    if (d < GIORNO) return 'tra ' + Math.max(1, Math.round(d / 3600000)) + (Math.round(d / 3600000) === 1 ? ' ora' : ' ore');
    return g === 1 ? 'domani' : 'tra ' + g + ' giorni';
  }
  function nuovo(p){ return aperto(p) && !S.fatti[p.n] && ORA.getTime() - quando(p) < 7 * GIORNO; }

  var toastT;
  function toast(t){ var el = $('#toast'); el.textContent = t; el.classList.add('su'); clearTimeout(toastT); toastT = setTimeout(function(){ el.classList.remove('su'); }, 2600); }
  function copia(t, msg){
    function ok(){ toast(msg || 'Copiato'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, vecchio); else vecchio();
    function vecchio(){ var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Non riesco a copiare, seleziona il testo a mano'); } a.remove(); }
  }

  /* testi composti, usati da anteprime, telefono e riepilogo */
  var T = {
    bio: function(){ return [v('bio1'), v('bio2'), v('bio3')].filter(Boolean).join('\n'); },
    nome: function(){ var n = v('n_nome'), p = v('n_parole'); return n && p ? n + ' · ' + p : (n || p); },
    mosse: function(){
      var m = arr('mosse').filter(function(x){ return x && (x.t || x.si || x.no); });
      if (!m.length) return '';
      var out = ['Slide 1 · ' + (v('m_titolo') || 'Qual è la tua prossima mossa?')];
      m.forEach(function(x, i){
        out.push('Slide ' + (i + 2) + ' · Mossa ' + (i + 1) + ': ' + (x.t || '…') + (x.si ? '\n   Fa per te se: ' + x.si : '') + (x.no ? '\n   Non fa per te se: ' + x.no : ''));
      });
      out.push('Ultima slide · Qual è la tua prossima mossa? Scrivimi il numero in direct');
      return out.join('\n');
    },
    prove: function(){
      var c = arr('casi').filter(function(x){ return x && (x.chi || x.prima || x.dopo || x.frase); });
      var n = +S.c.pv_n || 0;
      var out = [];
      if (n) out.push('Prove raccolte: ' + n);
      c.forEach(function(x, i){
        out.push('Caso ' + (i + 1) + (x.chi ? ' · ' + x.chi : '') + (x.prima ? '\n   Prima: ' + x.prima : '') + (x.dopo ? '\n   Dopo: ' + x.dopo : '') + (x.frase ? '\n   Con le sue parole: «' + x.frase + '»' : ''));
      });
      return out.join('\n');
    },
    evid: function(){
      var e = arr('ev'), t = S.c.evt || {};
      return e.map(function(x){ return x + (t[x] && t[x].trim() ? '\n   Prima storia: ' + t[x].trim() : ''); }).join('\n');
    },
    link: function(){ return [v('l_1'), v('l_2'), v('l_3')].filter(Boolean).map(function(x, i){ return (i + 1) + '. ' + x; }).join('\n'); },
    chisono: function(){
      var r = [['Da dove parto', 'cs_prima'], ['Cosa faccio oggi', 'cs_oggi'], ['Perché lo faccio', 'cs_perche'], ['Cosa trovi qui', 'cs_trovi'], ['Cosa non troverai mai', 'cs_no']];
      return r.filter(function(x){ return v(x[1]); }).map(function(x){ return x[0] + ': ' + v(x[1]); }).join('\n');
    },
    format: function(){
      if (!v('fo_nome') && !v('fo_promessa')) return '';
      return [v('fo_nome') ? 'Nome: ' + v('fo_nome') : '', v('fo_promessa') ? 'Promessa: ' + v('fo_promessa') : '', v('fo_apre') ? 'Apro sempre con: ' + v('fo_apre') : '', v('fo_chiude') ? 'Chiudo sempre con: ' + v('fo_chiude') : '', v('fo_giorno') ? 'Esce ogni ' + v('fo_giorno') : ''].filter(Boolean).join('\n');
    },
    parola: function(){
      if (!v('pa_parola') && !v('pa_nome')) return '';
      var fr = 'Se vuoi ' + (v('pa_nome') ? '«' + v('pa_nome') + '»' : 'la guida') + ', commenta ' + (v('pa_parola').toUpperCase() || 'PAROLA') + ' e te la mando in direct';
      return [v('pa_problema') ? 'Problema: ' + v('pa_problema') : '', v('pa_nome') ? 'Risorsa: ' + v('pa_nome') : '', v('pa_parola') ? 'Parola: ' + v('pa_parola').toUpperCase() : '', 'Fine del video: ' + fr].filter(Boolean).join('\n');
    },
    tasso: function(p){ var vis = +S.c[p + '_visite'], nu = +S.c[p + '_nuovi']; return vis > 0 && nu >= 0 && S.c[p + '_nuovi'] !== '' && S.c[p + '_nuovi'] != null ? (nu / vis * 100) : null; },
    bilancio: function(){
      var a = T.tasso('p'), b = T.tasso('b'), out = [];
      if (a != null) out.push('Tasso di conversione a ottobre: ' + a.toFixed(1).replace('.', ',') + '%');
      if (b != null) out.push('Tasso di conversione a dicembre: ' + b.toFixed(1).replace('.', ',') + '%');
      [['Cosa ha funzionato di più', 'b_q1'], ['Cosa tolgo nel 2027', 'b_q2'], ['Cosa rifaccio ogni settimana', 'b_q3']].forEach(function(x){ if (v(x[1])) out.push(x[0] + ': ' + v(x[1])); });
      return out.join('\n');
    }
  };

  /* campi */
  function campo(k, et, ph, tipo, extra){
    var val = esc(S.c[k] == null ? '' : S.c[k]);
    var id = 'f-' + k;
    var inp = tipo === 'area'
      ? '<textarea id="' + id + '" data-c="' + k + '" placeholder="' + esc(ph) + '" rows="2">' + val + '</textarea>'
      : '<input id="' + id + '" data-c="' + k + '" type="' + (tipo || 'text') + '" placeholder="' + esc(ph) + '" value="' + val + '"' + (tipo === 'number' ? ' inputmode="numeric" min="0"' : '') + (extra || '') + '>';
    return '<div class="campo"><label for="' + id + '">' + et + '</label>' + inp + '</div>';
  }
  function spunta(k, testo){ return '<label><input type="checkbox" data-c="' + k + '"' + (S.c[k] ? ' checked' : '') + '><span>' + testo + '</span></label>'; }
  function anteprima(id, et){ return '<div class="anteprima" data-ant="' + id + '"><span class="et">' + et + '</span><span data-txt></span></div>'; }

  var STRUMENTI = {
    bio: function(){
      return '<div class="tool">' +
        '<div class="calcolo"><b>Prima di cambiare qualcosa: i tuoi numeri di oggi</b> <i class="mini-nota">(facoltativo, ti servono per il bilancio del 30 dicembre)</i>' +
          '<p class="mini-nota" style="margin:4px 0 10px">Li trovi negli insight del tuo profilo, ultimi 30 giorni</p>' +
          '<div class="riga3">' + campo('p_follower', 'Follower oggi', 'es. 1250', 'number') + campo('p_visite', 'Visite al profilo', 'es. 900', 'number') + campo('p_nuovi', 'Nuovi follower', 'es. 40', 'number') + '</div>' +
          '<p data-tasso="p" style="margin-top:8px"></p></div>' +
        campo('bio1', '1 · Cosa ottiene chi ti sceglie <i>(il risultato, non il servizio)</i>', 'es. Trasformo competenze in clienti grazie ai social') +
        campo('bio2', '2 · Come lo fai a modo tuo <i>(quello che ti distingue)</i>', 'es. in modo autentico') +
        campo('bio3', '3 · Cosa fare adesso <i>(l\'invito, sempre nell\'ultima riga)</i>', 'es. Scrivimi PROFILO in direct') +
        anteprima('bio', 'La tua bio') + '<div class="conta" data-conta="bio"></div>' +
        '<div class="spunte">' + spunta('t1', 'L\'ho fatta leggere a qualcuno per 3 secondi') + spunta('t2', 'Ha capito cosa faccio') + spunta('t3', 'Ha capito cosa ci guadagna') + '</div>' +
        '<button class="copia" type="button" data-copia="bio">Copia la bio</button></div>';
    },
    nome: function(){
      return '<div class="tool">' +
        campo('n_ricerca', 'Prima trova le parole <i>(cosa compare se cerchi il tuo argomento nella lente)</i>', 'es. nutrizionista sportiva, nutrizionista per atleti', 'area') +
        '<div class="riga2">' + campo('n_nome', 'Come ti chiami <i>(o il nome del brand)</i>', 'es. Marta') + campo('n_parole', 'Le parole chiave', 'es. Nutrizionista per sportive') + '</div>' +
        anteprima('nome', 'Il tuo nome su Instagram') + '<div class="conta" data-conta="nome"></div>' +
        '<button class="copia" type="button" data-copia="nome">Copia il nome</button></div>';
    },
    mosse: function(){
      return '<div class="tool">' + campo('m_titolo', 'Il titolo del carosello', 'Qual è la tua prossima mossa?') +
        '<div class="tool" data-lista="mosse"></div>' +
        '<button class="piu" type="button" data-piu="mosse">+ Aggiungi una mossa</button>' +
        anteprima('mosse', 'Le slide del tuo primo fissato') +
        '<button class="copia" type="button" data-copia="mosse">Copia le slide</button></div>';
    },
    prove: function(){
      return '<div class="tool">' +
        '<div class="spunte">' + spunta('pv_wa', 'WhatsApp: cerca «grazie»') + spunta('pv_dm', 'Direct di Instagram: cerca «grazie»') + spunta('pv_mail', 'Mail dei clienti') + spunta('pv_rec', 'Recensioni Google') + spunta('pv_comm', 'Commenti sotto i tuoi post') + spunta('pv_voc', 'Vocali: trascrivi le frasi più belle') + '</div>' +
        '<div class="contatore"><button type="button" data-meno aria-label="Una prova in meno">−</button><output data-pv>0</output><button type="button" data-piu1 aria-label="Una prova in più">+</button><span>prove trovate</span></div>' +
        '<div class="anteprima"><span class="et">Il messaggio per chiedere il permesso</span><span data-perm>Ciao [nome], sto preparando un post con i risultati di chi ha lavorato con me, e il tuo messaggio mi ha fatto davvero piacere: posso usarlo? Se preferisci tolgo nome e foto, decidi tu</span></div>' +
        '<button class="copia" type="button" data-copia="perm">Copia il messaggio</button>' +
        '<div class="tool" data-lista="casi"></div>' +
        '<button class="piu" type="button" data-piu="casi">+ Aggiungi un caso</button>' +
        anteprima('prove', 'Le slide del tuo secondo fissato') +
        '<button class="copia" type="button" data-copia="prove">Copia i casi</button></div>';
    },
    evidenza: function(){
      var base = ['Inizia qui', 'Chi sono', 'Servizi', 'Recensioni', 'Risultati', 'Consigli', 'Come lavoro', 'Dietro le quinte', 'Domande frequenti'];
      arr('ev').forEach(function(x){ if (base.indexOf(x) < 0) base.push(x); });
      return '<div class="tool"><span class="mini-nota">Scegline al massimo sei, in ordine di importanza</span>' +
        '<div class="scelte" data-scelte="ev">' + base.map(function(x){ return '<button type="button" aria-pressed="' + (arr('ev').indexOf(x) > -1) + '" data-val="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>' +
        '<div class="riga2"><div class="campo"><label for="f-ev-nuova">Una cartella tutta tua</label><input id="f-ev-nuova" type="text" placeholder="es. Ricette pre gara" maxlength="15"></div><button class="piu" type="button" data-ev-aggiungi style="align-self:end">+ Aggiungi</button></div>' +
        '<div class="tool" data-lista="evt"></div>' +
        anteprima('evid', 'Il tuo menù') + '<button class="copia" type="button" data-copia="evid">Copia il menù</button></div>';
    },
    link: function(){
      return '<div class="tool">' + campo('l_oggi', 'I link che hai oggi <i>(uno per riga)</i>', 'es. sito, shop, podcast, guida, prenota…', 'area') +
        campo('l_1', '1 · La risorsa gratuita', 'es. La guida «Cosa mangiare la settimana della gara»') +
        campo('l_2', '2 · Il prodotto che costa poco <i>(se ce l\'hai)</i>', 'es. Il piano di 4 settimane') +
        campo('l_3', '3 · La prenotazione della call', 'es. Prenota la prima visita') +
        '<div class="spunte">' + spunta('lk1', 'Dal telefono si apre in un secondo') + spunta('lk2', 'Il primo link è quello che conta di più') + spunta('lk3', 'Ogni voce dice cosa succede quando la clicchi') + '</div>' +
        anteprima('link', 'Il tuo link in bio') + '</div>';
    },
    chisono: function(){
      return '<div class="tool"><span class="mini-nota"><b>La foto</b></span><div class="spunte">' +
        spunta('f1', 'Primo piano: si vede bene la faccia') + spunta('f2', 'Chiara e luminosa') + spunta('f3', 'Sfondo neutro o con i colori del mio brand') + spunta('f4', 'È la stessa su Instagram, TikTok, LinkedIn e WhatsApp') + spunta('f5', 'Niente occhiali da sole, filtri pesanti o logo al posto del volto') + '</div>' +
        '<span class="mini-nota" style="margin-top:6px"><b>Il terzo fissato, chi sono</b></span>' +
        campo('cs_prima', 'Da dove parti', 'es. Ero un\'atleta, e mangiavo malissimo prima delle gare', 'area') +
        campo('cs_oggi', 'Cosa fai oggi', 'es. Seguo chi fa sport e vuole arrivare in forma alla gara', 'area') +
        campo('cs_perche', 'Perché lo fai', '', 'area') +
        '<div class="riga2">' + campo('cs_trovi', 'Cosa trova chi ti segue', '', 'area') + campo('cs_no', 'Cosa non troverà mai', '', 'area') + '</div>' +
        anteprima('chisono', 'La scaletta del tuo chi sono') + '<button class="copia" type="button" data-copia="chisono">Copia la scaletta</button></div>';
    },
    format: function(){
      var gg = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
      return '<div class="tool">' + '<div class="riga2">' + campo('fo_nome', 'Il nome del format', 'es. Il piatto della gara') + campo('fo_promessa', 'La promessa', 'es. una ricetta pre gara in 30 secondi') + '</div>' +
        campo('fo_apre', 'La frase con cui apri sempre', 'es. Puntata numero 1 del piatto della gara') +
        campo('fo_chiude', 'La frase con cui chiudi sempre', 'es. Ci vediamo alla prossima gara') +
        '<div class="campo"><span>Il giorno in cui esce</span><div class="scelte" data-scelta1="fo_giorno">' + gg.map(function(x){ return '<button type="button" aria-pressed="' + (v('fo_giorno') === x) + '" data-val="' + x + '">' + x + '</button>'; }).join('') + '</div></div>' +
        anteprima('format', 'Il tuo format') + '<button class="copia" type="button" data-copia="format">Copia il format</button></div>';
    },
    parola: function(){
      return '<div class="tool">' + campo('pa_problema', 'Il problema preciso che risolvi', 'es. non sa cosa mangiare la settimana della gara', 'area') +
        '<div class="riga2">' + campo('pa_nome', 'Il nome della risorsa <i>(un beneficio)</i>', 'es. Cosa mangiare la settimana della gara') + campo('pa_parola', 'La parola', 'es. GARA', 'text', ' maxlength="20" autocapitalize="characters"') + '</div>' +
        '<div class="spunte">' + spunta('pa1', 'Se qualcuno legge solo il nome, capisce perché gli serve') + spunta('pa2', 'La parola è una sola, facile da scrivere') + spunta('pa3', 'La risorsa arriva subito, in automatico') + '</div>' +
        anteprima('parola', 'La tua prima risorsa') + '<button class="copia" type="button" data-copia="parola">Copia</button></div>';
    },
    bilancio: function(){
      return '<div class="tool"><div class="calcolo"><b>I numeri di oggi</b> <span class="mini-nota">(insight del profilo, ultimi 30 giorni)</span>' +
        '<div class="riga3" style="margin-top:8px">' + campo('b_follower', 'Follower oggi', '', 'number') + campo('b_visite', 'Visite al profilo', '', 'number') + campo('b_nuovi', 'Nuovi follower', '', 'number') + '</div>' +
        '<p data-tasso="b" style="margin-top:8px"></p><p data-confronto style="margin-top:6px"></p></div>' +
        campo('b_q1', 'Cosa ha funzionato di più', '', 'area') + campo('b_q2', 'Cosa togli nel 2027', '', 'area') + campo('b_q3', 'Cosa rifai ogni settimana', '', 'area') + '</div>';
    }
  };

  /* liste ripetibili */
  var LISTE = {
    mosse: { max: 8, min: 3, nuovo: function(){ return {t: '', si: '', no: ''}; }, riga: function(x, i){
      return '<div class="mossa"><div class="mt"><b>' + (i + 1) + '</b><input type="text" data-arr="mosse" data-i="' + i + '" data-k="t" placeholder="Come si chiama la mossa ' + (i + 1) + '" value="' + esc(x.t) + '" aria-label="Mossa ' + (i + 1) + '"></div>' +
        '<div class="riga2"><input type="text" data-arr="mosse" data-i="' + i + '" data-k="si" placeholder="Fa per te se…" value="' + esc(x.si) + '" aria-label="Fa per te se"><input type="text" data-arr="mosse" data-i="' + i + '" data-k="no" placeholder="Non fa per te se…" value="' + esc(x.no) + '" aria-label="Non fa per te se"></div></div>';
    }},
    casi: { max: 10, min: 1, nuovo: function(){ return {chi: '', prima: '', dopo: '', frase: ''}; }, riga: function(x, i){
      return '<div class="mossa"><div class="mt"><b>' + (i + 1) + '</b><input type="text" data-arr="casi" data-i="' + i + '" data-k="chi" placeholder="Chi è, che lavoro fa" value="' + esc(x.chi) + '" aria-label="Caso ' + (i + 1) + ': chi è"></div>' +
        '<div class="riga2"><input type="text" data-arr="casi" data-i="' + i + '" data-k="prima" placeholder="Da dove partiva" value="' + esc(x.prima) + '" aria-label="Prima"><input type="text" data-arr="casi" data-i="' + i + '" data-k="dopo" placeholder="Dove si trova oggi" value="' + esc(x.dopo) + '" aria-label="Dopo"></div>' +
        '<input type="text" data-arr="casi" data-i="' + i + '" data-k="frase" placeholder="La sua frase, con le sue parole" value="' + esc(x.frase) + '" aria-label="La sua frase"></div>';
    }}
  };
  function disegnaLista(nome){
    $$('[data-lista="' + nome + '"]').forEach(function(box){
      if (nome === 'evt') {
        var t = S.c.evt || {};
        box.innerHTML = arr('ev').map(function(x, i){ return '<div class="campo"><label for="f-evt-' + i + '">La prima storia di «' + esc(x) + '» <i>(cosa dici in 5 secondi)</i></label><input id="f-evt-' + i + '" type="text" data-evt="' + esc(x) + '" value="' + esc(t[x] || '') + '" placeholder="es. Se sei appena arrivato, ciao: qui ti dico da dove partire"></div>'; }).join('');
        return;
      }
      var L = LISTE[nome], a = arr(nome);
      while (a.length < L.min) a.push(L.nuovo());
      S.c[nome] = a;
      box.innerHTML = a.map(L.riga).join('');
      var piu = $('[data-piu="' + nome + '"]'); if (piu) piu.hidden = a.length >= L.max;
    });
  }

  /* lista dei pezzi */
  var ICO = {
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    lucc: '<svg class="pz-lucchetto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>'
  };
  function stato(p){
    if (!aperto(p)) return '<span class="pill chiuso">' + tra(p) + '</span>';
    if (S.fatti[p.n]) return '<span class="pill fatto">Fatto</span>';
    if (nuovo(p)) return '<span class="pill nuovo">Nuovo</span>';
    return '<span class="pill aperto">Aperto</span>';
  }
  function corpo(p){
    var h = '';
    h += '<div class="puntate">' +
      '<a class="puntata" href="' + esc(p.video || REELS) + '" target="_blank" rel="noopener">' + ICO.play + '<span>Guarda la puntata ' + p.n + '<small>' + (p.video ? 'Su Instagram' : 'Su Instagram, tra i reel di @gemmalenoci') + '</small></span></a>' +
      '<a class="puntata tt" href="' + esc(p.tiktok || TIKTOK) + '" target="_blank" rel="noopener">' + ICO.play + '<span>Guarda la puntata ' + p.n + '<small>' + (p.tiktok ? 'Su TikTok' : 'Su TikTok, nella playlist «Rifacciamo il profilo insieme»') + '</small></span></a></div>';
    if (p.io) {
      h += '<div class="blk"><h4>Cosa ho cambiato io</h4><div class="prima-dopo"><div class="pd prima"><small>Prima</small><s>' + esc(p.io.prima) + '</s></div><span class="freccia" aria-hidden="true">&rarr;</span><div class="pd dopo"><small>Dopo</small>' + esc(p.io.dopo) + '</div></div>' + (p.io.nota ? '<p class="nota-io">' + p.io.nota + '</p>' : '') + '</div>';
    } else {
      h += '<div class="blk"><h4>Cosa cambio io</h4><p class="nota-io">Lo rifaccio anch\'io sul mio profilo, con il prima e il dopo: lo vedi nella puntata</p></div>';
    }
    h += '<div class="blk regola"><h4>Il metodo</h4>' + p.regola.map(function(r){ return '<p>' + r + '</p>'; }).join('') + '</div>';
    if (p.esempi && p.esempi.length) h += '<div class="blk"><h4>Tre esempi</h4><div class="esempi">' + p.esempi.map(function(e){ return '<div class="es"><b>' + esc(e.chi) + '</b><small>' + esc(e.cosa) + '</small><q>' + esc(e.testo) + '</q></div>'; }).join('') + '</div></div>';
    if (p.attenzione) h += '<div class="blk"><div class="attenzione"><strong>Attenzione</strong>' + p.attenzione + '</div></div>';
    h += '<div class="blk fai"><h4>Esercizio di oggi <span class="min">' + p.minuti + ' min</span></h4><div class="fai-box"><p>' + p.esercizio + '</p>' + (STRUMENTI[p.strumento] ? STRUMENTI[p.strumento]() : '') + '</div></div>';
    if (p.lezioni && p.lezioni.length) h += '<div class="blk"><h4>Per approfondire</h4><div class="lezioni">' + p.lezioni.map(function(l){ return '<a class="lez' + (l.dove === 'gratis' ? ' gratis' : '') + '" href="' + esc(l.url) + '" target="_blank" rel="noopener"><span class="lez-tag">' + (l.dove === 'gratis' ? 'Gratis per tutti' : 'Se sei nell\'Unlike Academy') + '</span><b>' + esc(l.titolo) + '</b><small>' + esc(l.corso) + '</small></a>'; }).join('') + '</div></div>';
    h += '<div class="azioni"><button class="btn btn-fatto" type="button" data-fatto="' + p.n + '">' + (S.fatti[p.n] ? 'Fatto, sistemato' : 'Segna come fatto') + '</button></div>';
    return h;
  }
  function disegnaPezzi(){
    var html = PZ.map(function(p){
      var ap = aperto(p);
      var cls = 'pz' + (ap ? '' : ' bloccato') + (S.fatti[p.n] ? ' fatto' : '');
      var tit = '<span class="pz-n">' + p.n + '</span><span class="pz-tit"><h3>' + esc(p.titolo) + ' · <em>' + esc(p.sotto) + '</em></h3><small>' + giorno(p) + ' · ' + p.minuti + ' minuti</small></span>' + stato(p);
      if (!ap) return '<li class="' + cls + '" id="pezzo-' + p.n + '"><div class="pz-testa">' + tit + ICO.lucc + '</div><div class="pz-blocco"><p class="teaser">' + esc(p.teaser) + '</p><p class="intanto">Si sblocca ' + giorno(p) + ' alle 7, e ti scriviamo per mail' + (p.intanto ? '<br><b>Intanto</b> · ' + esc(p.intanto) : '') + '</p></div></li>';
      return '<li class="' + cls + '" id="pezzo-' + p.n + '"><button class="pz-testa" type="button" aria-expanded="false" aria-controls="corpo-' + p.n + '">' + tit + ICO.chev + '</button><div class="pz-corpo" id="corpo-' + p.n + '" hidden>' + corpo(p) + '</div></li>';
    }).join('');
    $('#lista').innerHTML = html;
    ['mosse', 'casi', 'evt'].forEach(disegnaLista);
  }
  function apri(n, scorri){
    var li = $('#pezzo-' + n); if (!li || li.classList.contains('bloccato')) return;
    var b = $('.pz-testa', li), c = $('.pz-corpo', li);
    li.classList.add('aperto'); b.setAttribute('aria-expanded', 'true'); c.hidden = false;
    if (scorri) setTimeout(function(){ li.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 30);
  }
  function chiudi(n){
    var li = $('#pezzo-' + n); if (!li) return;
    li.classList.remove('aperto'); var b = $('.pz-testa', li); if (b && b.tagName === 'BUTTON') b.setAttribute('aria-expanded', 'false'); var c = $('.pz-corpo', li); if (c) c.hidden = true;
  }
  function attuale(){
    var a = PZ.filter(aperto);
    var f = a.filter(function(p){ return !S.fatti[p.n]; })[0];
    return f || a[a.length - 1] || PZ[0];
  }
  function prossimoBloccato(){ return PZ.filter(function(p){ return !aperto(p); })[0]; }

  /* telefono, contatori e riepilogo */
  function slot(sel, pieno, html){
    $$('[data-slot="' + sel + '"]').forEach(function(el){
      el.classList.toggle('ok', !!pieno);
      if (html != null) {
        var n = $('.num', el); var num = n ? n.outerHTML : '';
        el.innerHTML = html + num;
      }
    });
  }
  function aggiorna(){
    var me = io();
    var nomeIG = (me.ig || '').replace(/^@/, '');
    $$('[data-ig]').forEach(function(el){ el.textContent = nomeIG || 'iltuoprofilo'; });
    var iniz = (v('n_nome') || me.nome || nomeIG || '?').charAt(0).toUpperCase();
    $$('[data-iniziale]').forEach(function(el){ el.textContent = iniz; });
    var fol = v('b_follower') || v('p_follower');
    $$('[data-follower]').forEach(function(el){ el.textContent = fol ? Number(fol).toLocaleString('it-IT') : '—'; });
    var sal = $('#saluto');
    if (me.nome) { sal.hidden = false; sal.textContent = 'Ciao ' + me.nome + ', il tuo profilo ti aspetta'; }

    var nm = T.nome(), bio = T.bio(), lk = v('l_1') || v('l_3') || v('l_2');
    slot('2', nm || S.fatti[2], nm ? esc(nm) : '<span class="vuoto">il tuo nome con le parole chiave</span>');
    slot('1', bio || S.fatti[1], bio ? esc(bio) : '<span class="vuoto">la tua bio, con le tre righe</span>');
    slot('5', lk || S.fatti[5], lk ? esc(lk) : '<span class="vuoto">il tuo link</span>');
    var ev = arr('ev');
    slot('6', ev.length || S.fatti[6], (ev.length ? ev : ['', '', '', '']).slice(0, 5).map(function(x){ return '<div class="ev"><span></span><small>' + esc(x) + '</small></div>'; }).join(''));
    var avOk = S.fatti[7] || ['f1', 'f2', 'f3', 'f4'].every(function(k){ return S.c[k]; });
    $$('.tel-avatar').forEach(function(el){ el.classList.toggle('ok', !!avOk); });
    var casi = arr('casi').filter(function(x){ return x && (x.chi || x.dopo); }).length;
    slot('3', T.mosse() || S.fatti[3], (T.mosse() || S.fatti[3]) ? esc(v('m_titolo') || 'Qual è la tua prossima mossa?') : '');
    slot('4', casi || S.fatti[4], (casi || S.fatti[4]) ? 'Ok, ma funziona?' + (casi ? ' · ' + casi + (casi === 1 ? ' caso' : ' casi') : '') : '');
    slot('7b', T.chisono() || S.fatti[7], (T.chisono() || S.fatti[7]) ? 'Chi sono' : '');
    slot('8', v('fo_nome') || S.fatti[8], (v('fo_nome') || S.fatti[8]) ? esc(v('fo_nome') || 'Il mio format') + ' · puntata 1' : '');
    slot('9', v('pa_parola') || S.fatti[9], (v('pa_parola') || S.fatti[9]) ? 'Commenta ' + esc((v('pa_parola') || 'la parola').toUpperCase()) : '');
    slot('10', S.fatti[10], S.fatti[10] ? 'Bilancio 2026' : '');

    var fatti = PZ.filter(function(p){ return S.fatti[p.n]; }).length;
    $$('[data-fatti]').forEach(function(el){ el.textContent = fatti; });
    $('[data-barra]').style.width = (fatti * 10) + '%';
    var pb = prossimoBloccato(), pr = $('[data-prossimo]');
    pr.innerHTML = pb ? 'Prossimo: <b>' + esc(pb.titolo) + '</b>, ' + giorno(pb) + ' (' + tra(pb) + ')' : (fatti === 10 ? 'Profilo rifatto, complimenti' : 'Sono tutti aperti');

    /* anteprime negli esercizi */
    $$('[data-ant]').forEach(function(el){
      var t = T[el.getAttribute('data-ant')] ? T[el.getAttribute('data-ant')]() : '';
      $('[data-txt]', el).textContent = t || 'Si compone mentre scrivi';
    });
    $$('[data-conta="bio"]').forEach(function(el){ var n = T.bio().length; el.textContent = n + ' / 150 caratteri'; el.classList.toggle('troppo', n > 150); });
    $$('[data-conta="nome"]').forEach(function(el){ var n = T.nome().length; el.textContent = n + ' / 64 caratteri'; el.classList.toggle('troppo', n > 64); });
    $$('[data-pv]').forEach(function(el){ el.textContent = +S.c.pv_n || 0; });
    $$('[data-tasso]').forEach(function(el){
      var t = T.tasso(el.getAttribute('data-tasso'));
      el.innerHTML = t == null ? '<span class="mini-nota">Il tasso di conversione del profilo si calcola da solo: nuovi follower ÷ visite × 100</span>' : 'Tasso di conversione: <b class="grande">' + t.toFixed(1).replace('.', ',') + '%</b> ' + (t >= 5 ? '<span class="mini-nota">sopra il 5%, il profilo lavora</span>' : '<span class="mini-nota">sotto il 5%, c\'è da sistemare: è il momento giusto</span>');
    });
    $$('[data-confronto]').forEach(function(el){
      var a = T.tasso('p'), b = T.tasso('b');
      el.innerHTML = a == null ? '<span class="mini-nota">Per il confronto servono i numeri di partenza del pezzo 1</span>' : (b == null ? '<span class="mini-nota">A ottobre eri al ' + a.toFixed(1).replace('.', ',') + '%</span>' : '<b>Prima ' + a.toFixed(1).replace('.', ',') + '% → oggi ' + b.toFixed(1).replace('.', ',') + '%</b>');
    });
    riepilogo();
  }
  var VOCI = [['Il nome', 'nome', 2], ['La bio', 'bio', 1], ['Il primo fissato · le tue mosse', 'mosse', 3], ['Il secondo fissato · le tue prove', 'prove', 4], ['Il link in bio', 'link', 5], ['Le storie in evidenza', 'evid', 6], ['Il chi sono', 'chisono', 7], ['Il tuo format', 'format', 8], ['La tua prima risorsa', 'parola', 9], ['Il bilancio', 'bilancio', 10]];
  function riepilogo(){
    $('#riassunto').innerHTML = VOCI.map(function(x){
      var t = T[x[1]]();
      return '<div class="r-voce' + (t ? '' : ' vuota') + '"><h4>' + x[0] + '</h4><p>' + (t ? esc(t) : 'Si riempie con il pezzo ' + x[2]) + '</p></div>';
    }).join('');
  }
  function testoTutto(){
    var out = ['Rifacciamo il profilo insieme, entro la fine del 2026', 'Il mio profilo nuovo', ''];
    VOCI.forEach(function(x){ var t = T[x[1]](); if (t) out.push(x[0].toUpperCase(), t, ''); });
    out.push('profilo.unlikeacademy.it');
    return out.join('\n');
  }

  /* eventi */
  document.addEventListener('input', function(e){
    var el = e.target;
    if (el.hasAttribute('data-c')) { S.c[el.getAttribute('data-c')] = el.type === 'checkbox' ? el.checked : el.value; }
    else if (el.hasAttribute('data-arr')) { var a = arr(el.getAttribute('data-arr')); var i = +el.getAttribute('data-i'); if (!a[i]) a[i] = {}; a[i][el.getAttribute('data-k')] = el.value; S.c[el.getAttribute('data-arr')] = a; }
    else if (el.hasAttribute('data-evt')) { S.c.evt = S.c.evt || {}; S.c.evt[el.getAttribute('data-evt')] = el.value; }
    else return;
    salva(); aggiorna();
  });
  document.addEventListener('change', function(e){ if (e.target.type === 'checkbox' && e.target.hasAttribute('data-c')) { S.c[e.target.getAttribute('data-c')] = e.target.checked; salva(); aggiorna(); } });
  document.addEventListener('click', function(e){
    var t = e.target.closest('button, a'); if (!t) return;
    if (t.classList.contains('pz-testa')) { var li = t.closest('.pz'); var n = +li.id.split('-')[1]; if (li.classList.contains('aperto')) chiudi(n); else apri(n); return; }
    if (t.hasAttribute('data-fatto')) {
      var n2 = +t.getAttribute('data-fatto');
      S.fatti[n2] = !S.fatti[n2]; salva();
      var li2 = $('#pezzo-' + n2); li2.classList.toggle('fatto', !!S.fatti[n2]);
      t.textContent = S.fatti[n2] ? 'Fatto, sistemato' : 'Segna come fatto';
      var pill = $('.pill', li2); var p = PZ.filter(function(x){ return x.n === n2; })[0]; if (pill) pill.outerHTML = stato(p);
      aggiorna();
      if (S.fatti[n2]) {
        var nx = PZ.filter(function(x){ return x.n > n2 && aperto(x) && !S.fatti[x.n]; })[0];
        if (nx) { toast('Pezzo ' + n2 + ' sistemato, avanti con il ' + nx.n); chiudi(n2); apri(nx.n, true); }
        else { var pb = prossimoBloccato(); toast(pb ? 'Pezzo ' + n2 + ' sistemato · il prossimo si sblocca ' + giorno(pb) : 'Profilo rifatto, non hai più scuse'); }
      }
      return;
    }
    if (t.hasAttribute('data-copia')) {
      var k = t.getAttribute('data-copia');
      var tx = k === 'perm' ? $('[data-perm]', t.parentNode).textContent : (T[k] ? T[k]() : '');
      if (k === 'evid') tx = arr('ev').join(' · ') + (T.evid() ? '\n\n' + T.evid() : '');
      if (!tx) { toast('Prima scrivi qualcosa negli spazi qui sopra'); return; }
      copia(tx); return;
    }
    if (t.hasAttribute('data-piu')) {
      var nome = t.getAttribute('data-piu'), L = LISTE[nome], a = arr(nome);
      if (a.length < L.max) { a.push(L.nuovo()); S.c[nome] = a; salva(); disegnaLista(nome); var ins = $$('[data-arr="' + nome + '"][data-i="' + (a.length - 1) + '"]')[0]; if (ins) ins.focus(); }
      return;
    }
    if (t.hasAttribute('data-piu1') || t.hasAttribute('data-meno')) { S.c.pv_n = Math.max(0, (+S.c.pv_n || 0) + (t.hasAttribute('data-piu1') ? 1 : -1)); salva(); aggiorna(); return; }
    var sc = t.closest('[data-scelte]');
    if (sc && t.hasAttribute('data-val')) {
      var ev = arr('ev'), val = t.getAttribute('data-val'), i = ev.indexOf(val);
      if (i > -1) ev.splice(i, 1); else if (ev.length >= 6) { toast('Massimo sei cartelle: togline una prima'); return; } else ev.push(val);
      S.c.ev = ev; t.setAttribute('aria-pressed', i < 0); salva(); disegnaLista('evt'); aggiorna(); return;
    }
    var s1 = t.closest('[data-scelta1]');
    if (s1 && t.hasAttribute('data-val')) {
      var key = s1.getAttribute('data-scelta1'), vv = t.getAttribute('data-val');
      S.c[key] = S.c[key] === vv ? '' : vv;
      $$('button', s1).forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-val') === S.c[key]); });
      salva(); aggiorna(); return;
    }
    if (t.hasAttribute('data-ev-aggiungi')) {
      var inp = $('#f-ev-nuova'), nv = (inp.value || '').trim(); if (!nv) { inp.focus(); return; }
      var ev2 = arr('ev'); if (ev2.indexOf(nv) > -1) { inp.value = ''; return; }
      if (ev2.length >= 6) { toast('Massimo sei cartelle: togline una prima'); return; }
      ev2.push(nv); S.c.ev = ev2; salva();
      var box = $('[data-scelte="ev"]'); if (box && !$$('button', box).some(function(b){ return b.getAttribute('data-val') === nv; })) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-val', nv); b.textContent = nv; box.appendChild(b); }
      $$('button', box).forEach(function(b){ b.setAttribute('aria-pressed', ev2.indexOf(b.getAttribute('data-val')) > -1); });
      inp.value = ''; disegnaLista('evt'); aggiorna(); return;
    }
    if (t.hasAttribute('data-copia-tutto')) { copia(testoTutto(), 'Copiato tutto il tuo profilo'); return; }
    if (t.hasAttribute('data-scarica')) {
      var blob = new Blob([testoTutto()], {type: 'text/plain;charset=utf-8'});
      var u = URL.createObjectURL(blob), d = document.createElement('a'); d.href = u; d.download = 'il-mio-profilo.txt'; document.body.appendChild(d); d.click(); d.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 1500);
      toast('Copia scaricata'); return;
    }
    if (t.hasAttribute('data-vai-attuale')) { e.preventDefault(); var at = attuale(); apri(at.n, true); history.replaceState(null, '', '#pezzo-' + at.n); return; }
    if (t.getAttribute('href') && /^#pezzo-\d+$/.test(t.getAttribute('href'))) { e.preventDefault(); apri(+t.getAttribute('href').split('-')[1], true); }
  });
  document.addEventListener('profilo-io', aggiorna);

  /* avvio */
  disegnaPezzi();
  var at = attuale();
  var vai = $('[data-vai-attuale]');
  if (vai && PZ.some(function(p){ return S.fatti[p.n]; })) vai.innerHTML = 'Vai al pezzo ' + at.n + ' <span class="ar">&rarr;</span>';
  var m = /^#pezzo-(\d+)$/.exec(location.hash);
  if (m) apri(+m[1], true); else apri(at.n, false);
  aggiorna();
})();
