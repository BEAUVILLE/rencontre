(() => {
  'use strict';

  const cfg = window.DIGIY_RENCONTRE_CONFIG || {};
  const hasConfig = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const client = hasConfig ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const status = $('#status');
  const peopleList = $('#peopleList');
  const activityList = $('#activityList');
  const circleList = $('#circleList');
  const circleSelect = $('#circle');
  const zoneSelect = $('#zone');
  const authActions = $('#digiyAuthActions');

  let intention = 'OUVERT';
  let activeSlot = '17:00';
  let currentProfile = null;

  const demoCircles = [
    ['decouverte-petite-cote','🌍','DÉCOUVERTE PETITE CÔTE','Découvrir le territoire, partager une activité, rencontrer du monde.'],
    ['amitie-connaissances','🤝','AMITIÉ & CONNAISSANCES','Élargir naturellement son cercle.'],
    ['sorties-ambiance','🎵','SORTIES & AMBIANCE','Sorties, événements et moments à partager.'],
    ['sport-activites','⚽','SPORT & ACTIVITÉS','Sport, marche et activités collectives.'],
    ['cuisine-partage','🍲','CUISINE & PARTAGE','Découvrir, cuisiner et partager autour de la table.'],
    ['business-projets','💼','BUSINESS & PROJETS','Entrepreneurs, idées et collaborations locales.'],
    ['culture-creation','🎨','CULTURE & CRÉATION','Art, artisanat, musique, langues et traditions.'],
    ['nouveaux-petite-cote','🌱','NOUVEAUX SUR LA PETITE CÔTE','Créer ses premiers liens sur le territoire.'],
    ['atelier-ia','🤖','ATELIER IA','Découvrir · Essayer · Comprendre · Partager. La curiosité suffit.']
  ];

  const demoZones = [
    ['e04e2305-29f7-4055-bb77-cc80d88fac03','Saly'],
    ['4ad4b7dd-a0f2-4027-b64a-ccf602aa4e0a','Somone'],
    ['72b3a7ca-694c-4e80-a1f5-71cd83620329','Ngaparou'],
    ['b66f4abe-6b46-43c0-961d-c76564e14f19','Mbour'],
    ['31f30ac1-3235-43ab-9b44-339e71f7cf5a','Popenguine'],
    ['98edc9b5-ecbf-4b0f-b316-b16396cc066f','Ndayane']
  ];

  function esc(v = '') {
    return String(v).replace(/[&<>'"]/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[c]));
  }

  function setStatus(message, good = false) {
    status.textContent = message;
    status.style.borderColor = good ? 'rgba(18,183,106,.38)' : '';
    status.style.color = good ? '#dfffea' : '';
  }

  function renderConnected(profile) {
    if (!authActions || !profile) return;

    authActions.innerHTML = `
      <a class="create" href="#panel-people">
        ✓ CONNECTÉ · ${esc(profile.display_name || 'membre')}
      </a>
      <a class="login" href="#" id="rencontreLogout">
        SE DÉCONNECTER
      </a>
    `;

    const logout = $('#rencontreLogout');

    if (logout) {
      logout.addEventListener('click', async (e) => {
        e.preventDefault();
        logout.textContent = 'Déconnexion…';

        try {
          await client.auth.signOut();
        } catch (err) {
          console.error(err);
        }

        location.reload();
      });
    }
  }

  function renderCircles(
    rows = demoCircles.map(
      ([slug, icon, name, description], i) => ({
        slug,
        icon,
        name,
        description,
        position: (i + 1) * 10
      })
    )
  ) {
    circleList.innerHTML = rows.map(c => `
      <article class="card">
        <div class="card-head">
          <div>
            <span class="tag">CERCLE</span>
            <h3 style="margin-top:7px">
              ${esc(c.icon || '🤝')} ${esc(c.name)}
            </h3>
          </div>
        </div>

        <p class="desc">${esc(c.description || '')}</p>

        <div class="actions">
          <button
            class="btn btn-primary circle-join"
            data-circle="${esc(c.id || c.slug)}">
            Découvrir ce cercle
          </button>
        </div>
      </article>
    `).join('');

    circleSelect.innerHTML = rows.map(c => `
      <option value="${esc(c.id || c.slug)}">
        ${esc(c.icon || '')} ${esc(c.name)}
      </option>
    `).join('');
  }

  function renderZones(
    rows = demoZones.map(([id, label]) => ({ id, label }))
  ) {
    zoneSelect.innerHTML = rows.map(z => `
      <option value="${esc(z.id)}">
        ${esc(z.label)}
      </option>
    `).join('');
  }

  function renderPeople(rows) {
    if (!rows?.length) {
      peopleList.innerHTML =
        '<div class="empty">Aucun profil visible pour ce filtre pour le moment.</div>';
      return;
    }

    peopleList.innerHTML = rows.map(p => `
      <article class="card">
        <div class="card-head">
          <div>
            <span class="tag">${esc(p.intention || 'OUVERT')}</span>

            <h3 style="margin-top:7px">
              ${esc(p.display_name)}
            </h3>

            <div class="meta">
              📍 ${esc(p.zone_label || 'Zone non précisée')}
            </div>
          </div>
        </div>

        <p class="desc">
          ${esc(
            p.bio ||
            'Ouvert aux découvertes et aux échanges du territoire.'
          )}
        </p>

        <div class="meta">
          ${(p.interests || []).map(x => '• ' + esc(x)).join(' ')}
        </div>

        <div class="actions" style="margin-top:12px">
          <button
            class="btn btn-primary request-contact"
            data-profile="${esc(p.profile_id)}">
            Demander le contact
          </button>

          <button
            class="btn btn-danger block-profile"
            data-profile="${esc(p.profile_id)}">
            Bloquer
          </button>
        </div>
      </article>
    `).join('');
  }

  function renderActivities(rows) {
    if (!rows?.length) {
      activityList.innerHTML =
        '<div class="empty">Aucune activité ouverte pour ce filtre. Tu peux être le premier à proposer.</div>';
      return;
    }

    activityList.innerHTML = rows.map(a => {
      const d = new Date(a.start_at);

      const when = Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });

      return `
        <article class="card">
          <div class="card-head">
            <div>
              <span class="tag">
                ${esc(a.circle_icon || '🌍')}
                ${esc(a.circle_name || 'ACTIVITÉ')}
              </span>

              <h3 style="margin-top:7px">
                ${esc(a.title)}
              </h3>

              <div class="meta">
                📍 ${esc(a.zone_label || '')}
                · 🕒 ${esc(when)}
              </div>
            </div>
          </div>

          <p class="desc">
            ${esc(a.description || '')}
          </p>

          <div class="meta">
            Par ${esc(a.creator_name || 'membre DIGIY')}
            · ${Number(a.accepted_count || 0)} participant(s) accepté(s)
            ${a.capacity ? ' / ' + esc(a.capacity) : ''}
          </div>

          ${
            a.public_venue_name
              ? `<div class="meta">
                   Lieu public : ${esc(a.public_venue_name)}
                 </div>`
              : ''
          }

          <div class="actions" style="margin-top:12px">
            <button
              class="btn btn-green join-activity"
              data-activity="${esc(a.activity_id)}">
              Ça m’intéresse
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  async function requireSession() {
    if (!client) return null;

    const { data, error } = await client.auth.getSession();

    if (error || !data?.session) return null;

    return data.session;
  }

  async function loadCurrentProfile() {
    if (!client) return null;

    const { data, error } = await client
      .from('digiy_rencontre_profiles')
      .select(
        'id,user_id,display_name,zone_id,intention,is_active,is_adult'
      )
      .maybeSingle();

    if (error) throw error;

    currentProfile = data;

    return data;
  }

  async function loadLive() {
    if (!client) {
      renderCircles();
      renderZones();

      renderPeople([
        {
          profile_id: 'demo-1',
          display_name: 'Aperçu membre',
          zone_label: 'Saly',
          intention: 'CURIEUX',
          bio: 'Curieux de découvrir la Petite Côte et les ateliers IA.',
          interests: [
            'Découverte Petite Côte',
            'Atelier IA'
          ]
        }
      ]);

      renderActivities([
        {
          activity_id: 'demo-a',
          creator_name: 'DIGIY',
          circle_icon: '🤖',
          circle_name: 'ATELIER IA',
          zone_label: 'Saly',
          title: 'Atelier IA — découvrir et essayer',
          description:
            'Un moment simple pour comprendre l’IA, poser ses questions et tester ensemble.',
          start_at: new Date(Date.now() + 86400000).toISOString(),
          accepted_count: 0,
          capacity: 8
        }
      ]);

      setStatus(
        'Mode aperçu sécurisé : aucune donnée Supabase ni coordonnée personnelle n’est chargée.'
      );

      return;
    }

    const session = await requireSession();

    if (!session) {
      renderCircles();
      renderZones();
      renderPeople([]);
      renderActivities([]);

      setStatus(
        'Connexion DIGIY requise pour découvrir les profils et activités.'
      );

      return;
    }

    try {
      await loadCurrentProfile();

      if (currentProfile) {
        renderConnected(currentProfile);
      }

      if (!currentProfile?.is_active || !currentProfile?.is_adult) {
        setStatus(
          'Un profil DIGIY RENCONTRE actif et 18+ est requis avant la découverte.'
        );

        renderCircles();
        renderZones();
        renderPeople([]);
        renderActivities([]);

        return;
      }

      const [circlesRes, zonesRes] = await Promise.all([
        client
          .from('digiy_rencontre_circles')
          .select('id,slug,name,description,icon,position')
          .eq('is_active', true)
          .order('position'),

        client
          .from('digiy_zones')
          .select('id,label,parent_zone_id,rank_weight')
          .eq('is_active', true)
          .order('rank_weight')
      ]);

      if (!circlesRes.error && circlesRes.data?.length) {
        renderCircles(circlesRes.data);
      } else {
        renderCircles();
      }

      if (!zonesRes.error && zonesRes.data?.length) {
        renderZones(zonesRes.data);
      } else {
        renderZones();
      }

      await Promise.all([
        loadPeople(),
        loadActivities()
      ]);

      setStatus(
        `Connecté comme ${currentProfile.display_name}. Contact direct seulement après accord.`,
        true
      );

    } catch (e) {
      console.error(e);

      renderCircles();
      renderZones();
      renderPeople([]);
      renderActivities([]);

      setStatus(
        'Le module est branché mais la session ou les droits doivent être contrôlés.'
      );
    }
  }

  async function loadPeople() {
    if (!client || !currentProfile) return;

    const { data, error } = await client.rpc(
      'digiy_rencontre_discover_profiles',
      {
        p_zone_id: null,
        p_intention: intention === 'OUVERT'
          ? null
          : intention,
        p_limit: 30
      }
    );

    if (error) throw error;

    renderPeople(data);
  }

  async function loadActivities() {
    if (!client || !currentProfile) return;

    const { data, error } = await client.rpc(
      'digiy_rencontre_discover_activities',
      {
        p_zone_id: null,
        p_circle_id: null,
        p_limit: 30
      }
    );

    if (error) throw error;

    renderActivities(data);
  }

  $$('#intentions .chip').forEach(btn =>
    btn.addEventListener('click', async () => {

      $$('#intentions .chip').forEach(x =>
        x.classList.remove('active')
      );

      btn.classList.add('active');

      intention = btn.dataset.intention;

      if (client && currentProfile) {
        try {
          await loadPeople();
        } catch (e) {
          console.error(e);
        }
      }
    })
  );

  $$('.navbtn').forEach(btn =>
    btn.addEventListener('click', () => {

      $$('.navbtn').forEach(x =>
        x.classList.remove('active')
      );

      $$('.panel').forEach(x =>
        x.classList.remove('active')
      );

      btn.classList.add('active');

      $('#panel-' + btn.dataset.tab)
        .classList.add('active');
    })
  );

  $$('.slot').forEach(btn =>
    btn.addEventListener('click', () => {

      $$('.slot').forEach(x =>
        x.classList.remove('active')
      );

      btn.classList.add('active');

      activeSlot = btn.dataset.slot;
    })
  );

  document.addEventListener('click', async (e) => {

    const contact = e.target.closest('.request-contact');
    const block = e.target.closest('.block-profile');
    const join = e.target.closest('.join-activity');
    const circle = e.target.closest('.circle-join');

    if (circle) {
      document
        .querySelector('[data-tab="activities"]')
        .click();

      return;
    }

    if (!client || !currentProfile) return;

    try {
      if (contact) {
        const { error } = await client
          .from('digiy_rencontre_contact_requests')
          .insert({
            sender_profile_id: currentProfile.id,
            receiver_profile_id: contact.dataset.profile,
            status: 'PENDING'
          });

        if (error) throw error;

        contact.textContent = 'Demande envoyée ✓';
        contact.disabled = true;
      }

      if (block) {
        if (!confirm(
          'Bloquer ce profil ? Vous ne vous verrez plus.'
        )) {
          return;
        }

        const { error } = await client
          .from('digiy_rencontre_blocks')
          .insert({
            blocker_profile_id: currentProfile.id,
            blocked_profile_id: block.dataset.profile
          });

        if (error) throw error;

        await Promise.all([
          loadPeople(),
          loadActivities()
        ]);
      }

      if (join) {
        const { error } = await client
          .from('digiy_rencontre_activity_participants')
          .insert({
            activity_id: join.dataset.activity,
            profile_id: currentProfile.id,
            status: 'REQUESTED'
          });

        if (error) throw error;

        join.textContent = 'Demande envoyée ✓';
        join.disabled = true;
      }

    } catch (err) {
      console.error(err);

      setStatus(
        'Action non envoyée : contrôle de session ou doublon à vérifier.'
      );
    }
  });

  $('#activityForm').addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();

      if (!client || !currentProfile) {
        setStatus(
          'Mode aperçu : connecte le module à Supabase pour publier une activité.'
        );

        return;
      }

      try {
        const date = $('#date').value;

        if (!date) return;

        const start = new Date(
          `${date}T${activeSlot}:00`
        );

        const payload = {
          creator_profile_id: currentProfile.id,
          circle_id: $('#circle').value,
          zone_id: $('#zone').value,
          title: $('#title').value.trim(),
          description:
            $('#description').value.trim() || null,
          start_at: start.toISOString(),
          capacity:
            Number($('#capacity').value) || null,
          venue_type: 'PUBLIC',
          status: 'OPEN'
        };

        const { error } = await client
          .from('digiy_rencontre_activities')
          .insert(payload);

        if (error) throw error;

        e.target.reset();

        setStatus(
          'Activité publiée ✓',
          true
        );

        document
          .querySelector('[data-tab="activities"]')
          .click();

        await loadActivities();

      } catch (err) {
        console.error(err);

        setStatus(
          'Publication impossible : vérifie la session et les champs.'
        );
      }
    }
  );

  renderCircles();
  renderZones();
  loadLive();

})();
