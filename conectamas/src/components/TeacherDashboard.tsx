import React, { useState } from 'react';
import { Classroom, Student, Pairing, SessionState, ChallengeDef } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { CHALLENGES, BADGES, getLevelInfo } from '../data/challenges';
import {
  School,
  Users,
  Shuffle,
  Plus,
  BookOpen,
  Activity,
  Award,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  X,
  Share2,
  Copy,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';

interface TeacherDashboardProps {
  classroom: Classroom;
  classroomsList: Classroom[];
  students: Student[];
  pairings: Pairing[];
  sessions: SessionState[];
  onRefresh: () => void;
  onSelectClassroom: (code: string) => void;
  onCreateClassroom: (name: string, grade: string) => Promise<void>;
  onGenerateRandomPairs: () => Promise<void>;
  onCreateManualPair: (student1Id: string, student2Id: string, student3Id?: string, challengeId?: string) => Promise<void>;
  onAssignChallenge: (pairingId: string, challengeId: string) => Promise<void>;
  onAssignAllClassroom: (challengeId: string) => Promise<void>;
  onCreateStudent: (name: string) => Promise<void>;
  onSwitchToStudentView: (studentId: string) => void;
}

type TabType = 'aulas' | 'estudiantes' | 'parejas' | 'retos' | 'seguimiento';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  classroom,
  classroomsList,
  students,
  pairings,
  sessions,
  onRefresh,
  onSelectClassroom,
  onCreateClassroom,
  onGenerateRandomPairs,
  onCreateManualPair,
  onAssignChallenge,
  onAssignAllClassroom,
  onCreateStudent,
  onSwitchToStudentView,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('aulas');

  // New classroom modal/form
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('4to Primaria');
  const [creatingClass, setCreatingClass] = useState(false);

  // New student form
  const [newStudentName, setNewStudentName] = useState('');
  const [creatingStudent, setCreatingStudent] = useState(false);

  // Manual pair selection
  const [manualS1, setManualS1] = useState('');
  const [manualS2, setManualS2] = useState('');
  const [manualS3, setManualS3] = useState('');
  const [manualChallenge, setManualChallenge] = useState('reto_cuento_jardin');
  const [pairingLoading, setPairingLoading] = useState(false);

  // Bulk challenge assignment
  const [bulkChallengeId, setBulkChallengeId] = useState('reto_cuento_jardin');
  const [assigningBulk, setAssigningBulk] = useState(false);

  // Odd-student policy
  const [oddHandlingStrategy, setOddHandlingStrategy] = useState<'trio' | 'helper'>('trio');

  // Inspection modal
  const [inspectingSession, setInspectingSession] = useState<SessionState | null>(null);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreatingClass(true);
    try {
      await onCreateClassroom(newClassName.trim(), newClassGrade);
      setNewClassName('');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    setCreatingStudent(true);
    try {
      await onCreateStudent(newStudentName.trim());
      setNewStudentName('');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleManualPairSubmit = async () => {
    if (!manualS1 || !manualS2 || manualS1 === manualS2) return;
    setPairingLoading(true);
    try {
      await onCreateManualPair(manualS1, manualS2, manualS3 || undefined, manualChallenge);
      setManualS1('');
      setManualS2('');
      setManualS3('');
    } finally {
      setPairingLoading(false);
    }
  };

  const handleAssignBulkSubmit = async () => {
    setAssigningBulk(true);
    try {
      await onAssignAllClassroom(bulkChallengeId);
    } finally {
      setAssigningBulk(false);
    }
  };

  const isOddCount = students.length % 2 !== 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-600" /> Panel Docente CONECTA+
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{classroom.grade}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{classroom.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>Docente: <strong className="text-slate-700">{classroom.teacherName}</strong></span>
            <span>·</span>
            <span>Código de Aula:</span>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono font-bold text-xs border border-indigo-200 transition-colors"
              title="Copiar código de aula para compartir con los alumnos"
            >
              <span>{classroom.code}</span>
              <Copy className="w-3 h-3" />
            </button>
            {copiedCode && <span className="text-[10px] text-emerald-600 font-bold">¡Copiado!</span>}
          </p>
        </div>

        {/* Classroom selector switcher */}
        <div className="flex items-center gap-2">
          <select
            value={classroom.code}
            onChange={(e) => onSelectClassroom(e.target.value)}
            className="text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800"
          >
            {classroomsList.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold"
            title="Refrescar datos"
          >
            ↻
          </button>
        </div>
      </div>

      {/* 5 Explicit Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl overflow-x-auto">
        {[
          { id: 'aulas' as TabType, label: '1. Aulas y Códigos', icon: School },
          { id: 'estudiantes' as TabType, label: `2. Estudiantes (${students.length})`, icon: Users },
          { id: 'parejas' as TabType, label: `3. Parejas (${pairings.length})`, icon: Shuffle },
          { id: 'retos' as TabType, label: '4. Retos Asignados', icon: BookOpen },
          { id: 'seguimiento' as TabType, label: '5. Seguimiento y Progreso', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: AULAS */}
      {/* ========================================================================= */}
      {activeTab === 'aulas' && (
        <div className="space-y-6">
          {/* Create classroom card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Crear Nueva Aula</h3>
                <p className="text-xs text-slate-500">
                  Crea un aula para generar un código único que los estudiantes usarán para vincularse.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClassroomSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Nombre del Aula:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 5° A - Guardianes de la Empatía"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Grado:
                </label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="1er Primaria">1er Primaria</option>
                  <option value="2do Primaria">2do Primaria</option>
                  <option value="3er Primaria">3er Primaria</option>
                  <option value="4to Primaria">4to Primaria</option>
                  <option value="5to Primaria">5to Primaria</option>
                  <option value="6to Primaria">6to Primaria</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!newClassName.trim() || creatingClass}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                  {creatingClass ? 'Creando aula...' : 'Crear Aula y Generar Código'}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Classrooms List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Aulas Registradas ({classroomsList.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classroomsList.map((c) => {
                const isSelected = c.code === classroom.code;
                const enrolledCount = students.filter((s) => s.classroomCode === c.code).length;

                return (
                  <div
                    key={c.code}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-sm'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">{c.grade}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border border-indigo-200">
                        {c.code}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-1">{c.name}</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Docente: {c.teacherName}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-600 font-medium">
                        {enrolledCount} estudiantes incorporados
                      </span>
                      {!isSelected ? (
                        <button
                          onClick={() => onSelectClassroom(c.code)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Administrar esta aula →
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aula activa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ESTUDIANTES */}
      {/* ========================================================================= */}
      {activeTab === 'estudiantes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Estudiantes Incorporados al Aula {classroom.code}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Los alumnos que ingresan con el código de clase aparecen automáticamente en esta lista.
              </p>
            </div>

            {/* Quick add demo student form */}
            <form onSubmit={handleCreateStudent} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Nombre del alumno..."
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white w-48"
              />
              <button
                type="submit"
                disabled={!newStudentName.trim() || creatingStudent}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 disabled:opacity-40"
              >
                + Añadir
              </button>
            </form>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {students.map((std) => {
              const level = getLevelInfo(std.points);
              return (
                <div
                  key={std.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <AvatarRenderer avatar={std.avatar} size="md" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{std.name}</span>
                      <span className="text-[11px] text-blue-700 font-semibold">{level.badgeLevel}</span>
                      <span className="text-[10px] text-slate-400 block">{std.points} pts acumulados</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSwitchToStudentView(std.id)}
                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-bold border border-blue-200"
                    title="Ingresar como este estudiante para probar retos"
                  >
                    Simular
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PAREJAS (EMPRAJAMIENTO) */}
      {/* ========================================================================= */}
      {activeTab === 'parejas' && (
        <div className="space-y-6">
          {/* Automatic random pairing header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-3xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide block mb-1">
                Generador de Parejas Equitativas
              </span>
              <p className="text-xs text-blue-950/80 max-w-xl">
                Empareja automáticamente a los alumnos para promover la integración social. En caso de número impar ({students.length} estudiantes), CONECTA+ permite formar un trío inclusivo para que ningún estudiante quede excluido.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onGenerateRandomPairs}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Generar Parejas Aleatorias
              </button>
            </div>
          </div>

          {/* Odd student notification */}
          {isOddCount && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Regla de inclusión activa:</strong> Hay {students.length} alumnos registrados (impar). La última asignación se agrupa como un trío colaborativo. Ningún niño queda solo.
              </span>
            </div>
          )}

          {/* Current pairings list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairings.map((pair, idx) => {
              const s1 = students.find((s) => s.id === pair.student1Id);
              const s2 = students.find((s) => s.id === pair.student2Id);
              const s3 = pair.student3Id ? students.find((s) => s.id === pair.student3Id) : null;
              const challenge = CHALLENGES.find((c) => c.id === pair.assignedChallengeId);

              return (
                <div
                  key={pair.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Pareja #{idx + 1}</span>
                      {s3 && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Trío Inclusivo
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(pair.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-around bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {s1 && (
                      <div className="flex flex-col items-center text-center">
                        <AvatarRenderer avatar={s1.avatar} size="md" />
                        <span className="text-xs font-bold text-slate-800 mt-1 max-w-[90px] truncate">
                          {s1.name}
                        </span>
                      </div>
                    )}

                    <span className="text-lg text-slate-300 font-bold">🤝</span>

                    {s2 && (
                      <div className="flex flex-col items-center text-center">
                        <AvatarRenderer avatar={s2.avatar} size="md" />
                        <span className="text-xs font-bold text-slate-800 mt-1 max-w-[90px] truncate">
                          {s2.name}
                        </span>
                      </div>
                    )}

                    {s3 && (
                      <>
                        <span className="text-lg text-slate-300 font-bold">+</span>
                        <div className="flex flex-col items-center text-center">
                          <AvatarRenderer avatar={s3.avatar} size="md" />
                          <span className="text-xs font-bold text-slate-800 mt-1 max-w-[90px] truncate">
                            {s3.name}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                      Reto Asignado:
                    </label>
                    <select
                      value={pair.assignedChallengeId || ''}
                      onChange={(e) => onAssignChallenge(pair.id, e.target.value)}
                      className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 bg-white text-slate-800"
                    >
                      {CHALLENGES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} (~{c.durationMinutes} min)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual pair creation */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Emparejamiento Manual por la Docente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Estudiante 1:
                </label>
                <select
                  value={manualS1}
                  onChange={(e) => setManualS1(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Estudiante 2:
                </label>
                <select
                  value={manualS2}
                  onChange={(e) => setManualS2(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {students
                    .filter((s) => s.id !== manualS1)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  3er Integrante (Opcional):
                </label>
                <select
                  value={manualS3}
                  onChange={(e) => setManualS3(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="">-- Ninguno (Pareja) --</option>
                  {students
                    .filter((s) => s.id !== manualS1 && s.id !== manualS2)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Trío)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Reto:
                </label>
                <select
                  value={manualChallenge}
                  onChange={(e) => setManualChallenge(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {CHALLENGES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleManualPairSubmit}
                disabled={!manualS1 || !manualS2 || pairingLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
              >
                Crear Asignación Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: RETOS ASIGNADOS */}
      {/* ========================================================================= */}
      {activeTab === 'retos' && (
        <div className="space-y-6">
          {/* Bulk Assign Tool */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide block mb-1">
                Asignación Masiva para Toda el Aula
              </span>
              <p className="text-xs text-slate-500">
                Asigna una actividad colaborativa a todas las parejas activas del aula {classroom.code} con un solo clic.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={bulkChallengeId}
                onChange={(e) => setBulkChallengeId(e.target.value)}
                className="flex-1 text-xs font-medium p-3 rounded-xl border border-slate-300 bg-white"
              >
                {CHALLENGES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.categoryLabel} ~{c.durationMinutes} min)
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssignBulkSubmit}
                disabled={assigningBulk}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {assigningBulk ? 'Asignando...' : 'Asignar a Todas las Parejas'}
              </button>
            </div>
          </div>

          {/* Library of challenges catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map((ch) => (
              <div key={ch.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide block">
                  {ch.categoryLabel}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{ch.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{ch.description}</p>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <strong>Objetivo:</strong> {ch.educationalObjective}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: SEGUIMIENTO Y PROGRESO */}
      {/* ========================================================================= */}
      {activeTab === 'seguimiento' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Supervisión en Vivo de Aportaciones Mutuas
              </h3>
              <p className="text-xs text-slate-500">
                Monitorea en tiempo real quién está conectado y qué ha redactado cada estudiante.
              </p>
            </div>
            <button
              onClick={onRefresh}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Actualizar Sesiones
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => {
              const s1 = students.find((s) => s.id === sess.student1Id);
              const s2 = students.find((s) => s.id === sess.student2Id);
              const challenge = CHALLENGES.find((c) => c.id === sess.challengeId);

              return (
                <div
                  key={sess.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-blue-800">
                      {challenge?.title || 'Reto en equipo'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        sess.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sess.isCompleted ? '✓ Completado' : '● En Progreso'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          sess.student1Online ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className="font-medium text-slate-800 truncate">
                        {s1?.name}: {sess.student1Online ? 'En línea' : 'Desconectado'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          sess.student2Online ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className="font-medium text-slate-800 truncate">
                        {s2?.name}: {sess.student2Online ? 'En línea' : 'Desconectado'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectingSession(sess)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    Inspeccionar Aportes de Ambos
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      {inspectingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">Supervisión Docente</span>
                <h4 className="text-lg font-bold text-slate-900">
                  {CHALLENGES.find((c) => c.id === inspectingSession.challengeId)?.title}
                </h4>
              </div>
              <button
                onClick={() => setInspectingSession(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {inspectingSession.state.storyParts && inspectingSession.state.storyParts.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Párrafos del Cuento:</span>
                  {inspectingSession.state.storyParts.map((p, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-blue-800">{p.authorName}:</strong> «{p.text}»
                    </div>
                  ))}
                </div>
              )}

              {inspectingSession.state.mathSteps && inspectingSession.state.mathSteps.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Pasos Matemáticos:</span>
                  {inspectingSession.state.mathSteps.map((m, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-emerald-800">{m.authorName} ({m.stepName}):</strong> {m.value}
                    </div>
                  ))}
                </div>
              )}

              {inspectingSession.state.chatMessages && inspectingSession.state.chatMessages.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Diálogo del Equipo:</span>
                  <div className="space-y-1.5">
                    {inspectingSession.state.chatMessages.map((msg, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg text-slate-700">
                        <strong>{msg.senderName}:</strong> {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectingSession(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
