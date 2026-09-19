export function shareDetails(href) {
  const url = new URL(href);
  url.search = ''; url.hash = ''; url.username = ''; url.password = '';
  const host = url.hostname;
  const local = host === 'localhost' || host.endsWith('.localhost') || /^127\./.test(host) || host === '[::1]' || host === '0.0.0.0' || url.protocol === 'file:';
  return { url: url.href, local };
}

export function setupSharing({ pause, resume, result=()=>null }) {
  const $ = id => document.getElementById(id);
  const dialog = $('share-dialog'), input = $('share-url'), status = $('share-status');
  const details = shareDetails(location.href);
  let wasPlaying = false, busy = false;
  input.value = details.url;
  $('share-notice').textContent = details.local
    ? '현재 링크는 이 컴퓨터에서만 열립니다. GitHub Pages 등에 배포한 뒤 그 사이트에서 공유하면 친구도 플레이할 수 있어요.'
    : '링크를 친구에게 보내고 누가 더 오래 살아남는지 도전해 보세요! 받는 사람도 접속할 수 있는 주소인지 확인해 주세요.';
  $('native-share-btn').hidden = details.local || typeof navigator.share !== 'function';
  function open() {
    wasPlaying = pause(); status.textContent = ''; dialog.showModal();
    const record=result();$('share-record').hidden=!record;$('copy-record-btn').hidden=!record;
    $('share-record').value=record?`${record}\n${details.url}`:'';
  }
  $('share-btn').addEventListener('click',open);
  $('result-share-btn').addEventListener('click',open);
  $('copy-record-btn').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText($('share-record').value);status.textContent='기록과 링크를 복사했어요. 친구에게 도전장을 보내세요!';}
    catch {$('share-record').focus();$('share-record').select();status.textContent='선택된 기록을 길게 누르거나 Ctrl+C / ⌘C로 복사해 주세요.';}
  });
  $('close-share-btn').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (wasPlaying) resume(); wasPlaying = false; });
  input.addEventListener('click', () => input.select());
  $('copy-link-btn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(details.url);
      status.textContent = details.local ? '로컬 링크를 복사했어요. 다른 컴퓨터에서는 열리지 않습니다.' : '링크를 복사했어요. 원하는 곳에 붙여넣으세요!';
    } catch {
      input.focus(); input.select();
      status.textContent = '자동 복사가 지원되지 않아요. 선택된 주소를 길게 누르거나 Ctrl+C / ⌘C로 복사해 주세요.';
    }
  });
  $('native-share-btn').addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      await navigator.share({ title: '모기 없는 밤 · 연못 수비대', text: result() || '진화하는 괴물 모기들로부터 연못을 지켜 보세요!', url: details.url });
      status.textContent = '공유 창에서 처리를 마쳤어요.';
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? '공유를 취소했어요.' : '공유 창을 열 수 없어요. 링크 복사를 이용해 주세요.';
    } finally { busy = false; }
  });
}
