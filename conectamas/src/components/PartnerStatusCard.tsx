import React, { useState } from 'react';
import { Student, Pairing, PairRequest, ChallengeDef } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { getLevelInfo, BADGES } from '../data/challenges';
import { Users, UserPlus, Play, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

interface PartnerStatusCardProps {
  currentStudent: Student;
  classmates: Student[];
  pairing: Pairing | null;
  pairRequests: PairRequest[];
  assignedChallenge: ChallengeDef | null;
  onSendRequest: (targetStudentId: string) => Promise<void>;
  onAcceptRequest: (requestId: string) => Promise<void>;
  onEnterSession: (pairingId: string) => void;
}

export const PartnerStatusCard: React.FC<PartnerStatusCardProps> = ({
  currentStudent,
  classmates,
  pairing,
  pairRequests,
  assignedChallenge,
  onSendRequest,
  onAcceptRequest,
  onEnterSession,
}) => {
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [sending, setSending] = useState(false);

  // Identify partner(s) if paired
  let partner: Student | undefined;
  let trioPartner: Student | undefined;

  if (pairing) {
    if (pairing.student1Id === currentStudent.id) {
      partner = classmates.find((c) => c.id === pairing.student2Id);
      if (pairing.student3Id) {
        trioPartner = classmates.find((c) => c.id === pairing.student3Id);
      }
    } else if (pairing.student2Id === currentStudent.id) {
      partner = classmates.find((c) => c.id === pairing.student1Id);
      if (pairing.student3Id) {
        trioPartner = classmates.find((c) => c.id === pairing.student3Id);
      }
    } else if (pairing.student3Id === currentStudent.id) {
      partner = classmates.find((c) => c.id === pairing.student1Id);
      trioPartner = classmates.find((c) => c.id === pairing.student2Id);
    }
  }

  // Incoming requests for this student
  const incomingRequests = pairRequests.filter(
    (r) => r.toStudentId === currentStudent.id && r.status === 'pending'
  );

  // Available students to invite (not me, not already in pairing)
  const availableClassmates = classmates.filter(
    (c) => c.id !== currentStudent.id
  );

  const handleSend = async () => {
    if (!selectedPeerId) return;
    setSending(true);
    try {
      await onSendRequest(selectedPeerId);
      setSelectedPeerId('');
    } finally {
      setSending(false);
    }
  };

  const partnerLevel = partner ? getLevelInfo(partner.points) : null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
      {/* Decorative accent banner */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mi compañero de equipo</h3>
            <p className="text-xs text-slate-500">
              En CONECTA+, cada reto se resuelve cooperando entre dos estudiantes.
            </p>
          </div>
        </div>

        {pairing ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Equipo Asignado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pendiente de Pareja
          </span>
        )}
      </div>

      {/* CASE 1: PAIRED! */}
      {pairing && partner ? (
        <div className="space-y-5">
          {/* Partner Info Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <AvatarRenderer avatar={partner.avatar} size="lg" />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    partner.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  title={partner.isOnline ? 'Conectado en su computadora' : 'Desconectado'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{partner.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                      partner.isOnline
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {partner.isOnline ? '● Conectado' : '○ Desconectado'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{partnerLevel?.badgeLevel}</span>
                  <span>·</span>
                  <span>{partner.points} puntos</span>
                  <span>·</span>
                  <span>{partner.completedChallengesCount} retos juntos</span>
                </div>
              </div>
            </div>

            {/* Trio info if applicable */}
            {trioPartner && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <AvatarRenderer avatar={trioPartner.avatar} size="sm" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">{trioPartner.name}</span>
                  <span className="text-amber-700 font-medium text-[11px]">3er Integrante de Apoyo</span>
                </div>
              </div>
            )}

            {/* Action to enter session */}
            <button
              onClick={() => onEnterSession(pairing.id)}
              className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Entrar a la Sesión Compartida
            </button>
          </div>

          {/* Assigned challenge preview */}
          {assignedChallenge && (
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wide block">
                    Reto Actual en Equipo
                  </span>
                  <span className="text-sm font-bold text-slate-900">{assignedChallenge.title}</span>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                    {assignedChallenge.cooperationDynamic}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-sky-700 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-sky-200">
                ~{assignedChallenge.durationMinutes} min
              </span>
            </div>
          )}

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Ambos deben ingresar a la sesión desde sus computadoras para completar el reto. Las respuestas se sincronizan en tiempo real.
            </span>
          </div>
        </div>
      ) : (
        /* CASE 2: NOT PAIRED YET - CHOOSE PARTNER OR WAIT FOR TEACHER */
        <div className="space-y-6">
          {/* Incoming requests notification */}
          {incomingRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                ¡Tienes una solicitud de equipo!
              </span>
              {incomingRequests.map((req) => {
                const requester = classmates.find((c) => c.id === req.fromStudentId);
                if (!requester) return null;
                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarRenderer avatar={requester.avatar} size="sm" />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{requester.name}</span>
                        <span className="text-xs text-slate-500">Quiere ser tu compañero en los retos</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aceptar Pareja
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selection options: Option A: Choose classmate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block mb-1">
                  Modalidad A: Elegir compañero
                </span>
                <p className="text-xs text-slate-600 mb-3">
                  Selecciona a un compañero de tu salón para invitarlo a colaborar contigo:
                </p>

                <select
                  value={selectedPeerId}
                  onChange={(e) => setSelectedPeerId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500 mb-3"
                >
                  <option value="">-- Elige un compañero de aula --</option>
                  {availableClassmates.map((peer) => (
                    <option key={peer.id} value={peer.id}>
                      {peer.name} {peer.isOnline ? '(En línea)' : '(Desconectado)'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={!selectedPeerId || sending}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <UserPlus className="w-4 h-4" />
                {sending ? 'Enviando invitación...' : 'Enviar Invitación'}
              </button>
            </div>

            {/* Option B: Automatic / Teacher Pairing */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide block mb-1">
                  Modalidad B: Asignación por Docente
                </span>
                <p className="text-xs text-slate-600 mb-3">
                  Tu profesora o profesor puede generar parejas equitativas o aleatorias para que conozcas a nuevos amigos.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    El emparejamiento automático evita que nadie se quede solo. Si el número de alumnos es impar, se forma un trío colaborativo.
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-[11px] text-slate-400 block text-center">
                  Esperando asignación docente...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
