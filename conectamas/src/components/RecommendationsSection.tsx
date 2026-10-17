import React from 'react';
import { Student, SessionState, LevelRecommendation } from '../types';
import {
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Users,
  Smile,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface RecommendationsSectionProps {
  currentStudent: Student;
  sessions: SessionState[];
  partnerName?: string;
}

export const LEVEL_RECOMMENDATIONS: LevelRecommendation[] = [
  {
    levelNumber: 1,
    levelName: 'Primeros Pasos: Escucha y Turnos',
    coreAdvice: 'Escucha con atención todas las ideas de tu compañero antes de proponer la tuya y respeta los turnos de diálogo.',
    concreteActions: [
      'Mira a tu compañero cuando te esté explicando su punto de vista.',
      'Espera a que termine de hablar antes de intervenir.',
      'Agradece sus sugerencias con una sonrisa o una palabra amable.',
    ],
    classroomExample: 'En el salón: Si tu compañero propone un color para el dibujo del equipo, pregúntale por qué le gusta ese color antes de elegir otro.',
    icon: '🌱',
  },
  {
    levelNumber: 2,
    levelName: 'Aprendemos a Escuchar: Reconocimiento Mutuo',
    coreAdvice: 'Haz preguntas amables, reconoce el valor de las ideas de tu compañero y busca una participación equilibrada.',
    concreteActions: [
      'Usa preguntas abiertas como: «¿Qué te parece si probamos tu idea primero?».',
      'Felicita a tu compañero cuando descubra un dato importante.',
      'Asegúrate de que ambos hayan hablado la misma cantidad de tiempo.',
    ],
    classroomExample: 'En clase de matemáticas: Cuando no coincidan en un cálculo, revisen paso a paso los números juntos en vez de decir «te equivocaste».',
    icon: '👂',
  },
  {
    levelNumber: 3,
    levelName: 'Creamos en Equipo: Combinación de Talentos',
    coreAdvice: 'Combina ideas distintas, reparte responsabilidades de forma justa y construye soluciones donde ambos aporten.',
    concreteActions: [
      'Identifica en qué destaca cada uno y apóyense mutuamente.',
      'Si tienen dos ideas buenas, júntenlas en una sola super-idea.',
      'Si a tu compañero le cuesta una parte, ofrécele ayuda sin hacer la tarea por él.',
    ],
    classroomExample: 'En proyectos escolares: Si diseñan un cartel, uno puede encargarse de los títulos llamativos y el otro de los dibujos explicativos.',
    icon: '✨',
  },
  {
    levelNumber: 4,
    levelName: 'Resolvemos Juntos: Diálogo y Respeto',
    coreAdvice: 'Dialoga con serenidad ante los desacuerdos, explica tus razones con respeto y busca el consenso sin imponer.',
    concreteActions: [
      'Recuerda que tener opiniones diferentes es natural y enriquece al grupo.',
      'Explica el «por qué» de tu propuesta con calma y tranquilidad.',
      'Estén dispuestos a ceder un poco para encontrar un punto medio feliz.',
    ],
    classroomExample: 'En el recreo: Si uno quiere jugar a las escondidas y el otro a la soga, pueden jugar 10 minutos a uno y 10 minutos al otro.',
    icon: '🕊️',
  },
  {
    levelNumber: 5,
    levelName: 'Agentes de Inclusión: Solidaridad Activa',
    coreAdvice: 'Lidera la inclusión en la escuela: observa a quienes suelen quedarse fuera de los juegos y abre espacios para todos.',
    concreteActions: [
      'Invita a participar a los estudiantes que estén solos en los pasillos o el patio.',
      'Detén activamente las burlas y apodos recordando que las palabras deben cuidar a los demás.',
      'Adapta los juegos de recreo para que compañeros con cualquier habilidad puedan disfrutar.',
    ],
    classroomExample: 'En la formación o el recreo: Si ves a un compañero nuevo o tímido sentado solo, acércate y dile: «¡Hola! ¿Quieres sentarte con nosotros?».',
    icon: '👑',
  },
];

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  currentStudent,
  sessions,
  partnerName,
}) => {
  const currentLevel = currentStudent.unlockedLevel || 1;
  const currentLevelRec =
    LEVEL_RECOMMENDATIONS.find((r) => r.levelNumber === currentLevel) ||
    LEVEL_RECOMMENDATIONS[0];

  // Completed sessions relevant to this student
  const studentCompletedSessions = sessions.filter(
    (s) =>
      s.isCompleted &&
      (s.student1Id === currentStudent.id ||
        s.student2Id === currentStudent.id ||
        s.student3Id === currentStudent.id)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" /> Guía Práctica de Convivencia
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Para el Aula y el Recreo</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Mis Recomendaciones de Convivencia
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Consejos personalizados según tu nivel actual y la experiencia real de colaboración con tus compañeros en CONECTA+.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Nivel {currentLevel}: {currentLevelRec.levelName.split(':')[0]}</span>
        </div>
      </div>

      {/* Featured Current Level Card */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-700 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 bg-white/20 backdrop-blur-xs rounded-2xl border border-white/20">
              {currentLevelRec.icon}
            </span>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
                Tu Foco Principal de Convivencia
              </span>
              <h3 className="text-xl md:text-2xl font-black">{currentLevelRec.levelName}</h3>
            </div>
          </div>

          <p className="text-sm md:text-base text-emerald-50 font-medium leading-relaxed max-w-2xl">
            «{currentLevelRec.coreAdvice}»
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {currentLevelRec.concreteActions.map((action, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-xs space-y-1"
              >
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acción {idx + 1}</span>
                </div>
                <p className="text-emerald-50 leading-snug">{action}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-emerald-100 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span>
              <strong>Ejemplo práctico en la escuela:</strong> {currentLevelRec.classroomExample}
            </span>
          </div>
        </div>
      </div>

      {/* Specific Challenge Feedback from real completed activities */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Aprendizajes de Retos Completados
            </h3>
            <p className="text-xs text-slate-500">
              Retroalimentación basada en las aportaciones reales que hiciste con tu compañero.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {studentCompletedSessions.length} retos completados
          </span>
        </div>

        {studentCompletedSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Aún no has completado retos en equipo</p>
            <p className="mt-1">
              Cuando termines una actividad con tu compañero, aquí se registrarán consejos específicos según sus aportaciones y acuerdos mutuos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentCompletedSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">
                    {sess.challengeId.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                    ✓ Superado
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {sess.reflection?.recommendationGiven ||
                    'Excelente trabajo en equipo: escucharon las ideas del otro y lograron una solución compartida.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progression Roadmap of Coexistence Skills */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Evolución de Habilidades Inclusivas por Nivel
          </h3>
          <p className="text-xs text-slate-500">
            Cada nivel que desbloquees te ayuda a desarrollar nuevas capacidades de empatía:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVEL_RECOMMENDATIONS.map((rec) => {
            const isReached = rec.levelNumber <= currentLevel;
            return (
              <div
                key={rec.levelNumber}
                className={`p-4 rounded-2xl border transition-all ${
                  isReached
                    ? 'bg-slate-50/80 border-emerald-200'
                    : 'bg-slate-50/30 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{rec.icon}</span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Nivel {rec.levelNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {rec.levelName.split(':')[0]}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">
                  {rec.coreAdvice}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
