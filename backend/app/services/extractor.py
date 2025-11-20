"""
Text extraction from PDF and DOCX files.
Handles various edge cases and layout types.
"""

import io
from typing import Optional, Dict
import pdfplumber
from docx import Document


class PDFExtractor:
    """Extract text from PDF files using pdfplumber."""
    
    @staticmethod
    def extract_text(file_content: bytes) -> Dict[str, any]:
        """
        Extract text from PDF file.
        
        Args:
            file_content: PDF file bytes
            
        Returns:
            Dict with 'text', 'num_pages', and 'metadata'
        """
        try:
            pdf_file = io.BytesIO(file_content)
            
            text_parts = []
            num_pages = 0
            metadata = {}
            
            with pdfplumber.open(pdf_file) as pdf:
                num_pages = len(pdf.pages)
                metadata = pdf.metadata or {}
                
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract text using default method
                    page_text = page.extract_text()
                    
                    if page_text:
                        # Add page separator for multi-page resumes
                        if page_num > 1:
                            text_parts.append('\n--- Page Break ---\n')
                        text_parts.append(page_text)
                    else:
                        # If default extraction fails, try with layout preservation
                        page_text = page.extract_text(layout=True)
                        if page_text:
                            if page_num > 1:
                                text_parts.append('\n--- Page Break ---\n')
                            text_parts.append(page_text)
            
            full_text = '\n'.join(text_parts)
            
            return {
                'text': full_text,
                'num_pages': num_pages,
                'metadata': metadata,
                'extraction_method': 'pdfplumber'
            }
            
        except Exception as e:
            raise Exception(f"PDF extraction failed: {str(e)}")
    
    @staticmethod
    def extract_with_layout(file_content: bytes) -> Dict[str, any]:
        """
        Extract text preserving layout (better for multi-column resumes).
        
        Args:
            file_content: PDF file bytes
            
        Returns:
            Dict with text and metadata
        """
        try:
            pdf_file = io.BytesIO(file_content)
            
            text_parts = []
            num_pages = 0
            
            with pdfplumber.open(pdf_file) as pdf:
                num_pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    # Extract with layout preservation
                    page_text = page.extract_text(
                        layout=True,
                        x_tolerance=3,
                        y_tolerance=3
                    )
                    
                    if page_text:
                        if page_num > 1:
                            text_parts.append('\n--- Page Break ---\n')
                        text_parts.append(page_text)
            
            return {
                'text': '\n'.join(text_parts),
                'num_pages': num_pages,
                'extraction_method': 'pdfplumber_layout'
            }
            
        except Exception as e:
            raise Exception(f"PDF layout extraction failed: {str(e)}")


class DOCXExtractor:
    """Extract text from DOCX files using python-docx."""
    
    @staticmethod
    def extract_text(file_content: bytes) -> Dict[str, any]:
        """
        Extract text from DOCX file.
        
        Args:
            file_content: DOCX file bytes
            
        Returns:
            Dict with 'text', 'num_paragraphs', and metadata
        """
        try:
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            
            text_parts = []
            num_paragraphs = 0
            
            # Extract from paragraphs
            for para in doc.paragraphs:
                if para.text.strip():
                    text_parts.append(para.text)
                    num_paragraphs += 1
            
            # Extract from tables (common in resumes)
            for table in doc.tables:
                for row in table.rows:
                    row_text = []
                    for cell in row.cells:
                        if cell.text.strip():
                            row_text.append(cell.text.strip())
                    if row_text:
                        text_parts.append(' | '.join(row_text))
            
            full_text = '\n'.join(text_parts)
            
            # Extract core properties if available
            metadata = {}
            try:
                core_props = doc.core_properties
                metadata = {
                    'author': core_props.author,
                    'title': core_props.title,
                    'subject': core_props.subject,
                    'created': str(core_props.created) if core_props.created else None,
                    'modified': str(core_props.modified) if core_props.modified else None,
                }
            except Exception:
                pass
            
            return {
                'text': full_text,
                'num_paragraphs': num_paragraphs,
                'num_tables': len(doc.tables),
                'metadata': metadata,
                'extraction_method': 'python-docx'
            }
            
        except Exception as e:
            raise Exception(f"DOCX extraction failed: {str(e)}")
    
    @staticmethod
    def extract_with_formatting(file_content: bytes) -> Dict[str, any]:
        """
        Extract text with basic formatting preserved.
        
        Args:
            file_content: DOCX file bytes
            
        Returns:
            Dict with text and formatting info
        """
        try:
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            
            formatted_parts = []
            
            for para in doc.paragraphs:
                if not para.text.strip():
                    continue
                
                # Check if heading
                if para.style.name.startswith('Heading'):
                    formatted_parts.append(f"\n## {para.text.strip()} ##\n")
                elif para.text.strip():
                    formatted_parts.append(para.text)
            
            return {
                'text': '\n'.join(formatted_parts),
                'extraction_method': 'python-docx_formatted'
            }
            
        except Exception as e:
            raise Exception(f"DOCX formatted extraction failed: {str(e)}")


class ResumeExtractor:
    """
    Main extractor that routes to appropriate parser based on file type.
    """
    
    def __init__(self):
        self.pdf_extractor = PDFExtractor()
        self.docx_extractor = DOCXExtractor()
    
    def extract(
        self,
        file_content: bytes,
        content_type: str,
        preserve_layout: bool = False
    ) -> Dict[str, any]:
        """
        Extract text from resume file.
        
        Args:
            file_content: File bytes
            content_type: MIME type (application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document)
            preserve_layout: Whether to preserve layout (useful for multi-column)
            
        Returns:
            Extraction result with text and metadata
        """
        if content_type == 'application/pdf':
            if preserve_layout:
                return self.pdf_extractor.extract_with_layout(file_content)
            else:
                return self.pdf_extractor.extract_text(file_content)
        
        elif content_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ]:
            if preserve_layout:
                return self.docx_extractor.extract_with_formatting(file_content)
            else:
                return self.docx_extractor.extract_text(file_content)
        
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
    
    def extract_with_fallback(
        self,
        file_content: bytes,
        content_type: str
    ) -> Dict[str, any]:
        """
        Extract with automatic fallback to layout-preserving mode if initial extraction is poor.
        
        Args:
            file_content: File bytes
            content_type: MIME type
            
        Returns:
            Best extraction result
        """
        # Try default extraction first
        result = self.extract(file_content, content_type, preserve_layout=False)
        
        # Check if extraction was poor (very short text)
        text = result.get('text', '')
        if len(text.strip()) < 100:
            # Try with layout preservation
            try:
                result = self.extract(file_content, content_type, preserve_layout=True)
            except Exception:
                # Keep original result if fallback fails
                pass
        
        return result
