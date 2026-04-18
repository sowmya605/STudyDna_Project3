import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUpload, FiFileText, FiList, FiBookOpen, 
  FiDownload, FiTrash2, FiImage, FiCheckCircle, FiAlertCircle,
  FiCpu, FiClock
} from 'react-icons/fi';
import Tesseract from 'tesseract.js';

const ImageToNotes = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [processingStatus, setProcessingStatus] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);

  // Extract text using Tesseract.js (Works offline, no API key)
  const extractTextWithTesseract = async (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await Tesseract.recognize(
            reader.result,
            'eng',
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                  setOcrProgress(Math.floor(m.progress * 100));
                  setProcessingStatus(`OCR Progress: ${Math.floor(m.progress * 100)}%`);
                }
              }
            }
          );
          resolve(result.data.text);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(imageFile);
    });
  };

  // Generate structured notes from extracted text (No Study Questions)
  const generateNotesFromText = (text) => {
    if (!text || text.trim() === '' || text.length < 10) {
      return {
        title: "Limited Text Detected",
        fullText: "Very little text was detected in this image. For better results:\n\n• Use clear, well-lit images\n• Ensure text is in focus\n• Use printed text rather than handwriting\n• Try cropping to just the text area\n\nIf your image contains text, try uploading a clearer version.",
        bulletPoints: [
          "Use clear, well-lit images for better OCR accuracy",
          "Printed text works better than handwriting",
          "Ensure the image is in focus",
          "Try cropping to just the text area",
          "Avoid shadows and glare on the page"
        ],
        summary: "Limited text was detected. Please try with a clearer image containing readable text."
      };
    }

    // Clean and organize the extracted text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Create bullet points from key lines
    const bulletPoints = lines.slice(0, 20).map(line => {
      let cleaned = line.trim();
      cleaned = cleaned.replace(/^[•\-*\d.\s]+/, '');
      return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
    }).filter(line => line.length > 3);

    // Create summary (first few sentences)
    const summary = lines.slice(0, 5).join(' ').substring(0, 400);

    return {
      title: "Extracted Study Notes",
      fullText: text,
      bulletPoints: bulletPoints,
      summary: summary + (text.length > 400 ? '...' : '')
    };
  };

  const processImage = async (imageFile) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setProcessingStatus('🖼️ Loading image...');
    
    try {
      setProcessingStatus('🔍 Extracting text from image...');
      const extractedTextFromImage = await extractTextWithTesseract(imageFile);
      setExtractedText(extractedTextFromImage);
      
      setProcessingStatus('📝 Generating study notes...');
      const generatedNotes = generateNotesFromText(extractedTextFromImage);
      setNotes(generatedNotes);
      
      setProcessingStatus('');
      setIsProcessing(false);
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingStatus('Error processing image. Please try again.');
      setTimeout(() => setProcessingStatus(''), 3000);
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setNotes(null);
      setExtractedText('');
      setOcrProgress(0);
    }
  };

  const handleProcess = () => {
    if (selectedImage) {
      processImage(selectedImage);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNotes(null);
    setExtractedText('');
    setProcessingStatus('');
    setOcrProgress(0);
  };

  const downloadNotes = () => {
    if (!notes) return;
    
    let content = '';
    const date = new Date().toLocaleDateString();
    const title = `STUDYDNA Study Notes - ${date}\n${'='.repeat(60)}\n\n`;
    
    if (activeTab === 'notes') {
      content = title + notes.fullText;
    } else if (activeTab === 'bullets') {
      content = title + notes.bulletPoints.map((point, i) => `${i+1}. ${point}`).join('\n\n');
    } else if (activeTab === 'summary') {
      content = title + notes.summary;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studydna_notes_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      className="image-to-notes-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '24px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
        <h2 style={{ fontSize: '24px', marginBottom: '5px' }}>Image to Notes Converter</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Upload an image with text - AI extracts and organizes your study notes</p>
      </div>

      {!imagePreview ? (
        <div style={{
          border: '2px dashed var(--border-color)',
          borderRadius: '20px',
          padding: '50px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: 'var(--bg-primary)'
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            handleImageUpload({ target: { files: [file] } });
          }
        }}
        onClick={() => document.getElementById('imageInput').click()}
        >
          <FiImage size={48} style={{ color: '#667eea', marginBottom: '15px' }} />
          <h3 style={{ marginBottom: '10px' }}>Click or Drag & Drop</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
            Upload a photo of your textbook, notes, whiteboard, or study material
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
            Supports: JPG, PNG, GIF (Clear images work best)
          </p>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              flex: 1,
              background: 'var(--bg-primary)',
              borderRadius: '16px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '250px',
                  borderRadius: '12px',
                  objectFit: 'contain'
                }}
              />
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={clearImage}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiTrash2 /> Clear
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isProcessing ? <FiClock className="spinning" /> : <FiCpu />}
                  {isProcessing ? 'Processing...' : 'Extract & Generate Notes'}
                </button>
              </div>
              {isProcessing && (
                <div style={{ marginTop: '15px' }}>
                  <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: '0 auto 10px' }}></div>
                  <p style={{ fontSize: '13px', color: '#667eea' }}>{processingStatus}</p>
                  {ocrProgress > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ 
                        height: '4px', 
                        background: 'var(--border-color)', 
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${ocrProgress}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {extractedText && !isProcessing && extractedText.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '12px',
              borderLeft: '3px solid #667eea'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle style={{ color: '#10b981' }} /> Extracted Text ({extractedText.length} characters)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-line', maxHeight: '100px', overflowY: 'auto' }}>
                {extractedText.substring(0, 400)}{extractedText.length > 400 ? '...' : ''}
              </p>
            </div>
          )}

          {notes && !isProcessing && (
            <div>
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setActiveTab('notes')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'notes' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'notes' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiFileText /> Full Notes
                </button>
                <button
                  onClick={() => setActiveTab('bullets')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'bullets' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'bullets' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiList /> Key Points
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === 'summary' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: activeTab === 'summary' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiBookOpen /> Summary
                </button>
              </div>

              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '16px',
                padding: '25px',
                marginBottom: '15px',
                maxHeight: '450px',
                overflowY: 'auto'
              }}>
                {activeTab === 'notes' && (
                  <div>
                    <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#667eea' }}>📝 {notes.title}</h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                      {notes.fullText}
                    </p>
                  </div>
                )}
                
                {activeTab === 'bullets' && (
                  <div>
                    <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#667eea' }}>• Key Points</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {notes.bulletPoints.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: '10px', lineHeight: '1.5' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {activeTab === 'summary' && (
                  <div>
                    <h3 style={{ marginBottom: '15px', fontSize: '18px', color: '#667eea' }}>📖 Quick Summary</h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                      {notes.summary}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={downloadNotes}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                <FiDownload /> Download Notes (.txt)
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '12px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        <FiAlertCircle style={{ display: 'inline', marginRight: '8px', color: '#667eea' }} />
        <strong>How it works:</strong> Tesseract.js OCR runs in your browser to extract text from images.
        <br />
        <span style={{ fontSize: '11px', marginTop: '5px', display: 'block' }}>
          💡 <strong>Tips for best results:</strong> Use clear, well-lit images with printed text. Handwriting has lower accuracy.
        </span>
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default ImageToNotes;