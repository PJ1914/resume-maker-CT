"""
LaTeX PDF Compilation Service
Handles template rendering and PDF compilation
"""

import os
import subprocess
import tempfile
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Literal
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.services.latex_utils import prepare_template_data

logger = logging.getLogger(__name__)

# Template types
TemplateType = Literal["modern", "classic", "minimalist"]

# Get templates directory
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates" / "latex"


class LaTeXCompiler:
    """Handles LaTeX template rendering and PDF compilation"""
    
    def __init__(self):
        """Initialize Jinja2 environment for LaTeX templates"""
        # Use default Jinja2 delimiters but change comment syntax
        # to avoid conflicts with LaTeX {#1} parameter syntax
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            trim_blocks=True,
            lstrip_blocks=True,
            comment_start_string='{##',  # Change from {# to {## to avoid LaTeX {#1} conflicts
            comment_end_string='##}',
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
            logger.exception(
                "Template loading error for '%s' (file=%s, templates_dir=%s): %s",
                template_name,
                template_file,
                TEMPLATES_DIR,
                e,
            )
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
        # Try local compilation first
        try:
            return self._compile_pdf_local(latex_source, output_filename)
        except RuntimeError as e:
            # If local compilation fails, try online service
            logger.warning(f"Local LaTeX compilation failed: {e}")
            logger.info("Attempting online LaTeX compilation...")
            return self._compile_pdf_online(latex_source)
    
    def _compile_pdf_local(
        self,
        latex_source: str,
        output_filename: str = "resume.pdf"
    ) -> bytes:
        """
        Compile LaTeX source to PDF using local LaTeX installation.
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
                    for run_num in range(2):
                        cmd = [
                            compiler,
                            '-interaction=nonstopmode',
                            '-output-directory=' + str(temp_path),
                            str(tex_file)
                        ]
                        
                        # Set environment for MiKTeX auto-install
                        env = os.environ.copy()
                        env['MIKTEX_AUTOINSTALL'] = 'yes'
                        
                        result = subprocess.run(
                            cmd,
                            cwd=temp_path,
                            capture_output=True,
                            text=True,
                            timeout=120,  # Increased timeout for package installation
                            env=env
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
    
    def _compile_pdf_online(self, latex_source: str) -> bytes:
        """
        Compile LaTeX source to PDF using Overleaf's public API or alternative service.
        """
        import requests
        import json
        services = [
            {
                'name': 'texlive.net',
                'url': 'https://texlive.net/cgi-bin/latexcgi',
                'method': 'post_form'
            }
        ]
        
        for service in services:
            try:
                logger.info(f"Trying online LaTeX service: {service['name']}")
                
                if service['method'] == 'post_form':
                    # Try texlive.net
                    response = requests.post(
                        service['url'],
                        data={
                            'filecontents': latex_source,
                            'filename': 'resume.tex',
                            'engine': 'pdflatex',
                            'return': 'pdf'
                        },
                        timeout=60
                    )
                    
                    if response.status_code == 200:
                        # Check if response is PDF
                        if response.content.startswith(b'%PDF'):
                            logger.info(f"Successfully compiled with {service['name']}")
                            return response.content
                        else:
                            logger.warning(f"Response from {service['name']} is not a PDF")
                    else:
                        logger.warning(f"{service['name']} returned status {response.status_code}")
                        
            except Exception as e:
                logger.warning(f"Failed with {service['name']}: {str(e)}")
                continue
        
        # If all services fail, provide helpful error
        raise RuntimeError(
            "LaTeX compilation failed. Please install a LaTeX distribution:\n"
            "- Windows: Download MiKTeX from https://miktex.org/download\n"
            "- Or: Download TeX Live from https://www.tug.org/texlive/\n\n"
            "After installation, restart the server and try again."
        )
    
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
