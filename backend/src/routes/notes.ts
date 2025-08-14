import { Router, Response } from 'express';
import { initDatabase } from '../database/schema';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { CaseNote, NoteModel } from '../models/Note';

export const createNotesRoutes = (notesModel: NoteModel, userModel: UserModel): Router => {
  const router = Router();

  // GET all case notes for a patient
  router.get('/patient/:patientId', authMiddleware(userModel), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { patientId } = req.params;
      const db = await initDatabase();
      const caseNoteModel = notesModel

      const caseNotes: CaseNote[] = await caseNoteModel.findByPatientId(patientId);

      res.json({ caseNotes });
      db.close();
    } catch (error) {
      console.error('Error fetching case notes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET single case note by ID
  router.get('/:caseNoteId', authMiddleware(userModel), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { caseNoteId } = req.params;
      const db = await initDatabase();
      const caseNoteModel = new CaseNoteModel(db);

      const caseNote = await caseNoteModel.findById(caseNoteId);

      if (!caseNote) {
        return res.status(404).json({ error: 'Case note not found' });
      }

      res.json(caseNote);
      db.close();
    } catch (error) {
      console.error('Error fetching case note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST new case note
  router.post('/patient/:patientId', authMiddleware(userModel), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { patientId } = req.params;
      const { date, time, diagnosis, prescription, notes, attachments, status } = req.body;

      if (!date || !time || !diagnosis || !prescription || !notes || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const doctor = req.user?.email || req.body?.doctor || 'Not Found'; 

      const newCaseNote: Omit<CaseNote, 'id'> = {
        patientId: patientId,
        date,
        time,
        doctor,
        diagnosis,
        prescription,
        notes,
        attachments: attachments || [],
        status
      };

      const savedNote = await notesModel.create(newCaseNote);

      res.status(201).json({ caseNote: savedNote });
    } catch (error) {
      console.error('Error creating case note:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  return router;
};
