/* profilo.unlikeacademy.it · la guida si apre dopo l'email: la mail va nel gruppo «IG · PROFILO» di MailerLite (modulo 202828662361294006, doppia conferma da spegnere nel pannello)
   Nome e profilo restano anche nel browser (profilo-io) per salutare e riempire il telefono */
(function(){
  var CHIAVE='profilo-mail-ok';
  var ENDPOINT='https://assets.mailerlite.com/jsonp/2697895/forms/202828662361294006/subscribe';
  var PRIVACY='https://www.iubenda.com/privacy-policy/15204920';
  if(/[?&]anteprima=tutti\b/.test(location.search))return
  try{if(localStorage.getItem(CHIAVE)==='1')return}catch(e){}

  var css=document.createElement('style');
  css.textContent=
    '#accesso{position:fixed;inset:0;z-index:99999;background:#F3F2EE;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;font-family:"Open Sauce Sans",system-ui,sans-serif;color:#3B3638}'+
    '#accesso .ac-box{width:100%;max-width:480px;background:#fff;border:2px solid #3B3638;border-radius:22px;padding:34px 28px;display:block;grid-template-columns:none;box-shadow:6px 8px 0 rgba(34,124,192,.38)}'+
    '#accesso .ac-bollino{display:inline-block;font-weight:800;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#CD2471;margin-bottom:12px}'+
    '#accesso h2{font-family:"Open Sauce Sans",system-ui,sans-serif;font-weight:900;letter-spacing:-.03em;font-size:28px;line-height:1.12;margin:0 0 12px;color:#3B3638}#accesso h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:700;color:#CD2471}'+'#accesso .ac-logo{display:block;height:30px;width:auto;margin:0 0 16px}'+
    '#accesso p{font-size:16px;line-height:1.5;margin:0 0 14px;color:#5A5456}'+
    '#accesso input[type=text],#accesso input[type=email]{width:100%;box-sizing:border-box;font:inherit;font-size:17px;padding:15px 18px;border:2px solid #3B3638;border-radius:14px;margin:6px 0 14px;background:#fff;color:#3B3638}'+
    '#accesso label.ac-spunta{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;color:#665E61;margin-bottom:18px;cursor:pointer}'+
    '#accesso label.ac-spunta input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:#CD2471}'+
    '#accesso a{color:#227CC0}'+
    '#accesso button{width:100%;font:inherit;font-weight:800;font-size:18px;border:0;border-radius:100px;padding:17px 24px;background:#CD2471;color:#fff;cursor:pointer;box-shadow:4px 5px 0 rgba(34,124,192,.38)}'+
    '#accesso button[disabled]{opacity:.6;cursor:wait}'+
    '#accesso .ac-riga{display:flex;gap:10px}#accesso .ac-riga input{min-width:0}'+
    '#accesso .ac-errore{color:#B3261E;font-size:14px;min-height:18px;margin:0 0 10px}'+
    '#accesso .ac-piccolo{font-size:13px;margin:14px 0 0;color:#665E61}'+
    'body.accesso-aperto{overflow:hidden}';
  document.head.appendChild(css);

  var box=document.createElement('div');
  box.id='accesso';
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.setAttribute('aria-labelledby','accesso-titolo');
  box.innerHTML=
    '<form class="ac-box" novalidate>'+
      '<img class="ac-logo" src="assets/logo/logo.webp" alt="Unlike Academy">'+'<span class="ac-bollino">Gratis</span>'+
      '<h2 id="accesso-titolo">Lascia la tua email e <em>rifacciamo il profilo insieme</em></h2>'+
      '<p>Ogni mercoledì, quando si sblocca il pezzo nuovo, ti scriviamo per mail<br>E ti mandiamo anche l\'invito al Club gratuito di Unlike Academy</p>'+
      '<div class="ac-riga"><input type="text" name="nome" placeholder="Nome" autocomplete="given-name" required aria-label="Nome"><input type="text" name="cognome" placeholder="Cognome" autocomplete="family-name" required aria-label="Cognome"></div>'+
      '<input type="email" name="email" placeholder="La tua email" autocomplete="email" required aria-label="La tua email">'+
      '<input type="text" name="instagram" placeholder="Il tuo profilo Instagram, es. @nomeprofilo" autocapitalize="none" autocorrect="off" required aria-label="Il tuo profilo Instagram">'+
      '<label class="ac-spunta"><input type="checkbox" name="consenso" required><span>Accetto di ricevere email di Unlike Academy, mi disiscrivo quando voglio · <a href="'+PRIVACY+'" target="_blank" rel="noopener">Informativa privacy</a></span></label>'+
      '<p class="ac-errore" role="alert"></p>'+
      '<button type="submit">Apri i pezzi</button>'+
      '<p class="ac-piccolo">Se non vedi le nostre mail, guarda in Promozioni e in Spam</p>'+
    '</form>';
  function mostra(){document.body.appendChild(box);document.body.classList.add('accesso-aperto');var i=box.querySelector('input[name=nome]');if(i)try{i.focus({preventScroll:true})}catch(e){}}
  if(document.body)mostra();else document.addEventListener('DOMContentLoaded',mostra);

  var form=box.querySelector('form');
  var errore=box.querySelector('.ac-errore');
  var bottone=box.querySelector('button');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var email=(form.email.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){errore.textContent='Controlla l\'indirizzo email';form.email.focus();return}
    if(!form.consenso.checked){errore.textContent='Per aprire la guida serve la spunta';return}
    var nome=(form.nome.value||'').trim(),cognome=(form.cognome.value||'').trim(),ig=(form.instagram.value||'').trim().replace(/^@+/,'').replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/[\/?].*$/,'');
    if(!nome||!cognome){errore.textContent='Servono nome e cognome';(nome?form.cognome:form.nome).focus();return}
    if(!/^[A-Za-z0-9._]{1,30}$/.test(ig)){errore.textContent='Scrivi il tuo profilo Instagram, per esempio @nomeprofilo';form.instagram.focus();return}
    errore.textContent='';
    bottone.disabled=true;bottone.textContent='Un attimo';
    var dati=new FormData();
    dati.append('fields[email]',email);
    dati.append('fields[name]',nome);
    dati.append('fields[last_name]',cognome);
    dati.append('fields[instagram]',ig);
    dati.append('ml-submit','1');
    dati.append('anticsrf','true');
    var chiudi=function(){
      try{localStorage.setItem(CHIAVE,'1');localStorage.setItem('profilo-io',JSON.stringify({nome:nome,ig:ig}))}catch(x){}
      box.remove();document.body.classList.remove('accesso-aperto');try{document.dispatchEvent(new Event('profilo-io'))}catch(x){}
    };
    fetch(ENDPOINT,{method:'POST',body:dati,mode:'no-cors'}).then(chiudi).catch(function(){
      bottone.disabled=false;bottone.textContent='Apri i pezzi';errore.textContent='Non è partito, riprova tra un attimo';
    });
  });
})();
