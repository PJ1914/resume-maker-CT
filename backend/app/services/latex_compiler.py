"""
LaTeX PDF Compilation Service
Handles template rendering and PDF compilation
"""

import os
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, Literal
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.services.latex_utils import prepare_template_data

# Template types
TemplateType = Literal["modern", "classic", "minimalist"]

# Get templates directory
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "latex"


class LaTeXCompiler:
    """Handles LaTeX template rendering and PDF compilation"""
    
    def __init__(self):
        """Initialize Jinja2 environment for LaTeX templates"""
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            autoescape=select_autoescape(['tex']),
            block_start_string='\\BLOCK{',
            block_end_string='}',
            variable_start_string='\\VAR{',
            variable_end_string='}',
            comment_start_string='\\#{',
            comment_end_string='}',
            line_statement_prefix='%%',
            line_comment_prefix='%#',
            trim_blocks=True,
            lstrip_blocks=True,
        )
        
        # But we'll use default delimiters since our templates already use them
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            trim_blocks=True,
            lstrip_blocks=True,
        )
    
    def render_template(
        self,
        template_name: TemplateType,
        resume_data: Dict[str, Any]
    ) -> str:
        """
        Render LaTeX template with resume data.
        
        Args:
            template_name: Template type (modern/classic/minimalist)
            resume_data: Resume data from Firestore
            
        Returns:
            Rendered LaTeX source code
            
        Raises:
            ValueError: If template not found
        """
        template_file = f"{template_name}.tex"
        
        try:
            template = self.jinja_env.get_template(template_file)
        except Exception as e:
            raise ValueError(f"Template '{template_name}' not found: {e}")
        
        # Prepare and sanitize data
        template_data = prepare_template_data(resume_data)
        
        # Render template
        rendered = template.render(**template_data)
        
        return rendered
    
    def compile_pdf(
        self,
        latex_source: str,
        output_filename: str = "resume.pdf"
    ) -> bytes:
        """
        Compile LaTeX source to PDF.
        
        Args:
            latex_source: LaTeX source code
            output_filename: Desired PDF filename
            
        Returns:
            PDF file contents as bytes
            
        Raises:
            RuntimeError: If compilation fails
        """
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Write LaTeX source to file
            tex_file = temp_path / "resume.tex"
            tex_file.write_text(latex_source, encoding='utf-8')
            
            # Try xelatex first (better Unicode support), fall back to pdflatex
            compilers = ['xelatex', 'pdflatex']
            pdf_path = None
            
            for compiler in compilers:
                try:
                    # Check if compiler exists
                    check_cmd = ['which', compiler] if os.name != 'nt' else ['where', compiler]
                    result = subprocess.run(
                        check_cmd,
                        capture_output=True,
                        text=True
                    )
                    
                    if result.returncode != 0:
                        continue  # Compiler not found, try next
                    
                    # Run LaTeX compiler twice (for references)
                    for _ in range(2):
                        cmd = [
                            compiler,
                            '-interaction=nonstopmode',
                            '-output-directory=' + str(temp_path),
                            str(tex_file)
                        ]
                        
                        result = subprocess.run(
                            cmd,
                            cwd=temp_path,
                            capture_output=True,
                            text=True,
                            timeout=30
                        )
                    
                    # Check if PDF was created
                    pdf_path = temp_path / "resume.pdf"
                    if pdf_path.exists():
                        break  # Success!
                    else:
                        # Compilation failed, check log
                        log_file = temp_path / "resume.log"
                        if log_file.exists():
                            log_content = log_file.read_text(encoding='utf-8', errors='ignore')
                            # Extract errors from log
                            errors = self._extract_latex_errors(log_content)
                            raise RuntimeError(f"LaTeX compilation failed with {compiler}: {errors}")
                
                except subprocess.TimeoutExpired:
                    raise RuntimeError(f"LaTeX compilation timed out with {compiler}")
                except FileNotFoundError:
                    continue  # Compiler not found, try next
            
            if pdf_path is None or not pdf_path.exists():
                raise RuntimeError(
                    "LaTeX compilation failed. Please ensure xelatex or pdflatex is installed. "
                    "Install TeX Live or MiKTeX."
                )
            
            # Read PDF file
            pdf_content = pdf_path.read_bytes()
            
            return pdf_content
    
    def _extract_latex_errors(self, log_content: str) -> str:
        """
        Extract error messages from LaTeX log file.
        
        Args:
            log_content: Content of .log file
            
        Returns:
            Formatted error message
        """
        errors = []
        lines = log_content.split('\n')
        
        for i, line in enumerate(lines):
            if line.startswith('!'):
                # Error line found
                error_msg = line[1:].strip()
                # Get next few lines for context
                context = '\n'.join(lines[i:i+3])
                errors.append(context)
        
        if errors:
            return '\n'.join(errors[:5])  # Return first 5 errors
        else:
            return "Unknown compilation error. Check LaTeX syntax."
    
    def generate_pdf(
        self,
        resume_data: Dict[str, Any],
        template_name: TemplateType = "modern"
    ) -> bytes:
        """
        Complete PDF generation pipeline: render template + compile PDF.
        
        Args:
            resume_data: Resume data from Firestore
            template_name: Template type to use
            
        Returns:
            PDF file contents as bytes
        """
        # Render LaTeX template
        latex_source = self.render_template(template_name, resume_data)
        
        # Compile to PDF
        pdf_content = self.compile_pdf(latex_source)
        
        return pdf_content


# Singleton instance
latex_compiler = LaTeXCompiler()
