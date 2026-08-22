// Configuration publique navigateur — DIGIY RENCONTRE.
// Clé anon publique uniquement. Ne jamais utiliser service_role ici.

window.DIGIY_RENCONTRE_CONFIG = {
  supabaseUrl: 'https://wesqmwjjtsefyjnluosj.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc3Ftd2pqdHNlZnlqbmx1b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNzg4ODIsImV4cCI6MjA4MDc1NDg4Mn0.dZfYOc2iL2_wRYL3zExZFsFSBK6AbMeOid2LrIjcTdA'
};

// Signalement public sécurisé : réutilise la table RLS existante.
(function(){
  'use strict';

  function start(){
    if(!window.supabase || !window.DIGIY_RENCONTRE_CONFIG) return;

    var cfg=window.DIGIY_RENCONTRE_CONFIG;
    var reportClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);

    async function myProfileId(){
      var sessionRes=await reportClient.auth.getSession();
      if(sessionRes.error || !sessionRes.data || !sessionRes.data.session) return null;
      var profileRes=await reportClient.from('digiy_rencontre_profiles').select('id').maybeSingle();
      if(profileRes.error || !profileRes.data) return null;
      return profileRes.data.id;
    }

    function addButtons(){
      document.querySelectorAll('#peopleList .request-contact[data-profile]').forEach(function(contact){
        var actions=contact.closest('.actions');
        if(!actions || actions.querySelector('.report-profile')) return;
        var btn=document.createElement('button');
        btn.type='button';
        btn.className='btn btn-danger report-profile';
        btn.dataset.profile=contact.dataset.profile;
        btn.textContent='Signaler';
        actions.insertBefore(btn,actions.querySelector('.block-profile')||null);
      });

      document.querySelectorAll('#activityList .join-activity[data-activity]').forEach(function(join){
        var actions=join.closest('.actions');
        if(!actions || actions.querySelector('.report-activity')) return;
        var btn=document.createElement('button');
        btn.type='button';
        btn.className='btn btn-danger report-activity';
        btn.dataset.activity=join.dataset.activity;
        btn.textContent='Signaler';
        actions.appendChild(btn);
      });
    }

    async function sendReport(button,targetType,targetId){
      var reporterId=await myProfileId();
      if(!reporterId){
        alert('Connectez-vous à DIGIY RENCONTRE pour envoyer un signalement.');
        return;
      }

      var choice=prompt('Pourquoi signalez-vous ?\n1 · Faux profil\n2 · Harcèlement\n3 · Contenu déplacé\n4 · Comportement dangereux\n5 · Spam\n6 · Autre');
      var reasons={'1':'FAUX_PROFIL','2':'HARCELEMENT','3':'CONTENU_DEPLACE','4':'COMPORTEMENT_DANGEREUX','5':'SPAM','6':'AUTRE'};
      var reason=reasons[String(choice||'').trim()];
      if(!reason) return;

      var details=prompt('Précisez en quelques mots si nécessaire. Ne publiez pas d’informations sensibles.');
      if(!confirm('Envoyer ce signalement à DIGIY RENCONTRE ?')) return;

      var payload={reporter_profile_id:reporterId,reason:reason,details:details?String(details).trim().slice(0,1500):null,status:'OPEN'};
      if(targetType==='profile') payload.reported_profile_id=targetId;
      else payload.activity_id=targetId;

      var result=await reportClient.from('digiy_rencontre_reports').insert(payload);
      if(result.error){
        console.error(result.error);
        alert('Signalement non envoyé. Vérifiez votre session puis réessayez.');
        return;
      }

      button.textContent='Signalement envoyé ✓';
      button.disabled=true;
    }

    document.addEventListener('click',function(e){
      var profileBtn=e.target.closest('.report-profile');
      if(profileBtn){
        e.preventDefault();
        e.stopPropagation();
        sendReport(profileBtn,'profile',profileBtn.dataset.profile);
        return;
      }
      var activityBtn=e.target.closest('.report-activity');
      if(activityBtn){
        e.preventDefault();
        e.stopPropagation();
        sendReport(activityBtn,'activity',activityBtn.dataset.activity);
      }
    });

    addButtons();
    var people=document.getElementById('peopleList');
    var activities=document.getElementById('activityList');
    if(people) new MutationObserver(addButtons).observe(people,{childList:true,subtree:true});
    if(activities) new MutationObserver(addButtons).observe(activities,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
