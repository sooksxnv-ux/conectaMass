import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.resolve(__dirname, 'conecta_db.json');

// Interface types
interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothing: string;
  clothingColor: string;
  accessory: string;
  expression: string;
}

interface Student {
  id: string;
  name: string;
  classroomCode: string;
  avatar: AvatarConfig;
  points: number;
  badges: string[];
  completedChallengesCount: number;
  isOnline: boolean;
  lastSeen: number;
  pin: string;
}

interface Pairing {
  id: string;
  classroomCode: string;
  student1Id: string;
  student2Id: string;
  student3Id?: string; // Optional trio in case of odd number of students
  activeSessionId?: string;
  assignedChallengeId?: string;
  status: 'active' | 'completed';
  createdAt: number;
}

interface PairRequest {
  id: string;
  fromStudentId: string;
  toStudentId: string;
  classroomCode: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

interface SessionState {
  id: string;
  pairingId: string;
  challengeId: string;
  classroomCode: string;
  student1Id: string;
  student2Id: string;
  student3Id?: string;
  student1Online: boolean;
  student2Online: boolean;
  student1LastHeartbeat: number;
  student2LastHeartbeat: number;
  state: {
    storyParts?: { authorId: string; authorName: string; text: string; step: number; timestamp: number }[];
    storyTitle?: string;
    mathSteps?: { stepId: string; stepName: string; authorId: string; authorName: string; value: string; notes: string; verifiedByPartner: boolean }[];
    playgroundItems?: { id: string; type: string; name: string; placedBy: string; x: number; y: number; icon: string }[];
    cluesShared?: { clueId: string; title: string; text: string; revealedBy: string }[];
    puzzleAnswers?: { [key: string]: string };
    dilemmaVotes?: { student1Choice?: string; student2Choice?: string; agreementReflection?: string };
    muralCommitments?: { id: string; authorId: string; authorName: string; text: string; category: string }[];
    chatMessages?: { id: string; senderId: string; senderName: string; text: string; timestamp: number }[];
  };
  student1ReadyToFinish: boolean;
  student2ReadyToFinish: boolean;
  isCompleted: boolean;
  completedAt?: number;
  earnedPoints: number;
  badgesUnlocked: string[];
  reflection?: {
    recommendationGiven: string;
    rating: number;
  };
}

interface Database {
  classrooms: {
    code: string;
    name: string;
    grade: string;
    teacherName: string;
  }[];
  students: Student[];
  pairings: Pairing[];
  pairRequests: PairRequest[];
  sessions: SessionState[];
}

// Initial default database with rich educational demo data
const defaultDb: Database = {
  classrooms: [
    {
      code: 'CONECTA4B',
      name: '4° B - Los Exploradores Inclusivos',
      grade: '4to Primaria',
      teacherName: 'Prof. Valeria Gómez',
    },
    {
      code: 'CONECTA3A',
      name: '3° A - Estrellas de la Empatía',
      grade: '3er Primaria',
      teacherName: 'Prof. Carlos Mendoza',
    },
  ],
  students: [
    {
      id: 'std_1',
      name: 'Mateo Quispe',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#E0A899',
        hairStyle: 'curly',
        hairColor: '#2C1B18',
        clothing: 'hoodie',
        clothingColor: '#3B82F6',
        accessory: 'glasses',
        expression: 'cheerful',
      },
      points: 240,
      badges: ['primer_duo', 'escucha_activa'],
      completedChallengesCount: 2,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_2',
      name: 'Sofía Morales',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#FCD5B5',
        hairStyle: 'braids',
        hairColor: '#4A2810',
        clothing: 'vest',
        clothingColor: '#F59E0B',
        accessory: 'clip',
        expression: 'smiling',
      },
      points: 240,
      badges: ['primer_duo', 'escucha_activa'],
      completedChallengesCount: 2,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_3',
      name: 'Lucas Benítez',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#8D5524',
        hairStyle: 'puff',
        hairColor: '#171717',
        clothing: 'stripes',
        clothingColor: '#10B981',
        accessory: 'headphones',
        expression: 'curious',
      },
      points: 120,
      badges: ['primer_duo'],
      completedChallengesCount: 1,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_4',
      name: 'Valentina Rojas',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#F3C59E',
        hairStyle: 'wavy_long',
        hairColor: '#6B3A19',
        clothing: 'jacket',
        clothingColor: '#EC4899',
        accessory: 'hearing_aid',
        expression: 'cheerful',
      },
      points: 120,
      badges: ['primer_duo'],
      completedChallengesCount: 1,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_5',
      name: 'Diego Flores',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#E8B382',
        hairStyle: 'short',
        hairColor: '#1E293B',
        clothing: 'hoodie',
        clothingColor: '#8B5CF6',
        accessory: 'cap',
        expression: 'cheerful',
      },
      points: 60,
      badges: ['primer_duo'],
      completedChallengesCount: 0,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_6',
      name: 'Camila Torres',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#D1926B',
        hairStyle: 'straight',
        hairColor: '#1F2937',
        clothing: 'vest',
        clothingColor: '#06B6D4',
        accessory: 'badge',
        expression: 'smiling',
      },
      points: 60,
      badges: ['primer_duo'],
      completedChallengesCount: 0,
      isOnline: false,
      lastSeen: Date.now(),
    },
    {
      id: 'std_7',
      name: 'Alejandro Núñez',
      classroomCode: 'CONECTA4B',
      pin: '1234',
      avatar: {
        skinTone: '#F7D0B2',
        hairStyle: 'curly',
        hairColor: '#9A3412',
        clothing: 'stripes',
        clothingColor: '#F97316',
        accessory: 'none',
        expression: 'curious',
      },
      points: 0,
      badges: [],
      completedChallengesCount: 0,
      isOnline: false,
      lastSeen: Date.now(),
    },
  ],
  pairings: [
    {
      id: 'pair_1',
      classroomCode: 'CONECTA4B',
      student1Id: 'std_1',
      student2Id: 'std_2',
      assignedChallengeId: 'reto_cuento_jardin',
      activeSessionId: 'sess_demo_1',
      status: 'active',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'pair_2',
      classroomCode: 'CONECTA4B',
      student1Id: 'std_3',
      student2Id: 'std_4',
      assignedChallengeId: 'reto_patio_inclusivo',
      activeSessionId: 'sess_demo_2',
      status: 'active',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'pair_3',
      classroomCode: 'CONECTA4B',
      student1Id: 'std_5',
      student2Id: 'std_6',
      student3Id: 'std_7', // Example trio showing how odd numbers are included harmoniously
      assignedChallengeId: 'reto_matematicas_fiesta',
      status: 'active',
      createdAt: Date.now() - 3600000,
    },
  ],
  pairRequests: [],
  sessions: [
    {
      id: 'sess_demo_1',
      pairingId: 'pair_1',
      challengeId: 'reto_cuento_jardin',
      classroomCode: 'CONECTA4B',
      student1Id: 'std_1',
      student2Id: 'std_2',
      student1Online: false,
      student2Online: false,
      student1LastHeartbeat: 0,
      student2LastHeartbeat: 0,
      state: {
        storyTitle: 'El Cofre Mágico de la Amistad',
        storyParts: [
          {
            authorId: 'std_1',
            authorName: 'Mateo Quispe',
            text: 'En el recreo soleado, Mateo y Sofía caminaron cerca del gran girasol del huerto y descubrieron una caja de madera antigua decorada con hojas doradas.',
            step: 1,
            timestamp: Date.now() - 1800000,
          },
        ],
        chatMessages: [
          {
            id: 'msg_1',
            senderId: 'std_1',
            senderName: 'Mateo',
            text: '¡Hola Sofi! Ya escribí el inicio del cuento, ¿qué te parece agregar la sorpresa que encontramos adentro?',
            timestamp: Date.now() - 1700000,
          },
        ],
      },
      student1ReadyToFinish: false,
      student2ReadyToFinish: false,
      isCompleted: false,
      earnedPoints: 100,
      badgesUnlocked: [],
    },
  ],
};

// Database persistence helpers
function loadDatabase(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, using defaults', err);
  }
  return defaultDb;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file', err);
  }
}

let db = loadDatabase();

// SSE listeners map for real-time live events: sessionId -> Set of response objects
const sseListeners = new Map<string, Set<Response>>();

function broadcastToSession(sessionId: string, eventName: string, data: any) {
  const clients = sseListeners.get(sessionId);
  if (clients && clients.size > 0) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try {
        res.write(payload);
      } catch (e) {
        clients.delete(res);
      }
    }
  }
}

// Presence check timer - marks students offline if no heartbeat within 12 seconds
setInterval(() => {
  const now = Date.now();
  let changed = false;

  for (const session of db.sessions) {
    const s1Was = session.student1Online;
    const s2Was = session.student2Online;

    session.student1Online = now - session.student1LastHeartbeat < 12000;
    session.student2Online = now - session.student2LastHeartbeat < 12000;

    if (s1Was !== session.student1Online || s2Was !== session.student2Online) {
      changed = true;
      broadcastToSession(session.id, 'presence_update', {
        student1Online: session.student1Online,
        student2Online: session.student2Online,
      });
    }
  }

  for (const student of db.students) {
    const was = student.isOnline;
    student.isOnline = now - student.lastSeen < 12000;
    if (was !== student.isOnline) changed = true;
  }

  if (changed) {
    saveDatabase(db);
  }
}, 4000);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json());

  // --------------------------------------------------------------------------
  // API ROUTES
  // --------------------------------------------------------------------------

  // Get classroom info by code
  app.get('/api/classrooms/:code', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const classroom = db.classrooms.find((c) => c.code === code);
    if (!classroom) {
      res.status(404).json({ error: 'Aula no encontrada con este código.' });
      return;
    }

    const students = db.students.filter((s) => s.classroomCode === code);
    const pairings = db.pairings.filter((p) => p.classroomCode === code);
    const pairRequests = db.pairRequests.filter((r) => r.classroomCode === code);

    res.json({
      classroom,
      students,
      pairings,
      pairRequests,
    });
  });

  // Create a new classroom
  app.post('/api/classrooms', (req: Request, res: Response) => {
    const { name, grade, teacherName } = req.body;
    if (!name || !teacherName) {
      res.status(400).json({ error: 'Nombre del aula y del docente son requeridos.' });
      return;
    }

    const code = 'CONECTA' + Math.floor(100 + Math.random() * 900);
    const newClassroom = {
      code,
      name,
      grade: grade || 'Primaria',
      teacherName,
    };
    db.classrooms.push(newClassroom);
    saveDatabase(db);

    res.json({ success: true, classroom: newClassroom });
  });

  // Get all classrooms (for teacher or selector)
  app.get('/api/classrooms', (_req: Request, res: Response) => {
    res.json({ classrooms: db.classrooms });
  });

  // Student joins classroom by code
  app.post('/api/classrooms/join', (req: Request, res: Response) => {
    const { studentId, classroomCode } = req.body;
    if (!studentId || !classroomCode) {
      res.status(400).json({ error: 'ID de estudiante y código de aula son requeridos.' });
      return;
    }

    const code = classroomCode.toUpperCase().trim();
    const classroom = db.classrooms.find((c) => c.code === code);
    if (!classroom) {
      res.status(404).json({ error: 'El código de aula ingresado no existe. Pide el código a tu docente.' });
      return;
    }

    const student = db.students.find((s) => s.id === studentId);
    if (!student) {
      res.status(404).json({ error: 'Estudiante no encontrado.' });
      return;
    }

    student.classroomCode = code;
    student.lastSeen = Date.now();
    student.isOnline = true;
    saveDatabase(db);

    res.json({
      success: true,
      message: `¡Te has incorporado exitosamente al aula "${classroom.name}"!`,
      classroom,
      student,
    });
  });

  // Student Register Account (creates new account and links to classroom)
  app.post('/api/auth/register-student', (req: Request, res: Response) => {
    const { name, classroomCode, pin } = req.body;
    if (!name) {
      res.status(400).json({ error: 'El nombre o apodo es requerido.' });
      return;
    }

    const code = classroomCode ? classroomCode.toUpperCase().trim() : 'CONECTA4B';
    const classroom = db.classrooms.find((c) => c.code === code);
    if (!classroom) {
      res.status(404).json({ error: 'Código de aula inválido.' });
      return;
    }

    const newStudent: Student = {
      id: 'std_' + Date.now(),
      name: name.trim(),
      classroomCode: code,
      pin: pin || '1234',
      avatar: {
        skinTone: '#FCD5B5',
        hairStyle: 'lacio_largo',
        hairColor: '#4A2810',
        clothing: 'sudadera',
        clothingColor: '#3B82F6',
        accessory: 'none',
        expression: 'smiling',
      },
      points: 0,
      badges: [],
      completedChallengesCount: 0,
      isOnline: true,
      lastSeen: Date.now(),
    };

    db.students.push(newStudent);
    saveDatabase(db);

    res.json({ success: true, student: newStudent, classroom });
  });

  // Student login / verify
  app.post('/api/auth/student-login', (req: Request, res: Response) => {
    const { studentId, classroomCode, pin } = req.body;
    const student = db.students.find(
      (s) => s.id === studentId && s.classroomCode === classroomCode?.toUpperCase()
    );

    if (!student) {
      res.status(404).json({ error: 'Estudiante no encontrado en esta aula.' });
      return;
    }

    student.isOnline = true;
    student.lastSeen = Date.now();
    saveDatabase(db);

    res.json({ success: true, student });
  });

  // Teacher login (demo)
  app.post('/api/auth/teacher-login', (req: Request, res: Response) => {
    const { email } = req.body;
    // For demo institutions, allow direct login as default teacher or custom
    const teacher = {
      name: 'Prof. Valeria Gómez',
      email: email || 'docente@escuela.edu',
      classrooms: db.classrooms,
    };
    res.json({ success: true, teacher });
  });

  // Create student demo account
  app.post('/api/students', (req: Request, res: Response) => {
    const { name, classroomCode } = req.body;
    if (!name || !classroomCode) {
      res.status(400).json({ error: 'Nombre y código de aula son requeridos.' });
      return;
    }

    const newStudent: Student = {
      id: 'std_' + Date.now(),
      name,
      classroomCode: classroomCode.toUpperCase(),
      pin: '1234',
      avatar: {
        skinTone: '#FCD5B5',
        hairStyle: 'short',
        hairColor: '#4A2810',
        clothing: 'hoodie',
        clothingColor: '#3B82F6',
        accessory: 'none',
        expression: 'smiling',
      },
      points: 0,
      badges: [],
      completedChallengesCount: 0,
      isOnline: true,
      lastSeen: Date.now(),
    };

    db.students.push(newStudent);
    saveDatabase(db);
    res.json({ success: true, student: newStudent });
  });

  // Update avatar
  app.put('/api/students/:id/avatar', (req: Request, res: Response) => {
    const student = db.students.find((s) => s.id === req.params.id);
    if (!student) {
      res.status(404).json({ error: 'Estudiante no encontrado.' });
      return;
    }

    student.avatar = { ...student.avatar, ...req.body.avatar };
    saveDatabase(db);
    res.json({ success: true, avatar: student.avatar });
  });

  // Pairing requests: Student A invites Student B
  app.post('/api/pair-requests', (req: Request, res: Response) => {
    const { fromStudentId, toStudentId, classroomCode } = req.body;
    if (fromStudentId === toStudentId) {
      res.status(400).json({ error: 'No puedes emparejarte contigo mismo.' });
      return;
    }

    // Check if either is already in an active pairing
    const existingPair = db.pairings.find(
      (p) =>
        p.classroomCode === classroomCode &&
        (p.student1Id === fromStudentId ||
          p.student2Id === fromStudentId ||
          p.student1Id === toStudentId ||
          p.student2Id === toStudentId)
    );

    if (existingPair) {
      res.status(400).json({
        error: 'Uno de los compañeros ya cuenta con una pareja activa en el aula.',
      });
      return;
    }

    const request: PairRequest = {
      id: 'req_' + Date.now(),
      fromStudentId,
      toStudentId,
      classroomCode,
      status: 'pending',
      createdAt: Date.now(),
    };

    db.pairRequests.push(request);
    saveDatabase(db);
    res.json({ success: true, request });
  });

  // Accept pair request
  app.post('/api/pair-requests/:id/accept', (req: Request, res: Response) => {
    const request = db.pairRequests.find((r) => r.id === req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    request.status = 'accepted';

    // Create pairing
    const newPairing: Pairing = {
      id: 'pair_' + Date.now(),
      classroomCode: request.classroomCode,
      student1Id: request.fromStudentId,
      student2Id: request.toStudentId,
      assignedChallengeId: 'reto_cuento_jardin',
      status: 'active',
      createdAt: Date.now(),
    };

    db.pairings.push(newPairing);
    saveDatabase(db);
    res.json({ success: true, pairing: newPairing });
  });

  // Random automatic pairing by Teacher (handles odd students carefully!)
  app.post('/api/classrooms/:code/random-pairs', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const students = db.students.filter((s) => s.classroomCode === code);

    if (students.length < 2) {
      res.status(400).json({ error: 'Se necesitan al menos 2 estudiantes para formar parejas.' });
      return;
    }

    // Remove existing pairings for this classroom
    db.pairings = db.pairings.filter((p) => p.classroomCode !== code);
    db.pairRequests = db.pairRequests.filter((r) => r.classroomCode !== code);

    // Shuffle students randomly (Fisher-Yates)
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newPairings: Pairing[] = [];

    const defaultChallenges = [
      'reto_cuento_jardin',
      'reto_matematicas_fiesta',
      'reto_patio_inclusivo',
      'reto_pistas_cruzadas',
      'reto_dilema_recreo',
      'reto_mural_antiexclusion',
    ];

    let challengeIndex = 0;

    // If odd number, create pairs and attach the last student as a supportive trio to the last pair
    // This ensures NO CHILD IS LEFT OUT OR EXCLUDED!
    const isOdd = shuffled.length % 2 !== 0;
    const limit = isOdd ? shuffled.length - 3 : shuffled.length;

    for (let i = 0; i < limit; i += 2) {
      newPairings.push({
        id: `pair_${Date.now()}_${i}`,
        classroomCode: code,
        student1Id: shuffled[i].id,
        student2Id: shuffled[i + 1].id,
        assignedChallengeId: defaultChallenges[challengeIndex % defaultChallenges.length],
        status: 'active',
        createdAt: Date.now(),
      });
      challengeIndex++;
    }

    if (isOdd && shuffled.length >= 3) {
      // Create a harmonious trio for the last 3 students
      const idx = limit;
      newPairings.push({
        id: `pair_${Date.now()}_trio`,
        classroomCode: code,
        student1Id: shuffled[idx].id,
        student2Id: shuffled[idx + 1].id,
        student3Id: shuffled[idx + 2].id, // Trio member!
        assignedChallengeId: defaultChallenges[challengeIndex % defaultChallenges.length],
        status: 'active',
        createdAt: Date.now(),
      });
    }

    db.pairings.push(...newPairings);
    saveDatabase(db);

    res.json({
      success: true,
      pairings: newPairings,
      hasTrio: isOdd,
      trioExplanation: isOdd
        ? 'El aula tiene un número impar de alumnos. Se integró un trío colaborativo para asegurar que ningún estudiante quede excluido.'
        : undefined,
    });
  });

  // Manual pair creation / reassignment by Teacher
  app.post('/api/pairings/manual', (req: Request, res: Response) => {
    const { classroomCode, student1Id, student2Id, student3Id, challengeId } = req.body;
    if (!student1Id || !student2Id || student1Id === student2Id) {
      res.status(400).json({ error: 'Debes seleccionar dos estudiantes distintos.' });
      return;
    }

    // Remove old pairings involving these students
    db.pairings = db.pairings.filter(
      (p) =>
        p.classroomCode !== classroomCode ||
        (p.student1Id !== student1Id &&
          p.student2Id !== student1Id &&
          p.student3Id !== student1Id &&
          p.student1Id !== student2Id &&
          p.student2Id !== student2Id &&
          p.student3Id !== student2Id)
    );

    const newPairing: Pairing = {
      id: 'pair_' + Date.now(),
      classroomCode,
      student1Id,
      student2Id,
      student3Id: student3Id || undefined,
      assignedChallengeId: challengeId || 'reto_cuento_jardin',
      status: 'active',
      createdAt: Date.now(),
    };

    db.pairings.push(newPairing);
    saveDatabase(db);
    res.json({ success: true, pairing: newPairing });
  });

  // Assign challenge to pair
  app.post('/api/pairings/:id/assign-challenge', (req: Request, res: Response) => {
    const pairing = db.pairings.find((p) => p.id === req.params.id);
    if (!pairing) {
      res.status(404).json({ error: 'Pareja no encontrada.' });
      return;
    }

    pairing.assignedChallengeId = req.body.challengeId;
    saveDatabase(db);
    res.json({ success: true, pairing });
  });

  // Assign challenge to ALL pairs in a classroom
  app.post('/api/classrooms/:code/assign-all', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { challengeId } = req.body;
    if (!challengeId) {
      res.status(400).json({ error: 'ID de reto requerido.' });
      return;
    }

    const classPairings = db.pairings.filter((p) => p.classroomCode === code);
    for (const p of classPairings) {
      p.assignedChallengeId = challengeId;
    }
    saveDatabase(db);

    res.json({
      success: true,
      message: `Reto asignado a las ${classPairings.length} parejas del aula.`,
      pairings: classPairings,
    });
  });

  // Get or initialize collaborative session for a pairing
  app.post('/api/sessions/join', (req: Request, res: Response) => {
    const { pairingId, studentId } = req.body;
    const pairing = db.pairings.find((p) => p.id === pairingId);
    if (!pairing) {
      res.status(404).json({ error: 'Pareja no encontrada.' });
      return;
    }

    let session = db.sessions.find(
      (s) => s.pairingId === pairingId && s.challengeId === pairing.assignedChallengeId
    );

    if (!session) {
      session = {
        id: 'sess_' + Date.now(),
        pairingId,
        challengeId: pairing.assignedChallengeId || 'reto_cuento_jardin',
        classroomCode: pairing.classroomCode,
        student1Id: pairing.student1Id,
        student2Id: pairing.student2Id,
        student3Id: pairing.student3Id,
        student1Online: studentId === pairing.student1Id,
        student2Online: studentId === pairing.student2Id,
        student1LastHeartbeat: studentId === pairing.student1Id ? Date.now() : 0,
        student2LastHeartbeat: studentId === pairing.student2Id ? Date.now() : 0,
        state: {
          storyParts: [],
          mathSteps: [],
          playgroundItems: [],
          cluesShared: [],
          puzzleAnswers: {},
          dilemmaVotes: {},
          muralCommitments: [],
          chatMessages: [],
        },
        student1ReadyToFinish: false,
        student2ReadyToFinish: false,
        isCompleted: false,
        earnedPoints: 100,
        badgesUnlocked: [],
      };
      db.sessions.push(session);
      pairing.activeSessionId = session.id;
    }

    // Update heartbeat & online status
    if (studentId === session.student1Id) {
      session.student1Online = true;
      session.student1LastHeartbeat = Date.now();
    } else if (studentId === session.student2Id || studentId === session.student3Id) {
      session.student2Online = true;
      session.student2LastHeartbeat = Date.now();
    }

    saveDatabase(db);
    broadcastToSession(session.id, 'session_updated', session);

    res.json({ success: true, session });
  });

  // Get session state
  app.get('/api/sessions/:id', (req: Request, res: Response) => {
    const session = db.sessions.find((s) => s.id === req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Sesión no encontrada.' });
      return;
    }

    res.json(session);
  });

  // Heartbeat endpoint
  app.post('/api/sessions/:id/heartbeat', (req: Request, res: Response) => {
    const { studentId } = req.body;
    const session = db.sessions.find((s) => s.id === req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Sesión no encontrada.' });
      return;
    }

    const now = Date.now();
    let updated = false;

    if (studentId === session.student1Id) {
      session.student1LastHeartbeat = now;
      if (!session.student1Online) {
        session.student1Online = true;
        updated = true;
      }
    } else if (studentId === session.student2Id || studentId === session.student3Id) {
      session.student2LastHeartbeat = now;
      if (!session.student2Online) {
        session.student2Online = true;
        updated = true;
      }
    }

    // Also update student profile lastSeen
    const student = db.students.find((s) => s.id === studentId);
    if (student) {
      student.isOnline = true;
      student.lastSeen = now;
    }

    if (updated) {
      saveDatabase(db);
      broadcastToSession(session.id, 'presence_update', {
        student1Online: session.student1Online,
        student2Online: session.student2Online,
      });
    }

    res.json({
      student1Online: session.student1Online,
      student2Online: session.student2Online,
    });
  });

  // Add contribution to collaborative session (e.g., story section, math step, playground item, clue, vote)
  app.post('/api/sessions/:id/contribution', (req: Request, res: Response) => {
    const { studentId, type, payload } = req.body;
    const session = db.sessions.find((s) => s.id === req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Sesión no encontrada.' });
      return;
    }

    const student = db.students.find((s) => s.id === studentId);
    const authorName = student ? student.name : 'Compañero';

    switch (type) {
      case 'story_part': {
        if (!session.state.storyParts) session.state.storyParts = [];
        session.state.storyParts.push({
          authorId: studentId,
          authorName,
          text: payload.text,
          step: payload.step || session.state.storyParts.length + 1,
          timestamp: Date.now(),
        });
        if (payload.storyTitle) {
          session.state.storyTitle = payload.storyTitle;
        }
        break;
      }
      case 'math_step': {
        if (!session.state.mathSteps) session.state.mathSteps = [];
        // Check if step exists or update
        const existingIdx = session.state.mathSteps.findIndex(
          (m) => m.stepId === payload.stepId
        );
        const stepData = {
          stepId: payload.stepId,
          stepName: payload.stepName,
          authorId: studentId,
          authorName,
          value: payload.value,
          notes: payload.notes || '',
          verifiedByPartner: Boolean(payload.verifiedByPartner),
        };
        if (existingIdx >= 0) {
          session.state.mathSteps[existingIdx] = stepData;
        } else {
          session.state.mathSteps.push(stepData);
        }
        break;
      }
      case 'math_verify': {
        if (!session.state.mathSteps) session.state.mathSteps = [];
        const target = session.state.mathSteps.find((m) => m.stepId === payload.stepId);
        if (target) {
          target.verifiedByPartner = true;
        }
        break;
      }
      case 'playground_item': {
        if (!session.state.playgroundItems) session.state.playgroundItems = [];
        session.state.playgroundItems.push({
          id: 'item_' + Date.now(),
          type: payload.type,
          name: payload.name,
          placedBy: authorName,
          x: payload.x,
          y: payload.y,
          icon: payload.icon || 'star',
        });
        break;
      }
      case 'clue_share': {
        if (!session.state.cluesShared) session.state.cluesShared = [];
        if (!session.state.cluesShared.some((c) => c.clueId === payload.clueId)) {
          session.state.cluesShared.push({
            clueId: payload.clueId,
            title: payload.title,
            text: payload.text,
            revealedBy: authorName,
          });
        }
        break;
      }
      case 'puzzle_answer': {
        if (!session.state.puzzleAnswers) session.state.puzzleAnswers = {};
        session.state.puzzleAnswers[payload.key] = payload.value;
        break;
      }
      case 'dilemma_vote': {
        if (!session.state.dilemmaVotes) session.state.dilemmaVotes = {};
        if (studentId === session.student1Id) {
          session.state.dilemmaVotes.student1Choice = payload.choice;
        } else {
          session.state.dilemmaVotes.student2Choice = payload.choice;
        }
        if (payload.agreementReflection) {
          session.state.dilemmaVotes.agreementReflection = payload.agreementReflection;
        }
        break;
      }
      case 'mural_commitment': {
        if (!session.state.muralCommitments) session.state.muralCommitments = [];
        session.state.muralCommitments.push({
          id: 'commit_' + Date.now(),
          authorId: studentId,
          authorName,
          text: payload.text,
          category: payload.category || 'Convivencia',
        });
        break;
      }
      case 'chat_message': {
        if (!session.state.chatMessages) session.state.chatMessages = [];
        session.state.chatMessages.push({
          id: 'msg_' + Date.now(),
          senderId: studentId,
          senderName: authorName,
          text: payload.text,
          timestamp: Date.now(),
        });
        break;
      }
      default:
        res.status(400).json({ error: 'Tipo de contribución no reconocido.' });
        return;
    }

    saveDatabase(db);
    broadcastToSession(session.id, 'session_updated', session);

    res.json({ success: true, session });
  });

  // Ready / Complete Reto with Mandatory 2-Student Participation Check
  app.post('/api/sessions/:id/complete', (req: Request, res: Response) => {
    const { studentId, rating } = req.body;
    const session = db.sessions.find((s) => s.id === req.params.id);
    if (!session) {
      res.status(404).json({ error: 'Sesión no encontrada.' });
      return;
    }

    // Set ready status for the student
    if (studentId === session.student1Id) {
      session.student1ReadyToFinish = true;
    } else if (studentId === session.student2Id || studentId === session.student3Id) {
      session.student2ReadyToFinish = true;
    }

    // STRICT CHECK: Both students MUST have contributed and both must confirm!
    // 1. Verify student 1 contributed:
    const s1Contributed = hasStudentContributed(session, session.student1Id);
    // 2. Verify student 2 contributed:
    const s2Contributed = hasStudentContributed(session, session.student2Id);

    if (!s1Contributed || !s2Contributed) {
      saveDatabase(db);
      broadcastToSession(session.id, 'session_updated', session);
      res.status(400).json({
        error:
          '¡Alto ahí equipo! Ambos estudiantes deben participar activamente aportando al reto antes de completar.',
        s1Contributed,
        s2Contributed,
        session,
      });
      return;
    }

    if (!session.student1ReadyToFinish || !session.student2ReadyToFinish) {
      saveDatabase(db);
      broadcastToSession(session.id, 'session_updated', session);
      res.json({
        success: true,
        waitingForPartner: true,
        message: '¡Tu voto para completar fue guardado! Esperando que tu compañero también presione Completar.',
        session,
      });
      return;
    }

    // Both are ready and both contributed!
    session.isCompleted = true;
    session.completedAt = Date.now();
    session.earnedPoints = 120;

    // Determine badge and personalized constructive recommendation
    const recommendationPool = [
      '¡Excelente trabajo en equipo! Recuerden siempre escuchar las ideas del otro antes de tomar la decisión final.',
      'Descubrieron que dos mentes piensan mejor que una. Si alguna vez tienen ideas distintas, expliquen sus razones con respeto.',
      'Demostraron gran empatía. En el recreo, recuerden invitar a jugar a quienes suelan quedarse solos.',
      '¡Misión cumplida! Ambos aportaron su talento único para resolver este desafío colaborativo.',
    ];

    const recommendation =
      recommendationPool[Math.floor(Math.random() * recommendationPool.length)];

    session.reflection = {
      recommendationGiven: recommendation,
      rating: rating || 5,
    };

    // Assign badge depending on challenge
    let badge = 'agente_inclusion';
    if (session.challengeId === 'reto_cuento_jardin') badge = 'genios_creativos';
    else if (session.challengeId === 'reto_matematicas_fiesta') badge = 'constructores_paz';
    else if (session.challengeId === 'reto_patio_inclusivo') badge = 'patio_para_todos';
    else if (session.challengeId === 'reto_pistas_cruzadas') badge = 'pistas_unidas';
    else if (session.challengeId === 'reto_dilema_recreo') badge = 'escucha_activa';
    else if (session.challengeId === 'reto_mural_antiexclusion') badge = 'defensores_inclusion';

    session.badgesUnlocked = [badge];

    // Determine level corresponding to this challenge
    let levelSolved = 1;
    if (session.challengeId === 'reto_cuento_jardin') levelSolved = 1;
    else if (session.challengeId === 'reto_matematicas_fiesta') levelSolved = 2;
    else if (session.challengeId === 'reto_patio_inclusivo') levelSolved = 3;
    else if (session.challengeId === 'reto_pistas_cruzadas' || session.challengeId === 'reto_dilema_recreo') levelSolved = 4;
    else if (session.challengeId === 'reto_mural_antiexclusion') levelSolved = 5;

    // Award points, badges, and unlock next level to BOTH students
    const awardToStudent = (sId: string) => {
      const std = db.students.find((s) => s.id === sId) as any;
      if (std) {
        std.points += session.earnedPoints;
        std.completedChallengesCount += 1;
        if (!std.badges.includes(badge)) {
          std.badges.push(badge);
        }
        if (!std.completedLevels) std.completedLevels = [];
        if (!std.completedLevels.includes(levelSolved)) {
          std.completedLevels.push(levelSolved);
        }
        // Unlock next sequential level!
        const currentUnlocked = std.unlockedLevel || 1;
        if (levelSolved >= currentUnlocked && currentUnlocked < 5) {
          std.unlockedLevel = currentUnlocked + 1;
        }
      }
    };

    awardToStudent(session.student1Id);
    awardToStudent(session.student2Id);
    if (session.student3Id) awardToStudent(session.student3Id);

    saveDatabase(db);
    broadcastToSession(session.id, 'session_completed', session);

    res.json({
      success: true,
      completed: true,
      session,
    });
  });

  // Server-Sent Events (SSE) for instant synchronization
  app.get('/api/sessions/:id/events', (req: Request, res: Response) => {
    const sessionId = req.params.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (!sseListeners.has(sessionId)) {
      sseListeners.set(sessionId, new Set());
    }

    const listeners = sseListeners.get(sessionId)!;
    listeners.add(res);

    // Send initial session data
    const session = db.sessions.find((s) => s.id === sessionId);
    if (session) {
      res.write(`event: session_updated\ndata: ${JSON.stringify(session)}\n\n`);
    }

    req.on('close', () => {
      listeners.delete(res);
      if (listeners.size === 0) {
        sseListeners.delete(sessionId);
      }
    });
  });

  // Helper check for contributions
  function hasStudentContributed(session: SessionState, studentId: string): boolean {
    const s = session.state;
    // Check story parts
    if (s.storyParts && s.storyParts.some((p) => p.authorId === studentId)) return true;
    // Check math steps
    if (s.mathSteps && s.mathSteps.some((m) => m.authorId === studentId)) return true;
    // Check playground items
    const std = db.students.find((st) => st.id === studentId);
    if (std && s.playgroundItems && s.playgroundItems.some((item) => item.placedBy === std.name)) return true;
    // Check clues
    if (std && s.cluesShared && s.cluesShared.some((c) => c.revealedBy === std.name)) return true;
    // Check votes
    if (s.dilemmaVotes) {
      if (studentId === session.student1Id && s.dilemmaVotes.student1Choice) return true;
      if (studentId === session.student2Id && s.dilemmaVotes.student2Choice) return true;
    }
    // Check mural
    if (s.muralCommitments && s.muralCommitments.some((m) => m.authorId === studentId)) return true;
    // Check chat messages
    if (s.chatMessages && s.chatMessages.some((msg) => msg.senderId === studentId)) return true;

    return false;
  }

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`CONECTA+ backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
