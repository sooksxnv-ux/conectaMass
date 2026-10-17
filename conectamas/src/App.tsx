import React, { useState, useEffect } from 'react';
import { Classroom, Student, Pairing, PairRequest, SessionState, ChallengeDef, AvatarConfig } from './types';
import {
  CHALLENGES,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  INITIAL_PAIRINGS,
} from './data/challenges';
import { Navbar, MainNavView } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { ChallengesLibrary } from './components/ChallengesLibrary';
import { PartnerStatusCard } from './components/PartnerStatusCard';
import { StudentProfile } from './components/StudentProfile';
import { CollaborationSession } from './components/CollaborationSession';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AvatarEditorSection } from './components/AvatarEditorSection';
import { AdventureMapSection } from './components/AdventureMapSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { DualStudentTester } from './components/DualStudentTester';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  text: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(INITIAL_CLASSROOMS[0]);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [pairings, setPairings] = useState<Pairing[]>(INITIAL_PAIRINGS);
  const [pairRequests, setPairRequests] = useState<PairRequest[]>([]);
  const [sessions, setSessions] = useState<SessionState[]>([]);

  // Auth & View state
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [activeView, setActiveView] = useState<MainNavView>('library');

  // Active collaboration session state
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDef | null>(null);

  // Non-blocking toast state (avoids window.alert)
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initial data load from backend
  const loadClassroomData = async (code: string = 'CONECTA4B') => {
    try {
      const [classRes, allRes] = await Promise.all([
        fetch(`/api/classrooms/${code}`),
        fetch('/api/classrooms'),
      ]);

      if (allRes.ok) {
        const allData = await allRes.json();
        if (allData.classrooms && Array.isArray(allData.classrooms)) {
          setClassrooms(allData.classrooms);
        }
      }

      if (classRes.ok) {
        const data = await classRes.json();
        if (data.classroom) setCurrentClassroom(data.classroom);
        if (data.students && data.students.length > 0) setStudents(data.students);
        if (data.pairings) setPairings(data.pairings);
        if (data.pairRequests) setPairRequests(data.pairRequests);

        // Fetch active sessions for this classroom
        const activeSessionsList: SessionState[] = [];
        if (Array.isArray(data.pairings)) {
          for (const p of data.pairings) {
            if (p.activeSessionId) {
              try {
                const sRes = await fetch(`/api/sessions/${p.activeSessionId}`);
                if (sRes.ok) {
                  activeSessionsList.push(await sRes.json());
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
        setSessions(activeSessionsList);
      }
    } catch (err) {
      console.warn('Backend loading note, using synchronized state:', err);
    }
  };

  useEffect(() => {
    loadClassroomData('CONECTA4B');
  }, []);

  // Update current student from list if students updated
  useEffect(() => {
    if (currentStudent) {
      const updated = students.find((s) => s.id === currentStudent.id);
      if (updated) {
        setCurrentStudent(updated);
      }
    }
  }, [students]);

  // Handle student login
  const handleStudentLogin = async (studentId: string, classroomCode: string) => {
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classroomCode }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStudent(data.student);
        setIsTeacherMode(false);
        setActiveView('library');
        await loadClassroomData(classroomCode);
        showToast(`¡Bienvenido a CONECTA+, ${data.student.name}!`, 'success');
      } else {
        const local = students.find((s) => s.id === studentId);
        if (local) {
          setCurrentStudent(local);
          setIsTeacherMode(false);
          setActiveView('library');
          showToast(`¡Bienvenido a CONECTA+, ${local.name}!`, 'success');
        } else {
          showToast('No se pudo encontrar este perfil de estudiante.', 'error');
        }
      }
    } catch (e: any) {
      const local = students.find((s) => s.id === studentId);
      if (local) {
        setCurrentStudent(local);
        setIsTeacherMode(false);
        setActiveView('library');
      }
    }
  };

  // Student registration
  const handleStudentRegister = async (name: string, classroomCode: string, pin?: string) => {
    try {
      const res = await fetch('/api/auth/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, classroomCode, pin }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStudent(data.student);
        setIsTeacherMode(false);
        setActiveView('library');
        await loadClassroomData(classroomCode);
        showToast(`¡Cuenta creada con éxito! Bienvenido a CONECTA+, ${data.student.name}.`, 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'No se pudo registrar al estudiante.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al registrar estudiante.', 'error');
    }
  };

  // Quick demo login
  const handleQuickDemoLogin = async (studentId: string) => {
    await handleStudentLogin(studentId, 'CONECTA4B');
  };

  // Handle teacher login
  const handleTeacherLogin = async (classroomCode: string) => {
    await loadClassroomData(classroomCode);
    setIsTeacherMode(true);
    setActiveView('teacher');
    showToast('Ingresaste al Panel de Supervisión Docente', 'info');
  };

  // Logout
  const handleLogout = () => {
    setCurrentStudent(null);
    setIsTeacherMode(false);
    setActiveSession(null);
    setActiveView('library');
    showToast('Sesión cerrada correctamente', 'info');
  };

  // Find pairing for current student
  const currentPairing = currentStudent
    ? pairings.find(
        (p) =>
          p.classroomCode === currentStudent.classroomCode &&
          (p.student1Id === currentStudent.id ||
            p.student2Id === currentStudent.id ||
            p.student3Id === currentStudent.id)
      ) || null
    : null;

  // Find partner
  let currentPartner: Student | undefined;
  let trioPartner: Student | undefined;

  if (currentPairing && currentStudent) {
    if (currentPairing.student1Id === currentStudent.id) {
      currentPartner = students.find((s) => s.id === currentPairing.student2Id);
      if (currentPairing.student3Id) {
        trioPartner = students.find((s) => s.id === currentPairing.student3Id);
      }
    } else if (currentPairing.student2Id === currentStudent.id) {
      currentPartner = students.find((s) => s.id === currentPairing.student1Id);
      if (currentPairing.student3Id) {
        trioPartner = students.find((s) => s.id === currentPairing.student3Id);
      }
    } else if (currentPairing.student3Id === currentStudent.id) {
      currentPartner = students.find((s) => s.id === currentPairing.student1Id);
      trioPartner = students.find((s) => s.id === currentPairing.student2Id);
    }
  }

  const assignedChallenge = currentPairing?.assignedChallengeId
    ? CHALLENGES.find((c) => c.id === currentPairing.assignedChallengeId) || CHALLENGES[0]
    : CHALLENGES[0];

  // Send pair request (Student A -> Student B)
  const handleSendPairRequest = async (targetStudentId: string) => {
    if (!currentStudent) return;
    try {
      const res = await fetch('/api/pair-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromStudentId: currentStudent.id,
          toStudentId: targetStudentId,
          classroomCode: currentStudent.classroomCode,
        }),
      });

      if (res.ok) {
        await loadClassroomData(currentStudent.classroomCode);
        showToast('¡Invitación enviada a tu compañero! Esperando su confirmación.', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Error al enviar invitación.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al enviar la invitación.', 'error');
    }
  };

  // Accept pair request
  const handleAcceptPairRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/pair-requests/${requestId}/accept`, {
        method: 'POST',
      });
      if (res.ok) {
        if (currentStudent) {
          await loadClassroomData(currentStudent.classroomCode);
          showToast('¡Pareja formada con éxito! Ya pueden realizar retos juntos.', 'success');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Enter collaborative session
  const handleEnterSession = async (pairingId: string, challengeDef?: ChallengeDef) => {
    if (!currentStudent) return;
    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingId,
          studentId: currentStudent.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
        setSelectedChallenge(
          challengeDef ||
            CHALLENGES.find((c) => c.id === data.session.challengeId) ||
            CHALLENGES[0]
        );
        setActiveView('session');
      }
    } catch (e) {
      console.error('Error entering session:', e);
    }
  };

  // Generate random pairs (Teacher)
  const handleGenerateRandomPairs = async () => {
    if (!currentClassroom) return;
    try {
      const res = await fetch(`/api/classrooms/${currentClassroom.code}/random-pairs`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        await loadClassroomData(currentClassroom.code);
        if (data.trioExplanation) {
          showToast(`¡Parejas formadas! ${data.trioExplanation}`, 'success');
        } else {
          showToast('¡Parejas aleatorias generadas con éxito para el aula!', 'success');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Error al generar parejas automáticas.', 'error');
    }
  };

  // Create manual pair (Teacher)
  const handleCreateManualPair = async (
    student1Id: string,
    student2Id: string,
    student3Id?: string,
    challengeId?: string
  ) => {
    if (!currentClassroom) return;
    try {
      const res = await fetch('/api/pairings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomCode: currentClassroom.code,
          student1Id,
          student2Id,
          student3Id,
          challengeId,
        }),
      });
      if (res.ok) {
        await loadClassroomData(currentClassroom.code);
        showToast('Pareja asignada exitosamente.', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Assign challenge to pair (Teacher)
  const handleAssignChallenge = async (pairingId: string, challengeId: string) => {
    try {
      const res = await fetch(`/api/pairings/${pairingId}/assign-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      if (res.ok && currentClassroom) {
        await loadClassroomData(currentClassroom.code);
        showToast('Reto asignado a la pareja.', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk challenge assignment to all classroom pairs (Teacher)
  const handleAssignAllClassroom = async (challengeId: string) => {
    if (!currentClassroom) return;
    try {
      const res = await fetch(`/api/classrooms/${currentClassroom.code}/assign-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      if (res.ok) {
        await loadClassroomData(currentClassroom.code);
        showToast('¡Reto asignado a todas las parejas del aula!', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Select classroom (Teacher)
  const handleSelectClassroom = async (code: string) => {
    await loadClassroomData(code);
  };

  // Create classroom (Teacher)
  const handleCreateClassroom = async (name: string, grade: string) => {
    try {
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          grade,
          teacherName: currentClassroom?.teacherName || 'Prof. Valeria Gómez',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClassrooms((prev) => [...prev, data.classroom]);
        setCurrentClassroom(data.classroom);
        await loadClassroomData(data.classroom.code);
        showToast(`¡Aula "${name}" creada! Código: ${data.classroom.code}`, 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Error al crear aula.', 'error');
    }
  };

  // Create student demo account (Teacher)
  const handleCreateStudent = async (name: string) => {
    if (!currentClassroom) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          classroomCode: currentClassroom.code,
        }),
      });
      if (res.ok) {
        await loadClassroomData(currentClassroom.code);
        showToast(`Estudiante ${name} registrado en el aula.`, 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save student avatar
  const handleSaveAvatar = async (newAvatar: AvatarConfig) => {
    if (!currentStudent) return;
    try {
      const res = await fetch(`/api/students/${currentStudent.id}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newAvatar }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentStudent((prev) => (prev ? { ...prev, avatar: data.avatar } : null));
        if (currentClassroom) {
          await loadClassroomData(currentClassroom.code);
        }
        showToast('¡Tu avatar ha sido guardado exitosamente!', 'success');
      }
    } catch (e) {
      console.error('Error saving avatar:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
      {/* Non-intrusive Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in max-w-sm">
          <div
            className={`p-3.5 rounded-2xl shadow-lg border flex items-center gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="flex-1">{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Bar with Independent 'Mi Avatar' Link */}
      <Navbar
        currentStudent={currentStudent}
        currentClassroom={currentClassroom}
        isTeacherMode={isTeacherMode}
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'teacher') {
            setIsTeacherMode(true);
            setActiveView('teacher');
          } else {
            setIsTeacherMode(false);
            setActiveView(view);
          }
        }}
        onLogout={handleLogout}
        onSwitchStudent={() => setCurrentStudent(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        {!currentStudent && !isTeacherMode ? (
          /* LOGIN & WELCOME VIEW */
          <LoginView
            classrooms={classrooms}
            students={students}
            onStudentLogin={handleStudentLogin}
            onStudentRegister={handleStudentRegister}
            onTeacherLogin={handleTeacherLogin}
            onQuickDemoLogin={handleQuickDemoLogin}
          />
        ) : isTeacherMode && currentClassroom ? (
          /* TEACHER DASHBOARD VIEW (With all 5 tabs and complete controls) */
          <TeacherDashboard
            classroom={currentClassroom}
            classroomsList={classrooms}
            students={students}
            pairings={pairings}
            sessions={sessions}
            onRefresh={() => loadClassroomData(currentClassroom.code)}
            onSelectClassroom={handleSelectClassroom}
            onCreateClassroom={handleCreateClassroom}
            onGenerateRandomPairs={handleGenerateRandomPairs}
            onCreateManualPair={handleCreateManualPair}
            onAssignChallenge={handleAssignChallenge}
            onAssignAllClassroom={handleAssignAllClassroom}
            onCreateStudent={handleCreateStudent}
            onSwitchToStudentView={async (sId) => {
              const std = students.find((s) => s.id === sId);
              if (std) {
                setCurrentStudent(std);
                setIsTeacherMode(false);
                setActiveView('library');
              }
            }}
          />
        ) : activeView === 'session' && activeSession && selectedChallenge && currentStudent && currentPartner ? (
          /* ACTIVE COLLABORATIVE CHALLENGE VIEW */
          <CollaborationSession
            currentStudent={currentStudent}
            partner={currentPartner}
            trioPartner={trioPartner}
            challenge={selectedChallenge}
            initialSession={activeSession}
            onBack={() => {
              setActiveSession(null);
              setActiveView('library');
              if (currentClassroom) loadClassroomData(currentClassroom.code);
            }}
            onSessionUpdated={(updated) => {
              setActiveSession(updated);
            }}
          />
        ) : activeView === 'partner' && currentStudent ? (
          /* MI COMPAÑERO DE EQUIPO VIEW */
          <div className="max-w-4xl mx-auto space-y-6">
            <PartnerStatusCard
              currentStudent={currentStudent}
              classmates={students}
              pairing={currentPairing}
              pairRequests={pairRequests}
              assignedChallenge={assignedChallenge}
              onSendRequest={handleSendPairRequest}
              onAcceptRequest={handleAcceptPairRequest}
              onEnterSession={(pId) => handleEnterSession(pId, assignedChallenge)}
            />
          </div>
        ) : activeView === 'avatar' && currentStudent ? (
          /* NUEVA SECCIÓN INDEPENDIENTE: MI AVATAR */
          <AvatarEditorSection
            initialAvatar={currentStudent.avatar}
            studentName={currentStudent.name}
            onSave={handleSaveAvatar}
            onCancel={() => setActiveView('library')}
          />
        ) : activeView === 'adventure' && currentStudent ? (
          /* MAPA DE AVENTURA Y SISTEMA DE NIVELES */
          <AdventureMapSection
            currentStudent={currentStudent}
            currentPairing={currentPairing}
            partner={currentPartner}
            onLaunchStationChallenge={(ch) => {
              if (currentPairing) {
                handleEnterSession(currentPairing.id, ch);
              } else {
                setActiveView('partner');
                showToast('Primero debes vincularte con tu compañero para iniciar la estación.', 'info');
              }
            }}
            onNavigateToPartner={() => setActiveView('partner')}
          />
        ) : activeView === 'recommendations' && currentStudent ? (
          /* CONSEJOS Y CONVIVENCIA ESCOLAR */
          <RecommendationsSection
            currentStudent={currentStudent}
            sessions={sessions}
            partnerName={currentPartner?.name}
          />
        ) : activeView === 'profile' && currentStudent ? (
          /* PROGRESO, NIVELES E INSIGNIAS */
          <StudentProfile
            student={currentStudent}
            onOpenAvatarEditor={() => setActiveView('avatar')}
          />
        ) : (
          /* CHALLENGES LIBRARY (DEFAULT STUDENT VIEW) */
          currentStudent && (
            <ChallengesLibrary
              currentStudent={currentStudent}
              pairing={currentPairing}
              partner={currentPartner}
              onSelectChallenge={(challenge) => {
                if (currentPairing) {
                  handleEnterSession(currentPairing.id, challenge);
                } else {
                  setActiveView('partner');
                }
              }}
              onNavigateToPairing={() => setActiveView('partner')}
            />
          )
        )}
      </main>

      {/* Multi-student Tester Widget for instantaneous verification */}
      {currentStudent && students.length > 1 && (
        <DualStudentTester
          currentStudent={currentStudent}
          students={students}
          onSwitchStudent={(sId) => {
            const std = students.find((s) => s.id === sId);
            if (std) {
              setCurrentStudent(std);
              if (activeView === 'session' && currentPairing) {
                handleEnterSession(currentPairing.id, selectedChallenge || undefined);
              }
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-slate-800">
            CONECTA+ · Plataforma Educativa Inclusiva y Colaborativa
          </span>
          <span className="text-slate-400">
            Diseñada para instituciones educativas de primaria · «¡Juntos hacemos una escuela mejor!»
          </span>
        </div>
      </footer>
    </div>
  );
}
