import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import { HERO_IMAGE } from '../data/challenges';
import { AvatarRenderer } from './AvatarRenderer';
import {
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  School,
  UserPlus,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface LoginViewProps {
  classrooms: Classroom[];
  students: Student[];
  onStudentLogin: (studentId: string, classroomCode: string) => Promise<void>;
  onStudentRegister: (name: string, classroomCode: string, pin?: string) => Promise<void>;
  onTeacherLogin: (classroomCode: string) => void;
  onQuickDemoLogin: (studentId: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  classrooms,
  students,
  onStudentLogin,
  onStudentRegister,
  onTeacherLogin,
  onQuickDemoLogin,
}) => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Student login fields
  const [selectedClassroomCode, setSelectedClassroomCode] = useState<string>('CONECTA4B');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_1');

  // Student register fields
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [joinClassCode, setJoinClassCode] = useState<string>('CONECTA4B');

  // Teacher fields
  const [classroomInput, setClassroomInput] = useState<string>('CONECTA4B');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classroomStudents = students.filter(
    (s) => s.classroomCode === selectedClassroomCode
  );

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        if (!selectedStudentId || !selectedClassroomCode) return;
        await onStudentLogin(selectedStudentId, selectedClassroomCode);
      } else {
        if (!newStudentName.trim() || !joinClassCode.trim()) {
          setError('Ingresa tu nombre y el código de aula.');
          return;
        }
        await onStudentRegister(newStudentName.trim(), joinClassCode.trim().toUpperCase());
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el acceso.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTeacherLogin(classroomInput.toUpperCase());
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      {/* Welcome Hero Container */}
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Top Hero Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 text-white">
          <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-300 mb-4 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma Educativa para Primaria (6 a 12 años)
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-display">
                CONECTA<span className="text-amber-400">+</span>
              </h1>

              <p className="text-xl md:text-2xl font-bold text-amber-200 font-display">
                «¡Juntos hacemos una escuela mejor!»
              </p>

              <p className="text-xs md:text-sm text-sky-100 mt-4 leading-relaxed max-w-md">
                Un entorno seguro para fortalecer la convivencia escolar y prevenir la exclusión mediante retos de cooperación mutua en parejas.
              </p>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs text-sky-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Cuentas de demostración seguras sin recolección de datos sensibles de menores.</span>
            </div>
          </div>

          <div className="md:col-span-5 relative min-h-[220px] md:min-h-full bg-slate-900">
            <img
              src={HERO_IMAGE}
              alt="Estudiantes colaborando en equipo"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-blue-900/60 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Access Body: Role Switch & Forms */}
        <div className="p-8 md:p-10 bg-slate-50/60">
          {/* Segmented Control */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl max-w-sm w-full">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === 'student'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                Acceso Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  role === 'teacher'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Acceso Docente
              </button>
            </div>
          </div>

          {/* STUDENT FLOW */}
          {role === 'student' ? (
            <div className="max-w-xl mx-auto space-y-5">
              {/* Login vs Register Subtabs */}
              <div className="flex items-center justify-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    mode === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Ya tengo cuenta en el aula
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    mode === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Crear cuenta e incorporarme con código
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                {mode === 'login' ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                        1. Selecciona tu Aula:
                      </label>
                      <select
                        value={selectedClassroomCode}
                        onChange={(e) => {
                          setSelectedClassroomCode(e.target.value);
                          const stds = students.filter((s) => s.classroomCode === e.target.value);
                          if (stds.length > 0) setSelectedStudentId(stds[0].id);
                        }}
                        className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500"
                      >
                        {classrooms.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code}) - {c.teacherName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                        2. Elige tu Perfil de Estudiante:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                        {classroomStudents.map((std) => (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => setSelectedStudentId(std.id)}
                            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                              selectedStudentId === std.id
                                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <AvatarRenderer avatar={std.avatar} size="xs" />
                            <span className="text-xs truncate">{std.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  /* REGISTER FLOW: Name + Classroom Code */
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                        1. Tu Nombre o Apodo:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Daniel Morales"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                        2. Código de Clase proporcionado por tu Docente:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: CONECTA4B"
                        value={joinClassCode}
                        onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
                        className="w-full text-xs font-bold tracking-wider uppercase p-3 rounded-2xl border border-slate-300 bg-white text-slate-800 focus:border-blue-500"
                        required
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Códigos demo disponibles: <strong>CONECTA4B</strong> o <strong>CONECTA3A</strong>
                      </span>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || (mode === 'login' && !selectedStudentId)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {loading
                      ? 'Ingresando...'
                      : mode === 'login'
                      ? '¡Entrar a CONECTA+!'
                      : '¡Crear Perfil e Incorporarme al Aula!'}
                  </button>
                </div>
              </form>

              {/* Quick Demo Access for Testing */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
                  Acceso rápido con pareja demostrativa:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onQuickDemoLogin('std_1')}
                    className="p-3 rounded-2xl bg-white border border-blue-200 hover:border-blue-400 shadow-2xs flex items-center gap-2.5 text-left transition-colors"
                  >
                    <AvatarRenderer avatar={students[0]?.avatar} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Mateo Quispe</span>
                      <span className="text-[10px] text-blue-600 font-medium">Estudiante 1</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickDemoLogin('std_2')}
                    className="p-3 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 shadow-2xs flex items-center gap-2.5 text-left transition-colors"
                  >
                    <AvatarRenderer avatar={students[1]?.avatar} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Sofía Morales</span>
                      <span className="text-[10px] text-amber-600 font-medium">Estudiante 2 (Compañera)</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TEACHER LOGIN */
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Acceso Independiente para Docentes</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona aulas, genera códigos de clase, forma parejas y supervisa la colaboración.
                </p>
              </div>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                    Código del Aula a Administrar:
                  </label>
                  <input
                    type="text"
                    value={classroomInput}
                    onChange={(e) => setClassroomInput(e.target.value.toUpperCase())}
                    placeholder="Ej: CONECTA4B"
                    className="w-full text-xs font-bold tracking-wider uppercase p-3 rounded-2xl border border-slate-300 bg-white focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Aulas demo: <strong>CONECTA4B</strong> (4° Primaria) o <strong>CONECTA3A</strong> (3° Primaria)
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <School className="w-4 h-4" />
                    Ingresar al Panel Docente
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
