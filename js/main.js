if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const albums = {
  close: {
    title: 'So Close<br>To What',
    folder: 'so-close-to-what',
    cover: 'imagens/Tate_McRae_-_So_Close_to_What.png',
    name: 'SO CLOSE TO WHAT',
    description: 'A sensação de estar quase lá. Pop afiado, desejo sem filtro e espaço para mudar de ideias.',
    tracks: ['Trying On Shoes', 'Anything But Love', "Nobody's Girl", 'Horseshoe', 'Tit For Tat', 'Miss Possessive', 'Revolving door', 'bloodonmyhands ft. Flo Milli', 'Dear god', 'Purple lace bra', 'Sports car', 'Signs', 'I know love', 'Like I do', "it's ok i'm ok", "No I'm not in love", 'Means I care', 'Greenlight', '2 hands', 'Siren sounds', 'Nostalgia']
  },
  later: {
    title: 'Think<br>Later',
    folder: 'think-later',
    cover: 'imagens/think later cover.jpg',
    name: 'THINK LATER',
    description: 'Impulso antes da explicação. Uma era para dançar primeiro, pensar depois.',
    tracks: ['Cut My Hair', 'Greedy', 'Run for the Hills', 'Hurt My Feelings', 'Stay Done', 'Exes', "We're Not Alike", 'Calgary', 'Messier', 'Think Later', 'Guilty Conscience', 'Want That Too', 'Plastic Palm Trees', 'Grave']
  },
  fly: {
    title: 'I Used To Think<br>I Could Fly',
    folder: 'i-used-to-think-i-could-fly',
    cover: 'imagens/i used to think i could fly cover.jpeg',
    name: 'I USED TO THINK I COULD FLY',
    description: 'O primeiro salto. Vulnerabilidade, confusão e coragem para descobrir quem se é.',
    tracks: ["don't come back", "i'm so gone", 'what would you do?', 'chaotic', 'hate myself', "what's your problem?", "she's all i wanna be", 'boy x', "you're so cool", 'feel like shit', 'go away', 'i still say goodnight']
  }
};

const trackList = document.querySelector('#track-list');
const albumTitle = document.querySelector('#album-title');
const albumDescription = document.querySelector('#album-description');
const recordLabel = document.querySelector('#record-label');
const trackCount = document.querySelector('#track-count');
const playerRecord = document.querySelector('.player__record');
const artworkImage = document.querySelector('#artwork-image');
const playerStatus = document.querySelector('#player-status');
const songsEra = document.querySelector('#songs-era');
const playToggle = document.querySelector('#play-toggle');
const playLabel = document.querySelector('#play-label');
const previewSeek = document.querySelector('#preview-seek');
const previewTime = document.querySelector('#preview-time');
const introAudioToggle = document.querySelector('#intro-audio-toggle');
const introAudioLabel = document.querySelector('#intro-audio-label');
const introVideo = document.querySelector('#intro-video');
const headerTrackTitle = document.querySelector('#header-track-title');
const headerPlayToggle = document.querySelector('#header-play-toggle');
const headerNextTrack = document.querySelector('#header-next-track');
const timelineDetail = document.querySelector('#timeline-detail');
const timelineActiveYear = document.querySelector('#timeline-active-year');
const timelineTitle = document.querySelector('#timeline-title');
const timelineDescription = document.querySelector('#timeline-description');
let activeAlbum = 'close';
let activeTrack = albums.close.tracks[0];
let activeAudioPath = '';
let previewDuration = 40;
let playbackRequested = false;
let previewOffset = 0;
let previewPlaybackStartedAt = 0;
let previewRequestId = 0;
let loadingPreviewId = 0;
let decodedTrackBuffer = null;
let activePreviewSource = null;
let previewIsPlaying = false;
let audioContext;
const maxPreviewDuration = 40;

const introVideoSource = introVideo.querySelector('source');
const introVideoUrl = new URL(introVideoSource.src, window.location.href);
introVideoUrl.searchParams.set('play', Date.now().toString());
introVideoSource.src = introVideoUrl.href;
introVideo.load();
introVideo.play().catch(() => {});

const timelineEvents = {
  '2016': {
    year: '2016',
    title: 'O corpo fala primeiro',
    description: 'Chega à final de So You Think You Can Dance: The Next Generation.'
  },
  '2017': {
    year: '2017',
    title: 'Canções no quarto',
    description: 'Cria o canal de YouTube Create With Tate para partilhar as primeiras canções e o processo de criação.'
  },
  '2020': {
    year: '2020',
    title: 'Uma voz que atravessa fronteiras',
    description: '“you broke me first” cruza fronteiras e apresenta a sua voz a milhões de pessoas.'
  },
  '2023': {
    year: '2023–2025',
    title: 'O mundo, em voz alta',
    description: '«Think Later», uma digressão mundial, e «So Close To What» assinalam uma nova escala na carreira.'
  }
};

const closeAlbumAudio = {
  'anything-but-love': 'Tate McRae - ANYTHING BUT LOVE (Lyric Video) - TateMcRaeVEVO.mp3',
  '2-hands': '2-hands.wav',
  'dear-god': 'dear-god.wav',
  'greenlight': 'Tate McRae - Greenlight (Lyric Video) - TateMcRaeVEVO.mp3',
  'horseshoe': 'Tate McRae - HORSESHOE (Lyric Video) - TateMcRaeVEVO.mp3',
  'i-know-love': 'i-know-love.wav',
  'its-ok-im-ok': "Tate McRae - It's ok I'm ok (Official Video) - TateMcRaeVEVO.mp3",
  'like-i-do': 'Tate McRae - Like I do (Lyric Video) - Tate McRae (128k).wav',
  'means-i-care': 'Tate McRae - Means I care (Lyric Video) - TateMcRaeVEVO.mp3',
  'miss-possessive': 'miss-possessive.wav',
  'nobodys-girl': "Tate McRae - NOBODY'S GIRL (Official Video) - TateMcRaeVEVO.mp3",
  'no-im-not-in-love': "Tate McRae - No I'm not in love (Lyric Video) - TateMcRaeVEVO.mp3",
  'nostalgia': 'Tate McRae - Nostalgia (Lyric Video) - TateMcRaeVEVO.mp3',
  'purple-lace-bra': 'purple-lace-bra.wav',
  'revolving-door': 'revolving-door.wav',
  'signs': 'signs.wav',
  'siren-sounds': 'Tate McRae - Siren sounds (Lyric Video) - Tate McRae.mp3',
  'sports-car': 'sports-car.wav',
  'bloodonmyhands-ft-flo-milli': 'bloodonmyhands-ft-flo-milli.wav',
  'tit-for-tat': 'Tate McRae - TIT FOR TAT (Lyric Video) - TateMcRaeVEVO.mp3',
  'trying-on-shoes': 'Tate McRae - TRYING ON SHOES (Lyric Video) - TateMcRaeVEVO.mp3'
};

const thinkLaterAlbumAudio = {
  'cut-my-hair': 'Tate McRae - cut my hair - TateMcRaeVEVO.mp3',
  'greedy': 'Tate McRae - greedy (Official Video) - TateMcRaeVEVO.mp3',
  'run-for-the-hills': 'Tate McRae - run for the hills - TateMcRaeVEVO.mp3',
  'hurt-my-feelings': 'Tate McRae - hurt my feelings - TateMcRaeVEVO.mp3',
  'stay-done': 'Tate McRae - stay done - TateMcRaeVEVO.mp3',
  'exes': 'Tate McRae - exes (Official Video) - TateMcRaeVEVO.mp3',
  'were-not-alike': "Tate McRae - we're not alike - TateMcRaeVEVO.mp3",
  'calgary': 'Tate McRae - calgary - TateMcRaeVEVO.mp3',
  'messier': 'Tate McRae - messier - TateMcRaeVEVO.mp3',
  'think-later': 'Tate McRae - think later - TateMcRaeVEVO.mp3',
  'guilty-conscience': 'Tate McRae - guilty conscience - TateMcRaeVEVO.mp3',
  'want-that-too': 'Tate McRae - want that too - TateMcRaeVEVO.mp3',
  'plastic-palm-trees': 'Tate McRae - plastic palm trees - TateMcRaeVEVO.mp3',
  'grave': 'Tate McRae - grave - TateMcRaeVEVO.mp3'
};

const flyAlbumAudio = {
  'dont-come-back': "Tate McRae - don't come back (Lyric Video) - TateMcRaeVEVO.mp3",
  'im-so-gone': "Tate McRae - i'm so gone (Lyric Video) - TateMcRaeVEVO.mp3",
  'what-would-you-do': 'Tate McRae - what would you do (Lyric Video) - TateMcRaeVEVO.mp3',
  'chaotic': 'Tate McRae - chaotic (Lyric Video) - TateMcRaeVEVO.mp3',
  'hate-myself': 'Tate McRae - hate myself (Lyric Video) - TateMcRaeVEVO.mp3',
  'whats-your-problem': "Tate McRae - what's your problem (Lyric Video) - TateMcRaeVEVO.mp3",
  'shes-all-i-wanna-be': "Tate McRae - she's all i wanna be (Lyric Video) - TateMcRaeVEVO.mp3",
  'boy-x': 'Tate McRae - boy x (Lyric Video) - TateMcRaeVEVO.mp3',
  'youre-so-cool': "Tate McRae - you're so cool (Lyric Video) - TateMcRaeVEVO.mp3",
  'feel-like-shit': 'Tate McRae - feel like shit (Lyric Video) - TateMcRaeVEVO.mp3',
  'go-away': 'Tate McRae - go away (Lyric Video) - TateMcRaeVEVO.mp3',
  'i-still-say-goodnight': 'Tate McRae - i still say goodnight (Lyric Video) - TateMcRaeVEVO.mp3'
};

function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTrackPath(albumKey, track) {
  const slug = slugify(track);
  if (albumKey === 'close' && closeAlbumAudio[slug]) {
    return `musica/so close to what/${closeAlbumAudio[slug]}`;
  }
  if (albumKey === 'later' && thinkLaterAlbumAudio[slug]) {
    return `musica/think later/${thinkLaterAlbumAudio[slug]}`;
  }
  if (albumKey === 'fly' && flyAlbumAudio[slug]) {
    return `musica/i used to think i could fly/${flyAlbumAudio[slug]}`;
  }
  return `musica/${albums[albumKey].folder}/${slug}.mp3`;
}

function updateHeaderPlayer() {
  headerTrackTitle.textContent = activeTrack;
  headerPlayToggle.textContent = previewIsPlaying ? 'Ⅱ' : '▶';
  headerPlayToggle.setAttribute('aria-pressed', String(previewIsPlaying));
  headerPlayToggle.setAttribute('aria-label', `${previewIsPlaying ? 'Pausar' : 'Reproduzir'} “${activeTrack}”`);
  headerPlayToggle.title = previewIsPlaying ? 'Pausar pré-escuta' : 'Reproduzir pré-escuta';
}

function updateArtwork(albumKey) {
  const album = albums[albumKey];

  artworkImage.style.display = 'none';
  artworkImage.alt = '';
  document.querySelector('#track-artwork').setAttribute('aria-label', `Capa do álbum ${album.name}`);
  artworkImage.onerror = () => {
    artworkImage.style.display = 'none';
  };
  artworkImage.onload = () => {
    artworkImage.style.display = 'block';
  };
  artworkImage.src = album.cover;
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio nao e suportado neste browser.');
  audioContext ??= new AudioContextClass();
  return audioContext;
}

function stopPreviewSource() {
  if (activePreviewSource) {
    activePreviewSource.onended = null;
    activePreviewSource.stop();
    activePreviewSource.disconnect();
    activePreviewSource = null;
  }
  previewIsPlaying = false;
  playerRecord.classList.remove('is-spinning');
  playToggle.setAttribute('aria-pressed', 'false');
  playLabel.textContent = `Tocar “${activeTrack}”`;
  updateHeaderPlayer();
}

function renderAlbum(albumKey) {
  const album = albums[albumKey];
  if (!album) return;

  activeAlbum = albumKey;
  activeTrack = album.tracks[0];
  stopPreviewSource();
  decodedTrackBuffer = null;
  document.body.dataset.album = albumKey;
  albumTitle.innerHTML = album.title;
  albumDescription.textContent = album.description;
  recordLabel.textContent = album.name;
  songsEra.textContent = album.name;
  trackCount.textContent = `01 — ${String(album.tracks.length).padStart(2, '0')}`;
  trackList.replaceChildren();
  trackList.scrollTop = 0;

  album.tracks.forEach((track, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `track-button${index === 0 ? ' is-selected' : ''}`;
    button.type = 'button';
    button.dataset.trackIndex = String(index);
    button.setAttribute('aria-pressed', String(index === 0));

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.textContent = track;
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '▶';
    button.append(number, title, arrow);
    button.addEventListener('click', () => selectTrack(index));
    item.append(button);
    trackList.append(item);
  });

  document.querySelectorAll('[data-album-choice]').forEach((button) => {
    const selected = button.dataset.albumChoice === albumKey;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  selectTrack(0, false);
}

function selectTrack(index, autoplay = true) {
  const album = albums[activeAlbum];
  activeTrack = album.tracks[index];
  trackList.querySelectorAll('.track-button').forEach((button, buttonIndex) => {
    const selected = buttonIndex === index;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  trackCount.textContent = `${String(index + 1).padStart(2, '0')} — ${String(album.tracks.length).padStart(2, '0')}`;
  activeAudioPath = getTrackPath(activeAlbum, activeTrack);
  stopPreviewSource();
  decodedTrackBuffer = null;
  const requestId = ++previewRequestId;
  playbackRequested = autoplay;
  previewOffset = 0;
  previewDuration = maxPreviewDuration;
  previewSeek.max = String(maxPreviewDuration);
  previewSeek.value = '0';
  previewSeek.disabled = true;
  previewTime.textContent = '0:00 / 0:40';
  playToggle.setAttribute('aria-pressed', 'false');
  playLabel.textContent = `Tocar “${activeTrack}”`;
  playerStatus.textContent = 'Prévia de até 40 segundos, retirada do meio da faixa.';
  updateArtwork(activeAlbum);
  updateHeaderPlayer();
  if (autoplay) loadTrackPreview(requestId);
}

function formatTime(seconds) {
  const wholeSeconds = Math.floor(Math.max(0, seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

function updatePreviewProgress() {
  const playingTime = previewIsPlaying ? audioContext.currentTime - previewPlaybackStartedAt : 0;
  const elapsed = Math.min(previewDuration, Math.max(0, previewOffset + playingTime));
  previewSeek.value = String(elapsed);
  previewTime.textContent = `${formatTime(elapsed)} / ${formatTime(previewDuration)}`;
}

function animatePreviewProgress() {
  if (!previewIsPlaying) return;
  updatePreviewProgress();
  requestAnimationFrame(animatePreviewProgress);
}

async function loadTrackPreview(requestId) {
  if (loadingPreviewId === requestId) return;
  loadingPreviewId = requestId;

  try {
    const context = getAudioContext();
    await context.resume();
    const response = await fetch(`${activeAudioPath}?preview=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const encodedTrack = await response.arrayBuffer();
    const decodedTrack = await context.decodeAudioData(encodedTrack);
    if (requestId !== previewRequestId) return;

    decodedTrackBuffer = decodedTrack;
    previewDuration = Math.min(maxPreviewDuration, decodedTrack.duration);
    previewOffset = 0;
    previewSeek.max = String(previewDuration);
    previewSeek.value = '0';
    previewSeek.disabled = false;
    previewTime.textContent = `0:00 / ${formatTime(previewDuration)}`;
    playerStatus.textContent = `Prévia de ${Math.round(previewDuration)} segundos, retirada do meio da faixa.`;
    if (playbackRequested) startPreviewPlayback();
  } catch (error) {
    if (requestId !== previewRequestId) return;
    playbackRequested = false;
    playerStatus.textContent = `Não foi possível preparar a prévia de ${activeTrack}. Verifica o ficheiro de áudio.`;
  } finally {
    if (loadingPreviewId === requestId) loadingPreviewId = 0;
  }
}

function startPreviewPlayback() {
  if (!playbackRequested || !decodedTrackBuffer || previewIsPlaying) return;
  const context = getAudioContext();
  if (previewOffset >= previewDuration) previewOffset = 0;

  const source = context.createBufferSource();
  source.buffer = decodedTrackBuffer;
  source.connect(context.destination);
  activePreviewSource = source;
  previewIsPlaying = true;
  previewPlaybackStartedAt = context.currentTime;
  playToggle.setAttribute('aria-pressed', 'true');
  playLabel.textContent = `A tocar “${activeTrack}”`;
  updateHeaderPlayer();
  playerStatus.textContent = '';
  playerRecord.classList.add('is-spinning');
  source.onended = () => {
    if (activePreviewSource !== source) return;
    activePreviewSource.disconnect();
    activePreviewSource = null;
    previewIsPlaying = false;
    playbackRequested = false;
    previewOffset = 0;
    playToggle.setAttribute('aria-pressed', 'false');
    playLabel.textContent = `Tocar “${activeTrack}”`;
    updateHeaderPlayer();
    playerRecord.classList.remove('is-spinning');
    playerStatus.textContent = 'Prévia terminada. Seleciona a faixa para ouvir novamente.';
    updatePreviewProgress();
  };
  source.start(0, (decodedTrackBuffer.duration - previewDuration) / 2 + previewOffset, previewDuration - previewOffset);
  updatePreviewProgress();
  requestAnimationFrame(animatePreviewProgress);
}

function playTrack() {
  playbackRequested = true;
  if (!decodedTrackBuffer) {
    playerStatus.textContent = 'A preparar a prévia…';
    loadTrackPreview(previewRequestId);
    return;
  }
  startPreviewPlayback();
}

document.querySelectorAll('[data-album-choice]').forEach((button) => {
  button.addEventListener('click', () => renderAlbum(button.dataset.albumChoice));
});

document.querySelectorAll('[data-timeline-year]').forEach((button) => {
  button.addEventListener('click', () => {
    const event = timelineEvents[button.dataset.timelineYear];
    if (!event) return;
    document.querySelectorAll('[data-timeline-year]').forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
    });
    timelineDetail.setAttribute('aria-labelledby', button.id);
    timelineActiveYear.textContent = event.year;
    timelineTitle.textContent = event.title;
    timelineDescription.textContent = event.description;
  });
});

playToggle.addEventListener('click', () => {
  if (previewIsPlaying) {
    previewOffset = Math.min(previewDuration, previewOffset + audioContext.currentTime - previewPlaybackStartedAt);
    playbackRequested = false;
    stopPreviewSource();
    updatePreviewProgress();
  } else {
    playTrack();
  }
});

headerPlayToggle.addEventListener('click', () => playToggle.click());
headerNextTrack.addEventListener('click', () => {
  const tracks = albums[activeAlbum].tracks;
  const nextTrackIndex = (tracks.indexOf(activeTrack) + 1) % tracks.length;
  selectTrack(nextTrackIndex);
});

previewSeek.addEventListener('input', () => {
  if (!decodedTrackBuffer) return;
  const wasPlaying = previewIsPlaying;
  if (wasPlaying) {
    previewOffset = Math.min(previewDuration, previewOffset + audioContext.currentTime - previewPlaybackStartedAt);
    playbackRequested = false;
    stopPreviewSource();
  }
  const maxPosition = Math.max(0, previewDuration - 0.05);
  const position = Math.min(maxPosition, Math.max(0, Number(previewSeek.value)));
  previewSeek.value = String(position);
  previewOffset = position;
  updatePreviewProgress();
  if (wasPlaying) {
    playbackRequested = true;
    startPreviewPlayback();
  }
});

const pianoStatus = document.querySelector('#piano-status');
document.querySelectorAll('.piano__key').forEach((key) => {
  key.addEventListener('click', () => {
    let context;
    try {
      context = getAudioContext();
      context.resume();
    } catch {
      pianoStatus.textContent = 'O piano interativo nao e suportado neste browser.';
      return;
    }
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.value = Number(key.dataset.frequency);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.74);
    key.classList.add('is-active');
    pianoStatus.textContent = `${key.dataset.note} / ${key.dataset.frequency} Hz`;
    window.setTimeout(() => key.classList.remove('is-active'), 760);
  });
});

function setIntroAudioButton(isPlaying) {
  introAudioToggle.setAttribute('aria-pressed', String(isPlaying));
  introAudioLabel.textContent = isPlaying ? 'Desativar som' : 'Ativar som';
}

introAudioToggle.addEventListener('click', () => {
  introVideo.muted = !introVideo.muted;
  setIntroAudioButton(!introVideo.muted);
});

const introObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) {
    introVideo.muted = true;
    setIntroAudioButton(false);
  }
}, { threshold: 0.1 });

introObserver.observe(document.querySelector('#top'));
document.querySelectorAll('.intro__content .text-link, .intro__scroll').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector('.artist__hero');
    if (!target) return;

    event.preventDefault();
    const targetTop = target.getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight;
    document.documentElement.classList.remove('intro-locked');
    document.body.classList.remove('intro-locked');
    history.replaceState(null, '', link.hash);
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' });
  });
});

window.scrollTo(0, 0);

renderAlbum('close');

const fragranceBottleBtn = document.querySelector('#fragrance-tab-bottle');
const fragranceCampaignBtn = document.querySelector('#fragrance-tab-campaign');
const fragrancePhotoBottle = document.querySelector('#fragrance-photo-bottle');
const fragrancePhotoCampaign = document.querySelector('#fragrance-photo-campaign');
const fragranceCaption = document.querySelector('#fragrance-caption');

if (fragranceBottleBtn && fragranceCampaignBtn && fragrancePhotoBottle && fragrancePhotoCampaign) {
  fragranceBottleBtn.addEventListener('click', () => {
    fragranceBottleBtn.classList.add('is-active');
    fragranceBottleBtn.setAttribute('aria-selected', 'true');
    fragranceCampaignBtn.classList.remove('is-active');
    fragranceCampaignBtn.setAttribute('aria-selected', 'false');
    fragrancePhotoBottle.classList.add('is-active');
    fragrancePhotoCampaign.classList.remove('is-active');
    if (fragranceCaption) fragranceCaption.textContent = 'Tate 01 Eau de Parfum · Edição de estreia';
  });

  fragranceCampaignBtn.addEventListener('click', () => {
    fragranceCampaignBtn.classList.add('is-active');
    fragranceCampaignBtn.setAttribute('aria-selected', 'true');
    fragranceBottleBtn.classList.remove('is-active');
    fragranceBottleBtn.setAttribute('aria-selected', 'false');
    fragrancePhotoCampaign.classList.add('is-active');
    fragrancePhotoBottle.classList.remove('is-active');
    if (fragranceCaption) fragranceCaption.textContent = 'Tate McRae · Campanha oficial Tate 01';
  });
}

document.querySelectorAll('.merch-item--flipper').forEach((flipperItem) => {
  const flipTag = flipperItem.querySelector('.merch-item__flip-tag');
  if (!flipTag) return;
  flipTag.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const flipped = flipperItem.classList.toggle('is-flipped');
    flipTag.setAttribute('aria-pressed', String(flipped));
  });
});

const lyricTicker = document.querySelector('.lyric-ticker');
const lyricTickerTrack = lyricTicker?.querySelector('.lyric-ticker__track');
const lyricTickerTemplate = lyricTickerTrack?.querySelector('.lyric-ticker__group');

function fillLyricTicker() {
  if (!lyricTicker || !lyricTickerTrack || !lyricTickerTemplate) return;
  const groupWidth = lyricTickerTemplate.getBoundingClientRect().width;
  if (!groupWidth) return;

  const groupCount = Math.ceil(lyricTicker.clientWidth / groupWidth) + 2;
  const groups = [...lyricTickerTrack.querySelectorAll('.lyric-ticker__group')];
  while (groups.length < groupCount) {
    const clone = lyricTickerTemplate.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    lyricTickerTrack.append(clone);
    groups.push(clone);
  }
  while (groups.length > groupCount) groups.pop().remove();
  lyricTickerTrack.style.setProperty('--ticker-shift', `${-groupWidth}px`);
}

fillLyricTicker();
document.fonts.ready.then(fillLyricTicker);
window.addEventListener('resize', fillLyricTicker);
if ('ResizeObserver' in window && lyricTicker) {
  new ResizeObserver(fillLyricTicker).observe(lyricTicker);
}
