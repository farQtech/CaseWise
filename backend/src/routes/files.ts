import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileModel } from '../models/File';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';

// Function to generate 8-digit alphanumeric string
function generateSecureFileName(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), '../APP_DATA', 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate secure 8-digit alphanumeric filename
    const secureName = generateSecureFileName();
    const ext = path.extname(file.originalname);
    cb(null, `${secureName}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only images and PDFs
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Only images and PDFs are accepted.`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Max 1 file per upload
  }
});

export const createFileRoutes = (fileModel: FileModel, userModel: UserModel): Router => {
  const router = Router();
  
  // Debug environment variables
  console.log('🔧 File routes initialization:');
  console.log('  - WORKER_API_KEY:', process.env.WORKER_API_KEY);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);

  router.post(
    '/upload/:patientId', 
    authMiddleware(userModel),
    upload.array('files', 5),
    async (req: AuthenticatedRequest, res: Response) => {
  
      console.log('📤 File upload request received');
      console.log('👤 User:', req.user);
      console.log('📁 Files received:', req.files?.length || 0);
  
      // 🔍 Step 1: Check if Multer saved them to disk
      const files = req.files as Express.Multer.File[];
  
      for (const file of files) {
        console.log('--- FILE DEBUG ---');
        console.log('Original name:', file.originalname);
        console.log('Multer-assigned name:', file.filename);
        console.log('Saved path:', file.path);
        console.log('Exists on disk?', fs.existsSync(file.path));
        console.log('-------------------');
      }
  
      // ⛔ Step 2: If nothing exists on disk here,
      //           the problem is in Multer config or request payload
      //           → The rest of your logic won’t help until that’s fixed.
  
      try {
        const { patientId } = req.params;
  
        if (!files || files.length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
        }
  
        const uploadedFiles = [];
  
        for (const file of files) {
          const fileRecord = await fileModel.create({
            patientId,
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            fileType: path.extname(file.originalname).toLowerCase(),
            mimeType: file.mimetype,
            size: file.size,
            status: 'uploaded',
            metadata: JSON.stringify({
              uploadedBy: req.user?.id || 'system',
              uploadedAt: new Date().toISOString()
            })
          });
  
          uploadedFiles.push(fileRecord);
        }
  
        fileModel.notifyWorker(uploadedFiles).catch(err => {
          console.error('Failed to notify worker:', err);
        });
  
        res.json({
          message: `${files.length} file(s) uploaded successfully`,
          files: uploadedFiles
        });
  
      } catch (error: any) {
        console.error('File upload error:', error);
  
        if (files) {
          for (const file of files) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.error('Failed to clean up file:', unlinkError);
            }
          }
        }
  
        res.status(500).json({
          error: 'Failed to upload files',
          details: error.message
        });
      }
    }
  );
  

  // Get files for a patient
  router.get('/patient/:patientId', 
    authMiddleware(userModel),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { patientId } = req.params;
        const files = await fileModel.findByPatientId(patientId);
        
        res.json({
          files: files.map(file => ({
            ...file,
            metadata: file.metadata ? JSON.parse(file.metadata) : null
          }))
        });

      } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
          error: 'Failed to retrieve files'
        });
      }
    }
  );

  // Get pending files for processing (worker endpoint)
  router.get('/pending', 
    async (req: Request, res: Response) => {
      // Simple API key check for worker
      const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['X-Api-Key'];
      console.log('🔑 Worker API key check:');
      console.log('  - Received API key:', apiKey);
      console.log('  - Expected API key:', process.env.WORKER_API_KEY);
      console.log('  - All headers:', Object.keys(req.headers));
      console.log('  - x-api-key header:', req.headers['x-api-key']);
      console.log('  - X-API-Key header:', req.headers['X-API-Key']);
      
      if (!apiKey || apiKey !== process.env.WORKER_API_KEY) {
        console.log('❌ API key mismatch or missing');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const files = await fileModel.findByStatus('uploaded');
        
        res.json({
          files: files.map(file => ({
            ...file,
            metadata: file.metadata ? JSON.parse(file.metadata) : null
          }))
        });

      } catch (error) {
        console.error('Get pending files error:', error);
        res.status(500).json({
          error: 'Failed to retrieve pending files'
        });
      }
    }
  );

  // Download a file
  router.get('/download/:fileId', 
    authMiddleware(userModel),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { fileId } = req.params;
        const file = await fileModel.findById(fileId);
        
        if (!file) {
          return res.status(404).json({
            error: 'File not found'
          });
        }

        // Check if file exists on disk
        if (!fs.existsSync(file.filePath)) {
          return res.status(404).json({
            error: 'File not found on disk'
          });
        }

        // Set appropriate headers
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(file.filePath);
        fileStream.pipe(res);

      } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({
          error: 'Failed to download file'
        });
      }
    }
  );

  // Get file info
  router.get('/:fileId', 
    authMiddleware(userModel),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { fileId } = req.params;
        const file = await fileModel.findById(fileId);
        
        if (!file) {
          return res.status(404).json({
            error: 'File not found'
          });
        }

        res.json({
          ...file,
          metadata: file.metadata ? JSON.parse(file.metadata) : null
        });

      } catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({
          error: 'Failed to retrieve file'
        });
      }
    }
  );

  // Update file status (worker endpoint)
  router.patch('/:fileId/status', 
    async (req: Request, res: Response) => {
      // Simple API key check for worker
      const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['X-Api-Key'];
      console.log('🔑 Worker status update API key check:');
      console.log('  - Received API key:', apiKey);
      console.log('  - Expected API key:', process.env.WORKER_API_KEY);
      
      if (!apiKey || apiKey !== process.env.WORKER_API_KEY) {
        console.log('❌ API key mismatch or missing in status update');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      try {
        const { fileId } = req.params;
        const { status, metadata } = req.body;
        
        if (!status) {
          return res.status(400).json({
            error: 'Status is required'
          });
        }

        const file = await fileModel.findById(fileId);
        if (!file) {
          return res.status(404).json({
            error: 'File not found'
          });
        }

        await fileModel.updateStatus(fileId, status, metadata ? JSON.stringify(metadata) : undefined);

        res.json({
          message: 'File status updated successfully'
        });

      } catch (error) {
        console.error('File status update error:', error);
        res.status(500).json({
          error: 'Failed to update file status'
        });
      }
    }
  );

  // Delete a file
  router.delete('/:fileId', 
    authMiddleware(userModel),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { fileId } = req.params;
        const file = await fileModel.findById(fileId);
        
        if (!file) {
          return res.status(404).json({
            error: 'File not found'
          });
        }

        // Delete from disk
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }

        // Delete from database
        await fileModel.delete(fileId);

        res.json({
          message: 'File deleted successfully'
        });

      } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({
          error: 'Failed to delete file'
        });
      }
    }
  );

  // Error handling for multer
  router.use((error: any, req: Request, res: Response, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Maximum size is 10MB.'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files. Maximum is 1 file per upload.'
        });
      }
    }
    
    if (error.message.includes('File type')) {
      return res.status(400).json({
        error: error.message
      });
    }

    console.error('File route error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  });

  return router;
};
