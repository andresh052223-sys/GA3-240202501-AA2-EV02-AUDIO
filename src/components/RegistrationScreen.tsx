import { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import type { LearnerProfile } from '../types';

interface RegistrationScreenProps {
  profile: LearnerProfile;
  isRegistered: boolean;
  onSave: (profile: LearnerProfile) => void;
  onBack: () => void;
}

export function RegistrationScreen({
  profile,
  isRegistered,
  onSave,
  onBack,
}: RegistrationScreenProps) {
  const [form, setForm] = useState<LearnerProfile>({
    fullName: profile.fullName || '',
    idNumber: profile.idNumber || '',
    trainingGroup: profile.trainingGroup || '',
    instructorName: profile.instructorName || '',
    activityName: profile.activityName || 'GA3-240202501-AA2-EV02 – AUDIO',
    trainingProgram: profile.trainingProgram || '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.fullName.trim() ||
      !form.idNumber.trim() ||
      !form.trainingGroup.trim() ||
      !form.instructorName.trim() ||
      !form.activityName.trim()
    ) {
      setError('Por favor completa todos los campos obligatorios para continuar.');
      return;
    }
    setError('');
    onSave({
      fullName: form.fullName.trim(),
      idNumber: form.idNumber.trim(),
      trainingGroup: form.trainingGroup.trim(),
      instructorName: form.instructorName.trim(),
      activityName: form.activityName.trim(),
      trainingProgram: form.trainingProgram.trim(),
    });
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver</span>
      </button>

      <div className="rounded-2xl border border-slate-800 bg-[#0B1221] p-6 sm:p-8">
        <div className="flex items-start gap-4 border-b border-slate-800 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-sky-400">
              REGISTRO DEL APRENDIZ
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">
              {isRegistered ? 'Actualiza tus datos de misión' : 'Prepara tu ficha de identidad'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Estos datos se integrarán automáticamente en tu presentación personal en inglés y en tu
              guion descargable. No necesitas crear cuenta ni contraseña.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="fullName">
                Full Name (Nombre completo) *
              </label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Ej: Laura Camila Gómez"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="idNumber">
                Identification Number (ID / Documento) *
              </label>
              <input
                id="idNumber"
                type="text"
                value={form.idNumber}
                onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                placeholder="Ej: 1020304050"
                className="font-mono-num mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="trainingGroup">
                Training Group (Ficha) *
              </label>
              <input
                id="trainingGroup"
                type="text"
                value={form.trainingGroup}
                onChange={(e) => setForm((f) => ({ ...f, trainingGroup: e.target.value }))}
                placeholder="Ej: 2847591"
                className="font-mono-num mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="instructorName">
                Instructor&apos;s Name (Nombre del instructor) *
              </label>
              <input
                id="instructorName"
                type="text"
                value={form.instructorName}
                onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))}
                placeholder="Ej: Carlos Andrés Mendoza"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="activityName">
                Activity Name (Nombre de la evidencia) *
              </label>
              <input
                id="activityName"
                type="text"
                value={form.activityName}
                onChange={(e) => setForm((f) => ({ ...f, activityName: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-sky-300 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="trainingProgram">
                Programa de formación SENA (Opcional — ayuda al AI Coach a darte mejores ejemplos)
              </label>
              <input
                id="trainingProgram"
                type="text"
                value={form.trainingProgram}
                onChange={(e) => setForm((f) => ({ ...f, trainingProgram: e.target.value }))}
                placeholder="Ej: Análisis y Desarrollo de Software, Gestión Logística, Contabilidad..."
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#060B17] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview of English Intro */}
          <div className="rounded-xl border border-slate-800 bg-[#111B30] p-4">
            <p className="text-xs font-semibold text-emerald-400">
              Vista previa automática en tu presentación en inglés:
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              &ldquo;Hello! My name is{' '}
              <span className="font-semibold text-emerald-300">
                {form.fullName.trim() || '[Full Name]'}
              </span>
              . My identification number is{' '}
              <span className="font-semibold text-sky-300">
                {form.idNumber.trim() || '[ID]'}
              </span>
              . My training group is{' '}
              <span className="font-semibold text-sky-300">
                {form.trainingGroup.trim() || '[Ficha]'}
              </span>
              . My instructor is{' '}
              <span className="font-semibold text-violet-300">
                {form.instructorName.trim() || '[Instructor]'}
              </span>
              . Today, I am presenting my audio evidence{' '}
              <span className="font-semibold text-emerald-300">
                {form.activityName.trim() || 'GA3-240202501-AA2-EV02 – AUDIO'}
              </span>
              .&rdquo;
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-2.5 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 cursor-pointer"
            >
              <span>{isRegistered ? 'Guardar y volver al mapa' : 'Guardar e ir al Mapa de Misiones'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
