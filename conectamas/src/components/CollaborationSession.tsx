import React, { useState, useEffect, useRef } from 'react';
import { Student, SessionState, ChallengeDef, StoryPart, MathStep, PlaygroundItem } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { getLevelInfo, BADGES } from '../data/challenges';
import confetti from 'canvas-confetti';
import {
  Users,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  ShieldAlert,
  Award,
  Star,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

interface CollaborationSessionProps {
  currentStudent: Student;
  partner: Student;
  trioPartner?: Student;
  challenge: ChallengeDef;
  initialSession: SessionState;
  onBack: () => void;
  onSessionUpdated: (session: SessionState) => void;
}

export const CollaborationSession: React.FC<CollaborationSessionProps> = ({
  currentStudent,
  partner,
  trioPartner,
  challenge,
  initialSession,
  onBack,
  onSessionUpdated,
}) => {
  const [session, setSession] = useState<SessionState>(initialSession);
  const [inputText, setInputText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Challenge specific input state
  const [mathInput, setMathInput] = useState('');
  const [puzzleCodePart, setPuzzleCodePart] = useState('');
  const [selectedDilemma, setSelectedDilemma] = useState('');
  const [dilemmaReason, setDilemmaReason] = useState('');
  const [selectedToolboxItem, setSelectedToolboxItem] = useState<string | null>(null);

  const isStudent1 = currentStudent.id === session.student1Id;
  const isStudent2 = currentStudent.id === session.student2Id || currentStudent.id === session.student3Id;

  // Real-time synchronization via SSE and heartbeat
  useEffect(() => {
    let isMounted = true;

    // Send initial heartbeat
    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`/api/sessions/${session.id}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: currentStudent.id }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setSession((prev) => ({
            ...prev,
            student1Online: data.student1Online,
            student2Online: data.student2Online,
          }));
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 4000);

    // Setup SSE stream
    const eventSource = new EventSource(`/api/sessions/${session.id}/events`);

    eventSource.addEventListener('session_updated', (event: MessageEvent) => {
      try {
        const updated = JSON.parse(event.data);
        if (isMounted) {
          setSession(updated);
          onSessionUpdated(updated);
        }
      } catch (err) {
        console.error('Error parsing SSE session_updated:', err);
      }
    });

    eventSource.addEventListener('presence_update', (event: MessageEvent) => {
      try {
        const presence = JSON.parse(event.data);
        if (isMounted) {
          setSession((prev) => ({
            ...prev,
            student1Online: presence.student1Online,
            student2Online: presence.student2Online,
          }));
        }
      } catch (err) {
        console.error('Error parsing SSE presence_update:', err);
      }
    });

    eventSource.addEventListener('session_completed', (event: MessageEvent) => {
      try {
        const completedSession = JSON.parse(event.data);
        if (isMounted) {
          setSession(completedSession);
          onSessionUpdated(completedSession);
          triggerConfetti();
          setShowCelebration(true);
        }
      } catch (err) {
        console.error('Error parsing SSE session_completed:', err);
      }
    });

    // Fallback polling every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${session.id}`);
        if (res.ok && isMounted) {
          const latest = await res.json();
          setSession(latest);
          onSessionUpdated(latest);
          if (latest.isCompleted && !session.isCompleted) {
            triggerConfetti();
            setShowCelebration(true);
          }
        }
      } catch (err) {
        // quiet fallback
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
      eventSource.close();
    };
  }, [session.id, currentStudent.id]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore if canvas not supported
    }
  };

  // Check contributions of each student
  const student1ContributionsCount = (): number => {
    let count = 0;
    const s = session.state;
    if (s.storyParts) count += s.storyParts.filter((p) => p.authorId === session.student1Id).length;
    if (s.mathSteps) count += s.mathSteps.filter((m) => m.authorId === session.student1Id).length;
    if (s.playgroundItems) count += s.playgroundItems.filter((p) => p.placedBy.includes(currentStudent.name) || p.placedBy.includes(partner.name)).length;
    if (s.cluesShared) count += s.cluesShared.length > 0 ? 1 : 0;
    if (s.dilemmaVotes?.student1Choice) count += 1;
    if (s.muralCommitments) count += s.muralCommitments.filter((m) => m.authorId === session.student1Id).length;
    return count;
  };

  const student2ContributionsCount = (): number => {
    let count = 0;
    const s = session.state;
    if (s.storyParts) count += s.storyParts.filter((p) => p.authorId === session.student2Id || p.authorId === session.student3Id).length;
    if (s.mathSteps) count += s.mathSteps.filter((m) => m.authorId === session.student2Id || m.authorId === session.student3Id).length;
    if (s.cluesShared) count += s.cluesShared.length > 1 ? 1 : 0;
    if (s.dilemmaVotes?.student2Choice) count += 1;
    if (s.muralCommitments) count += s.muralCommitments.filter((m) => m.authorId === session.student2Id || m.authorId === session.student3Id).length;
    return count;
  };

  const hasS1Contributed = student1ContributionsCount() > 0;
  const hasS2Contributed = student2ContributionsCount() > 0;
  const bothContributed = hasS1Contributed && hasS2Contributed;

  // Send contribution
  const sendContribution = async (type: string, payload: any) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/contribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          type,
          payload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        onSessionUpdated(data.session);
        setInputText('');
      }
    } catch (err) {
      console.error('Error submitting contribution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Send chat message
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    await sendContribution('chat_message', { text: chatInput.trim() });
    setChatInput('');
  };

  // Quick friendly communication stamps
  const sendQuickStamp = async (stamp: string) => {
    await sendContribution('chat_message', { text: stamp });
  };

  // Handle Complete Reto
  const handleCompleteReto = async () => {
    setCompleting(true);
    setCompletionMessage(null);

    try {
      const res = await fetch(`/api/sessions/${session.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent.id,
          rating: 5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCompletionMessage(data.error || 'Aún faltan aportes de ambos estudiantes.');
        return;
      }

      if (data.waitingForPartner) {
        setCompletionMessage(
          `¡Tu voto fue registrado! Ahora falta que ${partner.name} también presione "Completar Reto" en su pantalla.`
        );
        setSession(data.session);
      } else if (data.completed) {
        setSession(data.session);
        onSessionUpdated(data.session);
        triggerConfetti();
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Error completing session:', err);
      setCompletionMessage('Error de conexión al completar el reto.');
    } finally {
      setCompleting(false);
    }
  };

  const partnerOnline = isStudent1 ? session.student2Online : session.student1Online;
  const partnerLevel = getLevelInfo(partner.points);
  const currentLevel = getLevelInfo(currentStudent.points);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Navigation & Challenge Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Volver a la biblioteca de retos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                {challenge.categoryLabel}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">~{challenge.durationMinutes} min de cooperación</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{challenge.title}</h2>
          </div>
        </div>

        {/* Live Presence Bar - Real-time indicators of BOTH students */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          {/* Student 1 Indicator */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <div className="relative">
              <AvatarRenderer
                avatar={isStudent1 ? currentStudent.avatar : partner.avatar}
                size="sm"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  session.student1Online ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[100px]">
                {isStudent1 ? `${currentStudent.name} (Tú)` : partner.name}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  session.student1Online ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {session.student1Online ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Student 2 Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <AvatarRenderer
                avatar={!isStudent1 ? currentStudent.avatar : partner.avatar}
                size="sm"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  session.student2Online ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[100px]">
                {!isStudent1 ? `${currentStudent.name} (Tú)` : partner.name}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  session.student2Online ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {session.student2Online ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnection Warning if Partner is offline */}
      {!partnerOnline && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>{partner.name} aún no se ha conectado desde su computadora.</strong> Tu progreso se guarda automáticamente y podrán continuar en cuanto ingrese.
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
            Sincronización activa
          </span>
        </div>
      )}

      {/* Cooperation Dynamic Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-blue-900 block mb-0.5">Dinámica de cooperación obligatoria:</span>
          <p className="text-blue-800/90">{challenge.cooperationDynamic}</p>
        </div>
      </div>

      {/* Main Interactive Challenge Workspace Split:
          Left / Center: Collaborative Activity Stage (65%)
          Right: Team Discussion & Mutual Support Chat (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INTERACTIVE WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================================================= */}
          {/* CHALLENGE 1: CUENTO COMPARTIDO */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_cuento_jardin' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Illustration Header */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 shadow-inner">
                <img
                  src={challenge.illustrationImage}
                  alt="Ilustración del cuento"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                      Misterio del Huerto Escolar
                    </span>
                    <h3 className="text-lg font-bold">
                      {session.state.storyTitle || 'El Cofre Mágico de la Amistad'}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Story Contributions Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Párrafos Compartidos del Cuento
                  </span>
                  <span className="text-xs text-slate-500">
                    {session.state.storyParts?.length || 0} de 2 aportes mínimos
                  </span>
                </div>

                {(!session.state.storyParts || session.state.storyParts.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                    <p className="font-medium text-slate-700 mb-1">¡El libro está esperando sus palabras!</p>
                    <p>
                      El Estudiante 1 debe redactar el inicio describiendo cómo encontraron el cofre. Luego el Estudiante 2 redactará el desarrollo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {session.state.storyParts.map((part, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          part.authorId === currentStudent.id
                            ? 'bg-blue-50/60 border-blue-200'
                            : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>{part.authorId === currentStudent.id ? 'Tú aportaste' : `${part.authorName} aportó`}:</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white border border-slate-200 text-slate-600">
                              Parte {part.step}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(part.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-serif italic">
                          «{part.text}»
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input for Contribution */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">
                  Tu turno para aportar a la historia ({currentStudent.name}):
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe aquí tu párrafo para continuar la historia..."
                  rows={3}
                  className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Recuerda consultar con tu compañero si la idea encaja con el cuento.
                  </span>
                  <button
                    onClick={() => {
                      if (!inputText.trim()) return;
                      sendContribution('story_part', { text: inputText.trim() });
                    }}
                    disabled={!inputText.trim() || submitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar mi Aporte al Cuento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHALLENGE 2: MATEMÁTICA COLABORATIVA */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_matematicas_fiesta' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <h4 className="text-sm font-bold text-emerald-950 mb-1">
                  Misión: Fiesta de Bienvenida Escolar
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Para que nadie en la escuela se quede sin refrigerio, cada compañero tiene una ficha secreta con datos que el otro NO tiene. ¡Deben combinarlos para calcular la compra exacta!
                </p>
              </div>

              {/* Secret Clue Cards Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student 1 Secret Card */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isStudent1
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      {isStudent1 ? <Unlock className="w-4 h-4 text-blue-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
                      Ficha de Invitados (Estudiante 1)
                    </span>
                    {isStudent1 && (
                      <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        Tu Ficha
                      </span>
                    )}
                  </div>
                  {isStudent1 ? (
                    <div className="text-xs text-slate-700 space-y-1.5">
                      <p>• Hay <strong>18 estudiantes</strong> invitados en total.</p>
                      <p>• Cada estudiante debe recibir exactamente <strong>2 manzanas saludables</strong>.</p>
                      <p className="text-blue-900 font-semibold pt-1">
                        👉 Pregunta 1: ¿Cuántas manzanas en total se necesitan para los 18 alumnos? (18 × 2)
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Esta información la tiene tu compañero. Pídele que te diga el total de manzanas necesarias.
                    </div>
                  )}
                </div>

                {/* Student 2 Secret Card */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isStudent2
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      {isStudent2 ? <Unlock className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
                      Ficha de Despensa y Precios (Estudiante 2)
                    </span>
                    {isStudent2 && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Tu Ficha
                      </span>
                    )}
                  </div>
                  {isStudent2 ? (
                    <div className="text-xs text-slate-700 space-y-1.5">
                      <p>• Las manzanas se venden en <strong>bolsas de 6 unidades</strong>.</p>
                      <p>• Cada bolsa cuesta <strong>$4 dólares</strong>.</p>
                      <p className="text-amber-900 font-semibold pt-1">
                        👉 Pregunta 2: Con el total de manzanas que te diga tu compañero, ¿cuántas bolsas se deben comprar y cuánto costará en total?
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">
                      Esta información la tiene tu compañero. Pregúntale cuántas manzanas vienen por bolsa y su costo.
                    </div>
                  )}
                </div>
              </div>

              {/* Shared Steps Resolved */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Pasos Registrados en la Pizarra Compartida
                </span>

                <div className="space-y-2">
                  {/* Step 1 Slot */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Paso 1: Total de Manzanas Necesarias (Aporte Estudiante 1)
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.state.mathSteps?.find((m) => m.stepId === 'step_1')?.value
                          ? `Resultado: ${session.state.mathSteps?.find((m) => m.stepId === 'step_1')?.value} manzanas`
                          : 'Aún no calculado por Estudiante 1'}
                      </span>
                    </div>
                    {session.state.mathSteps?.find((m) => m.stepId === 'step_1') ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Registrado
                      </span>
                    ) : isStudent1 ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Ej: 36"
                          value={mathInput}
                          onChange={(e) => setMathInput(e.target.value)}
                          className="w-20 text-xs p-1.5 border rounded-lg bg-white"
                        />
                        <button
                          onClick={() => {
                            if (!mathInput) return;
                            sendContribution('math_step', {
                              stepId: 'step_1',
                              stepName: 'Total de manzanas',
                              value: mathInput,
                              notes: '18 alumnos x 2 manzanas = 36',
                            });
                            setMathInput('');
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Esperando a Estudiante 1</span>
                    )}
                  </div>

                  {/* Step 2 Slot */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Paso 2: Bolsas a Comprar y Presupuesto (Aporte Estudiante 2)
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.state.mathSteps?.find((m) => m.stepId === 'step_2')?.value
                          ? `Resultado: ${session.state.mathSteps?.find((m) => m.stepId === 'step_2')?.value}`
                          : 'Aún no calculado por Estudiante 2'}
                      </span>
                    </div>
                    {session.state.mathSteps?.find((m) => m.stepId === 'step_2') ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Registrado
                      </span>
                    ) : isStudent2 ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Ej: 6 bolsas ($24)"
                          value={mathInput}
                          onChange={(e) => setMathInput(e.target.value)}
                          className="w-32 text-xs p-1.5 border rounded-lg bg-white"
                        />
                        <button
                          onClick={() => {
                            if (!mathInput) return;
                            sendContribution('math_step', {
                              stepId: 'step_2',
                              stepName: 'Bolsas y costo',
                              value: mathInput,
                              notes: '36 manzanas / 6 = 6 bolsas. 6 x $4 = $24',
                            });
                            setMathInput('');
                          }}
                          className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Esperando a Estudiante 2</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHALLENGE 3: PATIO DE RECREO INCLUSIVO */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_patio_inclusivo' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Mapa Interactivo: Diseñando Nuestro Patio Inclusivo
                </h4>
                <p className="text-xs text-slate-500">
                  Cada estudiante dispone de elementos especiales. Coloquen al menos 2 elementos cada uno en el mapa para asegurar que niños con distintas habilidades y necesidades jueguen felices.
                </p>
              </div>

              {/* Shared Playground Blueprint Canvas */}
              <div className="relative rounded-2xl bg-gradient-to-b from-emerald-50 via-amber-50/30 to-sky-50 border-2 border-dashed border-emerald-300 p-6 min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-600 pb-2 border-b border-slate-200/60">
                  <span>Área Verde y Recreación Inclusiva</span>
                  <span>Elementos instalados: {session.state.playgroundItems?.length || 0}</span>
                </div>

                {/* Installed Items Display */}
                <div className="relative z-10 py-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(!session.state.playgroundItems || session.state.playgroundItems.length === 0) ? (
                    <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                      Selecciona un elemento de tu caja de herramientas abajo para instalarlo en el patio.
                    </div>
                  ) : (
                    session.state.playgroundItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3 animate-fade-in"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{item.name}</span>
                          <span className="text-[10px] text-slate-500">Instalado por {item.placedBy}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="relative z-10 text-[11px] text-slate-400 italic text-center">
                  Zona escolar segura, accesible y sin barreras
                </div>
              </div>

              {/* Toolboxes Split: Student 1 has Accessibility, Student 2 has Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* S1 Toolbox */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isStudent1 ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold text-blue-900 block mb-2">
                    Herramientas de Accesibilidad Física y Sensorial (Estudiante 1)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Rampa de Ruedas', icon: '♿', type: 'ramp' },
                      { name: 'Piso Podotáctil', icon: '👣', type: 'tactile_path' },
                      { name: 'Rincón de Calma', icon: '🌿', type: 'calm_zone' },
                      { name: 'Carteles en Braille', icon: '🏷️', type: 'braille' },
                    ].map((tool) => (
                      <button
                        key={tool.name}
                        disabled={!isStudent1 || submitting}
                        onClick={() =>
                          sendContribution('playground_item', {
                            name: tool.name,
                            icon: tool.icon,
                            type: tool.type,
                            x: 50,
                            y: 50,
                          })
                        }
                        className="p-2.5 rounded-xl border border-white bg-white hover:bg-blue-100/70 text-slate-800 text-xs font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed shadow-2xs"
                      >
                        <span>{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* S2 Toolbox */}
                <div
                  className={`p-4 rounded-2xl border ${
                    isStudent2 ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-900 block mb-2">
                    Herramientas de Integración y Convivencia (Estudiante 2)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Banco de la Amistad', icon: '🪑', type: 'friendship_bench' },
                      { name: 'Juegos Cooperativos', icon: '🎲', type: 'coop_games' },
                      { name: 'Huerto Inclusivo', icon: '🌻', type: 'garden' },
                      { name: 'Columpio Adaptado', icon: '🎡', type: 'swing' },
                    ].map((tool) => (
                      <button
                        key={tool.name}
                        disabled={!isStudent2 || submitting}
                        onClick={() =>
                          sendContribution('playground_item', {
                            name: tool.name,
                            icon: tool.icon,
                            type: tool.type,
                            x: 50,
                            y: 50,
                          })
                        }
                        className="p-2.5 rounded-xl border border-white bg-white hover:bg-amber-100/70 text-slate-800 text-xs font-medium flex items-center gap-2 transition-all disabled:cursor-not-allowed shadow-2xs"
                      >
                        <span>{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHALLENGE 4: ACERTIJO DE PISTAS CRUZADAS */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_pistas_cruzadas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <h4 className="text-sm font-bold text-purple-950 mb-1">
                  El Gran Enigma de la Biblioteca
                </h4>
                <p className="text-xs text-purple-900">
                  Hay un cofre sellado con un valor fundamental para la escuela. Cada uno de ustedes recibió 2 pistas secretas. Presionen "Compartir Pistas" para mostrarlas al equipo y escriban juntos la palabra secreta.
                </p>
              </div>

              {/* Clues Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Pistas del Estudiante 1</span>
                    {isStudent1 && (
                      <button
                        onClick={() =>
                          sendContribution('clue_share', {
                            clueId: 'clue_s1',
                            title: 'Pistas de Estudiante 1',
                            text: 'Pista 1: Es un valor que empieza con la letra "E". Pista 2: Tiene 7 letras en total.',
                          })
                        }
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        Compartir Pistas
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    {session.state.cluesShared?.some((c) => c.clueId === 'clue_s1') ? (
                      <p className="font-medium text-purple-900">
                        {session.state.cluesShared.find((c) => c.clueId === 'clue_s1')?.text}
                      </p>
                    ) : (
                      <span className="italic text-slate-400">
                        Pista oculta. Esperando que Estudiante 1 la comparta.
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Pistas del Estudiante 2</span>
                    {isStudent2 && (
                      <button
                        onClick={() =>
                          sendContribution('clue_share', {
                            clueId: 'clue_s2',
                            title: 'Pistas de Estudiante 2',
                            text: 'Pista 3: Significa ponerse en el lugar del otro. Pista 4: Termina en "ÍA".',
                          })
                        }
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        Compartir Pistas
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    {session.state.cluesShared?.some((c) => c.clueId === 'clue_s2') ? (
                      <p className="font-medium text-purple-900">
                        {session.state.cluesShared.find((c) => c.clueId === 'clue_s2')?.text}
                      </p>
                    ) : (
                      <span className="italic text-slate-400">
                        Pista oculta. Esperando que Estudiante 2 la comparta.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Combined Deduction Input */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 text-center space-y-3">
                <span className="text-xs font-bold text-purple-900 block">
                  ¿Descubrieron la palabra mágica del valor escolar?
                </span>
                <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                  <input
                    type="text"
                    placeholder="Palabra de 7 letras..."
                    value={puzzleCodePart}
                    onChange={(e) => setPuzzleCodePart(e.target.value)}
                    className="p-2.5 text-center text-xs font-bold tracking-widest uppercase rounded-xl border border-purple-300 bg-white w-full"
                  />
                  <button
                    onClick={() => {
                      if (!puzzleCodePart.trim()) return;
                      sendContribution('puzzle_answer', {
                        key: currentStudent.id,
                        value: puzzleCodePart.trim().toUpperCase(),
                      });
                      setPuzzleCodePart('');
                    }}
                    className="px-4 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl"
                  >
                    Confirmar
                  </button>
                </div>
                {session.state.puzzleAnswers && Object.keys(session.state.puzzleAnswers).length > 0 && (
                  <div className="text-xs font-semibold text-emerald-700">
                    Propuesta del equipo: {Object.values(session.state.puzzleAnswers).join(' - ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHALLENGE 5: DILEMA DE CONVIVENCIA */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_dilema_recreo' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  Situación en el Patio
                </span>
                <p className="text-xs text-rose-950 leading-relaxed">
                  «Es la hora del recreo. Lucas observa a varios compañeros jugando fútbol, pero nadie le pasa el balón y escucha que alguien le dijo "tú eres muy lento". Lucas baja la cabeza y camina hacia una esquina solitaria».
                </p>
              </div>

              {/* Voting Options */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  ¿Cuál es la mejor acción para frenar la exclusión?
                </span>
                <div className="space-y-2">
                  {[
                    {
                      id: 'op1',
                      title: 'A. Acercarse a Lucas y preguntarle si quiere jugar a otro juego divertido juntos.',
                    },
                    {
                      id: 'op2',
                      title: 'B. Hablar con el grupo de fútbol y recordar que en la escuela todos tienen derecho a participar adaptando las reglas.',
                    },
                    {
                      id: 'op3',
                      title: 'C. Invitar a Lucas a ser el árbitro o capitán para que se sienta parte esencial del equipo.',
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedDilemma(option.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedDilemma === option.id
                          ? 'border-rose-500 bg-rose-50 font-bold text-rose-950 ring-2 ring-rose-400/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{option.title}</span>
                      {selectedDilemma === option.id && <Check className="w-4 h-4 text-rose-600" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    disabled={!selectedDilemma || submitting}
                    onClick={() => {
                      sendContribution('dilemma_vote', {
                        choice: selectedDilemma,
                      });
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40"
                  >
                    Enviar mi Voto de Convivencia
                  </button>
                </div>
              </div>

              {/* Status of Both Students' Votes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Voto de {isStudent1 ? 'Tú' : partner.name}:</span>
                  <span className="text-slate-600">
                    {session.state.dilemmaVotes?.student1Choice
                      ? `Opción ${session.state.dilemmaVotes.student1Choice.toUpperCase()}`
                      : 'Esperando elección...'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Voto de {!isStudent1 ? 'Tú' : partner.name}:</span>
                  <span className="text-slate-600">
                    {session.state.dilemmaVotes?.student2Choice
                      ? `Opción ${session.state.dilemmaVotes.student2Choice.toUpperCase()}`
                      : 'Esperando elección...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CHALLENGE 6: MURAL ANTI-EXCLUSIÓN */}
          {/* ========================================================================= */}
          {challenge.id === 'reto_mural_antiexclusion' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Mural Escolar: Nuestra Promesa de Inclusión
                </h4>
                <p className="text-xs text-slate-500">
                  Peguen notas adhesivas con compromisos reales para que ningún estudiante sufra burlas, apodos o soledad en la institución.
                </p>
              </div>

              {/* Mural Corkboard */}
              <div className="p-6 rounded-3xl bg-amber-100/60 border-2 border-amber-300 min-h-[220px] grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(!session.state.muralCommitments || session.state.muralCommitments.length === 0) ? (
                  <div className="col-span-full text-center py-10 text-amber-800/70 text-xs italic">
                    El mural está vacío. Cada compañero debe aportar al menos un compromiso.
                  </div>
                ) : (
                  session.state.muralCommitments.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-yellow-200 rounded-xl shadow-xs border border-yellow-300 text-xs space-y-1.5 rotate-[-1deg] hover:rotate-0 transition-transform"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                        {item.authorName}
                      </span>
                      <p className="text-slate-800 font-medium leading-snug">«{item.text}»</p>
                    </div>
                  ))
                )}
              </div>

              {/* Input for Commitment */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu compromiso (ej: Si veo a alguien solo, lo invitaré a almorzar)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs p-3 rounded-2xl border border-slate-300 bg-white"
                />
                <button
                  onClick={() => {
                    if (!inputText.trim()) return;
                    sendContribution('mural_commitment', { text: inputText.trim() });
                  }}
                  disabled={!inputText.trim() || submitting}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shrink-0 disabled:opacity-40"
                >
                  Pegar en Mural
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* COMPLETION CONTROL & PEDAGOGICAL CHECKLIST */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Verificación de Participación Mutua</h4>
                <p className="text-xs text-slate-500">
                  Ningún estudiante puede completar el reto por ambos. La cooperación es el requisito principal.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                +120 Puntos al completar
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
                  session.student1Online
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${session.student1Online ? 'text-emerald-600' : 'text-slate-300'}`}
                />
                <span>Estudiante 1 ({isStudent1 ? 'Tú' : partner.name}) conectado</span>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
                  session.student2Online
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${session.student2Online ? 'text-emerald-600' : 'text-slate-300'}`}
                />
                <span>Estudiante 2 ({!isStudent1 ? 'Tú' : partner.name}) conectado</span>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
                  hasS1Contributed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${hasS1Contributed ? 'text-emerald-600' : 'text-slate-300'}`}
                />
                <span>Aportes registrados de Estudiante 1</span>
              </div>

              <div
                className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
                  hasS2Contributed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${hasS2Contributed ? 'text-emerald-600' : 'text-slate-300'}`}
                />
                <span>Aportes registrados de Estudiante 2</span>
              </div>
            </div>

            {/* Message alert if waiting */}
            {completionMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                {completionMessage}
              </div>
            )}

            {/* Completion Button */}
            <div className="pt-3">
              <button
                onClick={handleCompleteReto}
                disabled={!bothContributed || completing || session.isCompleted}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Award className="w-5 h-5" />
                {session.isCompleted
                  ? '¡Reto Completado en Pareja!'
                  : isStudent1 && session.student1ReadyToFinish
                  ? 'Listo de tu lado · Esperando a tu compañero...'
                  : isStudent2 && session.student2ReadyToFinish
                  ? 'Listo de tu lado · Esperando a tu compañero...'
                  : 'Completar Reto Colaborativo'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Live Team Dialogue & Friendly Empathy Stamps */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col h-[560px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Diálogo de Equipo</span>
              </div>
              <span className="text-[11px] text-slate-500">Sincronizado</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {(!session.state.chatMessages || session.state.chatMessages.length === 0) ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  ¡Saluda a tu compañero de equipo y coordinen las respuestas!
                </div>
              ) : (
                session.state.chatMessages.map((msg) => {
                  const isMe = msg.senderId === currentStudent.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                        {isMe ? 'Tú' : msg.senderName}
                      </span>
                      <div
                        className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Friendly Inclusivity Stamps */}
            <div className="py-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Frases de apoyo mutuo:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  '¡Buena idea! 💡',
                  '¿Qué opinas tú? 🤔',
                  '¡Me gusta! 👍',
                  'Hagámoslo juntos 🤝',
                ].map((stamp) => (
                  <button
                    key={stamp}
                    type="button"
                    onClick={() => sendQuickStamp(stamp)}
                    className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2 py-1 rounded-lg transition-colors border border-slate-200"
                  >
                    {stamp}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escribe un mensaje a tu compañero..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUCCESS CELEBRATION MODAL WITH CONSTRUCTIVE RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl border border-slate-200 space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner text-3xl">
              🎉
            </div>

            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                ¡Misión Cumplida en Equipo!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                ¡Felicitaciones, {currentStudent.name} y {partner.name}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ambos aportaron ideas valiosas y demostraron que la inclusión hace más fuerte a la escuela.
              </p>
            </div>

            {/* Points & Badges Won */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-around">
              <div>
                <span className="text-xs text-amber-800 font-medium block">Puntos Ganados</span>
                <span className="text-xl font-black text-amber-600">+120 pts</span>
              </div>
              <div className="w-px h-8 bg-amber-200" />
              <div>
                <span className="text-xs text-amber-800 font-medium block">Insignia Desbloqueada</span>
                <span className="text-sm font-bold text-amber-900 flex items-center gap-1 justify-center">
                  <span>🏅</span> Agente de Convivencia
                </span>
              </div>
            </div>

            {/* Personalized Constructive Coexistence Recommendation */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-left space-y-1">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-sky-600" />
                Recomendación de Convivencia para el Recreo:
              </span>
              <p className="text-xs text-sky-950 leading-relaxed font-medium">
                {session.reflection?.recommendationGiven ||
                  '«Escucha las ideas de tu compañero antes de decidir. En el recreo, recuerden invitar a quienes suelan quedarse fuera de las actividades». '}
              </p>
            </div>

            <button
              onClick={() => {
                setShowCelebration(false);
                onBack();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Continuar a Nuevos Retos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
