# File Storage System

This document describes the file storage system implemented for the Health App, which allows users to upload and store patient documents, medical images, and PDF notes.

## Overview

The file storage system consists of:
- **Backend API**: Handles file uploads, storage, and management
- **Worker Service**: Processes uploaded files
- **Frontend Component**: File upload interface for users
- **Storage Structure**: Organized file storage in APP_DATA directory

## Storage Structure

```
APP_DATA/
├── uploads/          # Temporary storage for newly uploaded files
├── processed/        # Files that have been processed by the worker
```

## File Types Supported

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Documents**: PDF
- **Size Limit**: 10MB per file
- **Batch Upload**: Up to 5 files per upload

## Backend Implementation

### File Model (`backend/src/models/File.ts`)
- Database table for file metadata
- File status tracking (uploaded → processing → processed/error)
- Patient association and metadata storage

### File Routes (`backend/src/routes/files.ts`)
- `POST /api/files/upload/:patientId` - Upload files for a patient
- `GET /api/files/patient/:patientId` - Get files for a patient
- `GET /api/files/pending` - Get pending files for processing
- `GET /api/files/download/:fileId` - Download a file
- `PATCH /api/files/:fileId/status` - Update file status
- `DELETE /api/files/:fileId` - Delete a file

### Security Features
- Authentication required for all file operations
- File type validation
- File size limits
- Secure file storage with unique naming

## Worker Service

### File Processing (`worker/src/index.js`)
The worker service automatically processes uploaded files:

1. **Image Processing**:
   - Converts to JPEG format
   - Moves to processed folder

2. **PDF Processing**:
   - Currently moves to processed folder
   - Future: OCR text extraction, metadata extraction

3. **Status Updates**:
   - Updates file status in database
   - Tracks processing metadata

### Processing Flow
```
Upload → uploaded → processing → processed
                ↓
            error (if failed)
```

## Frontend Implementation

### FileUpload Component (`frontend/src/components/FileUpload.tsx`)
- Drag & drop file selection
- File type validation
- Upload progress indication
- File status display
- Integration with patient case notes

### Features
- Multiple file selection
- File size display
- Upload status tracking
- Error handling
- File type icons

## API Endpoints

### File Upload
```http
POST /api/files/upload/:patientId
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

### Get Patient Files
```http
GET /api/files/patient/:patientId
Authorization: Bearer <token>
```

### Get Pending Files
```http
GET /api/files/pending
Authorization: Bearer <token>
```

### Update File Status
```http
PATCH /api/files/:fileId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing",
  "metadata": { "processedAt": "2024-01-15T10:30:00Z" }
}
```

## Database Schema

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  originalName TEXT NOT NULL,
  fileName TEXT NOT NULL,
  filePath TEXT NOT NULL,
  fileType TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded',
  metadata TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE
);
```

## File Statuses

- **`uploaded`**: File uploaded, waiting for processing
- **`processing`**: Worker is currently processing the file
- **`processed`**: File successfully processed
- **`error`**: Processing failed

## Future Enhancements

### OCR Processing
- Extract text from PDFs and images
- Store extracted text in database
- Enable full-text search

### Image Analysis
- Medical image analysis (X-rays, MRIs)
- Automatic diagnosis suggestions
- Image quality assessment

### Advanced Processing
- Document classification
- Metadata extraction
- Version control for documents

### Security Enhancements
- File encryption at rest
- Access control lists
- Audit logging
- Virus scanning

## Usage Examples

### Upload Files
```typescript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await axios.post('/api/files/upload/patient123', formData);
```

### Get Patient Files
```typescript
const response = await axios.get('/api/files/patient/patient123');
const files = response.data.files;
```

### Monitor Processing Status
```typescript
// Check file status
const file = await axios.get('/api/files/file123');
console.log(file.data.status); // 'uploaded' | 'processing' | 'processed' | 'error'
```

## Error Handling

- File type validation errors
- File size limit errors
- Upload failures
- Processing failures
- Database errors
- File system errors

## Monitoring

- File upload counts
- Processing success rates
- Storage usage
- Processing times
- Error rates

## Configuration

### Environment Variables
- `APP_DATA_PATH`: Root path for file storage
- `MAX_FILE_SIZE`: Maximum file size in bytes
- `MAX_FILES_PER_UPLOAD`: Maximum files per upload
- `ALLOWED_FILE_TYPES`: Comma-separated list of allowed MIME types

### File Limits
- Default max file size: 10MB
- Default max files per upload: 5
- Supported formats: Images (JPEG, PNG, GIF, WebP) and PDFs

## Troubleshooting

### Common Issues
1. **File upload fails**: Check file size and type
2. **Processing stuck**: Check worker service logs
3. **Storage full**: Monitor APP_DATA directory size
4. **Permission errors**: Check file system permissions

### Logs
- Backend: File upload and management logs
- Worker: Processing status and error logs
- Frontend: Upload progress and error logs
