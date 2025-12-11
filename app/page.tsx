'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { validateCredentials } from '@/lib/auth'

interface Document {
  id: string
  title: string
  content: string
  file_name?: string
  file_path?: string
  file_url?: string
  file_size?: number
  file_type?: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      fetchDocuments()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (validateCredentials(email, password)) {
      setIsAuthenticated(true)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', email)
      fetchDocuments()
    } else {
      setError('Invalid email or password')
    }
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    setDocuments([])
    setEmail('')
    setPassword('')
  }

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      setError('Failed to fetch documents')
    }
  }

  const uploadFile = async (file: File): Promise<{ path: string; url: string } | null> => {
    try {
      setUploadingFile(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `docs/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      return {
        path: filePath,
        url: urlData.publicUrl
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      setError(`Failed to upload file: ${error.message}`)
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      let fileData = null
      
      // Upload file if selected
      if (selectedFile) {
        fileData = await uploadFile(selectedFile)
        if (!fileData && selectedFile) {
          setLoading(false)
          return // Stop if file upload failed
        }
      }

      if (editingDoc) {
        // Update existing document
        const updateData: any = {
          title: formTitle,
          content: formContent,
          updated_at: new Date().toISOString(),
        }

        // Only update file if a new one was selected
        if (fileData) {
          // Delete old file if it exists
          if (editingDoc.file_path) {
            await supabase.storage
              .from('documents')
              .remove([editingDoc.file_path])
          }
          
          updateData.file_name = selectedFile?.name
          updateData.file_path = fileData.path
          updateData.file_url = fileData.url
          updateData.file_size = selectedFile?.size
          updateData.file_type = selectedFile?.type
        }

        const { error } = await supabase
          .from('documents')
          .update(updateData)
          .eq('id', editingDoc.id)

        if (error) throw error
        setSuccessMessage('Document updated successfully!')
      } else {
        // Create new document
        const insertData: any = {
          title: formTitle,
          content: formContent,
        }

        if (fileData && selectedFile) {
          insertData.file_name = selectedFile.name
          insertData.file_path = fileData.path
          insertData.file_url = fileData.url
          insertData.file_size = selectedFile.size
          insertData.file_type = selectedFile.type
        }

        const { data, error } = await supabase
          .from('documents')
          .insert([insertData])
          .select()

        if (error) throw error

        // Send email notification
        try {
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formTitle,
              content: formContent,
              fileName: selectedFile?.name,
              fileUrl: fileData?.url,
            }),
          })
          if (!response.ok) {
            console.error('Failed to send email notification')
          }
        } catch (emailError) {
          console.error('Email error:', emailError)
        }

        setSuccessMessage('Document created successfully! Email notification sent.')
      }

      // Reset form
      setFormTitle('')
      setFormContent('')
      setSelectedFile(null)
      setShowForm(false)
      setEditingDoc(null)
      fetchDocuments()
    } catch (error: any) {
      console.error('Error saving document:', error)
      setError(error.message || 'Failed to save document')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc)
    setFormTitle(doc.title)
    setFormContent(doc.content)
    setSelectedFile(null) // Reset file selection when editing
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Find the document to get file path
      const doc = documents.find(d => d.id === id)
      
      // Delete file from storage if it exists
      if (doc?.file_path) {
        await supabase.storage
          .from('documents')
          .remove([doc.file_path])
      }

      // Delete document from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccessMessage('Document deleted successfully!')
      fetchDocuments()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      setError(error.message || 'Failed to delete document')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDoc(null)
    setFormTitle('')
    setFormContent('')
    setSelectedFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h1>Sign In</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Documentation Manager</h1>
        <button onClick={handleSignOut} className="secondary">
          Sign Out
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="success">
          + Add New Document
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>{editingDoc ? 'Edit Document' : 'Create New Document'}</h2>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">Upload Document File (Optional)</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            />
            {selectedFile && (
              <div className="file-info">
                <p>Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
              </div>
            )}
            {editingDoc && editingDoc.file_name && !selectedFile && (
              <div className="file-info">
                <p>Current file: {editingDoc.file_name} 
                  {editingDoc.file_url && (
                    <a href={editingDoc.file_url} target="_blank" rel="noopener noreferrer" className="download-link">
                      Download
                    </a>
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="btn-group">
            <button type="submit" disabled={loading || uploadingFile}>
              {loading || uploadingFile ? (uploadingFile ? 'Uploading...' : 'Saving...') : editingDoc ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={handleCancel} className="secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="document-list">
        <h2>Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <div className="empty-state">No documents yet. Create your first one!</div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <h3>{doc.title}</h3>
              <div className="document-meta">
                Created: {new Date(doc.created_at).toLocaleString()} | 
                Updated: {new Date(doc.updated_at).toLocaleString()}
              </div>
              <p>{doc.content}</p>
              {doc.file_name && (
                <div className="file-attachment">
                  <strong>📎 File:</strong> {doc.file_name} ({formatFileSize(doc.file_size)})
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="download-link">
                      Download
                    </a>
                  )}
                </div>
              )}
              <div className="actions">
                <button onClick={() => handleEdit(doc)}>Edit</button>
                <button onClick={() => handleDelete(doc.id)} className="danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

