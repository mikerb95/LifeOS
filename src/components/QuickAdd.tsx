import { useEffect, useRef, useState, type FormEvent } from 'react';
import { actions } from 'astro:actions';
import { buildIcons } from '../lib/icons';
import { QUICK_TYPES, type QuickTypeId } from '../lib/quickTypes';

const ICONS = buildIcons();
const TOAST_KEY = 'lifeos_toast';

function Icon({ name, size = 15 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.hoy }}
    />
  );
}

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [tipoId, setTipoId] = useState<QuickTypeId>(QUICK_TYPES[0].id);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const firstRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const tipo = QUICK_TYPES.find((t) => t.id === tipoId) ?? QUICK_TYPES[0];

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    try {
      const pendingToast = sessionStorage.getItem(TOAST_KEY);
      if (pendingToast) {
        sessionStorage.removeItem(TOAST_KEY);
        showToast(pendingToast);
      }
    } catch {
      /* sessionStorage no disponible */
    }
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('quickadd:open', onOpen);
    return () => window.removeEventListener('quickadd:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setValores({});
    setError(null);
    const timer = setTimeout(() => firstRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [open, tipoId]);

  const setFirstRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    firstRef.current = el;
  };

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set('tipoId', tipo.id);
    for (const campo of tipo.campos) {
      formData.set(campo.k, valores[campo.k] ?? '');
    }

    const { error: actionError } = await actions.registro.crear(formData);
    setPending(false);

    if (actionError) {
      setError(actionError.message);
      return;
    }

    setOpen(false);
    try {
      sessionStorage.setItem(TOAST_KEY, `${tipo.nombre} guardado`);
    } catch {
      /* sessionStorage no disponible */
    }
    window.location.href = '/';
  }

  return (
    <>
      {open && (
        <div
          className="qa-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="qa-sheet" role="dialog" aria-modal="true" aria-label="Registro rápido">
            <header className="qa-head">
              <h2>Registro rápido</h2>
              <button type="button" className="qa-close" onClick={() => setOpen(false)} aria-label="Cerrar">
                <Icon name="cerrar" size={16} />
              </button>
            </header>
            <div className="qa-chips">
              {QUICK_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`qa-chip${t.id === tipoId ? ' on' : ''}`}
                  onClick={() => setTipoId(t.id)}
                >
                  <Icon name={t.icono} size={15} />
                  {t.nombre}
                </button>
              ))}
            </div>
            {error && <p className="form-error">{error}</p>}
            <form className="qa-form" onSubmit={guardar}>
              {tipo.campos.map((campo, i) => (
                <label className="qa-field" key={campo.k}>
                  <span>{campo.label}</span>
                  {campo.area ? (
                    <textarea
                      ref={i === 0 ? setFirstRef : undefined}
                      rows={3}
                      placeholder={campo.ph}
                      value={valores[campo.k] ?? ''}
                      onChange={(e) => setValores((v) => ({ ...v, [campo.k]: e.target.value }))}
                    />
                  ) : (
                    <input
                      ref={i === 0 ? setFirstRef : undefined}
                      type="text"
                      inputMode={campo.tipo === 'number' ? 'decimal' : 'text'}
                      placeholder={campo.ph}
                      value={valores[campo.k] ?? ''}
                      onChange={(e) => setValores((v) => ({ ...v, [campo.k]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
              <button className="qa-save" type="submit" disabled={pending}>
                {pending ? 'Guardando…' : `Guardar ${tipo.nombre.toLowerCase()}`}
              </button>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" size={15} />
          {toast}
        </div>
      )}
    </>
  );
}
