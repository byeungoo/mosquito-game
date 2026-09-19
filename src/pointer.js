// One finger owns an attack until it is released. Extra fingers must not aim or stop it.
export function bindPondPointer(canvas, pointer, { canAttack, attack }) {
  let activeId = null;
  const aim = e => {
    const r = canvas.getBoundingClientRect();
    pointer.x = Math.max(0, Math.min(1000, (e.clientX-r.left)/r.width*1000));
    pointer.y = Math.max(0, Math.min(700, (e.clientY-r.top)/r.height*700));
    pointer.inside = true;
  };
  const cancel = () => {
    const id = activeId;
    activeId = null; pointer.down = false; pointer.inside = false;
    if (id !== null && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  };
  canvas.addEventListener('pointerdown', e => {
    if (activeId !== null || e.button !== 0 || !canAttack()) return;
    activeId = e.pointerId; aim(e); pointer.down = true;
    canvas.setPointerCapture(e.pointerId); canvas.focus({ preventScroll:true });
    attack(); e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => {
    if (activeId !== null ? e.pointerId === activeId : e.pointerType === 'mouse') aim(e);
  });
  canvas.addEventListener('pointerup', e => { if (e.pointerId === activeId) cancel(); });
  canvas.addEventListener('pointercancel', e => { if (e.pointerId === activeId) cancel(); });
  canvas.addEventListener('lostpointercapture', e => { if (e.pointerId === activeId) cancel(); });
  canvas.addEventListener('pointerleave', () => { if (activeId === null) pointer.inside = false; });
  return { cancel };
}
