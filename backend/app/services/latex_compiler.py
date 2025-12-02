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
TemplateType = Literal["modern", "classic", "minimalist", "awesomecv", "moderncv", "engineering", "simple", "onepage"]

# Get templates directory
TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "latex"


class LaTeXCompiler:
    """Handles LaTeX template rendering and PDF compilation"""
    
    def __init__(self):
        """Initialize Jinja2 environment for LaTeX templates"""
        # Configure Jinja2 with LaTeX-friendly delimiters
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            block_start_string='\\BLOCK{',
            block_end_string='}',
            variable_start_string='\\VAR{',
            variable_end_string='}',
            comment_start_string='\\#{',
            comment_end_string='}',
            line_statement_prefix='%%',
            # NO line_comment_prefix - disabled to avoid conflicts with LaTeX % comments
            trim_blocks=True,
            autoescape=False,
            cache_size=0, # Disable cache
        )
        
        # Register filters
        self.jinja_env.filters['escape_tex'] = self.escape_latex
    
    def escape_latex(self, s: Any) -> str:
        """
        Escape special LaTeX characters.
        
        Args:
            s: String to escape
            
        Returns:
            Escaped string safe for LaTeX
        """
        if not s:
            return ""
            
        return str(s).replace('&', '\\&') \
                     .replace('%', '\\%') \
                     .replace('$', '\\$') \
                     .replace('#', '\\#') \
                     .replace('_', '\\_') \
                     .replace('{', '\\{') \
                     .replace('}', '\\}') \
                     .replace('~', '\\textasciitilde') \
                     .replace('^', '\\textasciicircum')

    def render_template(
        self,
        template_name: str,
        resume_data: Dict[str, Any]
    ) -> str:
        """
        Render LaTeX template with resume data.
        
        Args:
            template_name: Name of the template folder (e.g., 'awesomecv')
            resume_data: Resume data from Firestore
            
        Returns:
            Rendered LaTeX source code
            
        Raises:
            ValueError: If template not found
        """
        # We expect the main file to be named 'main.tex' inside the template folder
        template_file = f"{template_name}/main.tex"

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
        try:
            rendered = template.render(**template_data)
            logger.info(f"Successfully rendered template {template_name}")
            logger.info(f"Rendered content preview (first 500 chars):\n{rendered[:500]}")
            
            # Check for unreplaced tags
            if "\\VAR{" in rendered or "\\BLOCK{" in rendered:
                logger.error(f"CRITICAL: Template {template_name} contains unreplaced Jinja tags!")
                # Find where they are
                idx = rendered.find("\\VAR{")
                if idx != -1:
                    logger.error(f"First \\VAR{{ found at index {idx}: {rendered[idx:idx+50]}")
                idx = rendered.find("\\BLOCK{")
                if idx != -1:
                    logger.error(f"First \\BLOCK{{ found at index {idx}: {rendered[idx:idx+50]}")
                    
        except Exception as e:
            logger.error(f"Jinja rendering failed for {template_name}: {e}")
            raise
        
        return rendered
    
    def compile_pdf(
        self,
        latex_source: str,
        template_name: str = "modern"
    ) -> bytes:
        """
        Compile LaTeX source to PDF.
        
        Args:
            latex_source: LaTeX source code
            template_name: Name of the template (to find assets)
            
        Returns:
            PDF file contents as bytes
            
        Raises:
            RuntimeError: If compilation fails
        """
        return self._compile_pdf_local(latex_source, template_name)
    
    def _compile_pdf_local(
        self,
        latex_source: str,
        template_name: str
    ) -> bytes:
        """
        Compile LaTeX source to PDF using local LaTeX installation (Tectonic preferred).
        """
        # Path to the original template assets (fonts, cls, sty)
        template_dir = TEMPLATES_DIR / template_name
        
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # 1. Copy all template files (fonts, images, cls) to the temp dir
            # This ensures Tectonic/LaTeX can find all dependencies
            if template_dir.exists():
                try:
                    # shutil.copytree requires destination to not exist usually, 
                    # but dirs_exist_ok=True (Python 3.8+) allows merging
                    shutil.copytree(template_dir, temp_path, dirs_exist_ok=True)
                except Exception as e:
                    logger.warning(f"Could not copy template assets from {template_dir}: {e}")
            
            # 2. Write the dynamic main.tex
            # We overwrite the template's main.tex with our rendered version
            tex_file = temp_path / "main.tex"
            tex_file.write_text(latex_source, encoding='utf-8')
            
            # 3. Compile
            # Try Tectonic first, then xelatex/pdflatex
            compilers = ['tectonic', 'xelatex', 'pdflatex']
            pdf_path = None
            
            for compiler in compilers:
                try:
                    # Check if compiler exists using shutil.which (more robust)
                    if not shutil.which(compiler):
                        logger.warning(f"Compiler {compiler} not found in PATH")
                        continue
                    
                    logger.info(f"Compiling with {compiler}...")
                    
                    if compiler == 'tectonic':
                        # Tectonic compilation
                        cmd = [
                            compiler,
                            "main.tex"
                        ]
                        result = subprocess.run(
                            cmd,
                            cwd=temp_path,
                            capture_output=True,
                            text=True,
                            timeout=120
                        )
                    else:
                        # Standard LaTeX compilation (run twice for refs)
                        for _ in range(2):
                            cmd = [
                                compiler,
                                '-interaction=nonstopmode',
                                "main.tex"
                            ]
                            result = subprocess.run(
                                cmd,
                                cwd=temp_path,
                                capture_output=True,
                                text=True,
                                timeout=120
                            )
                    
                    if result.returncode != 0:
                        logger.warning(f"{compiler} compilation failed: {result.stderr or result.stdout}")
                        # If tectonic fails, we might want to try others, or just fail hard.
                        # For now, let's try others if this one failed.
                        continue

                    # Check if PDF was created
                    # Tectonic output might be named differently depending on args, but usually matches input
                    pdf_path = temp_path / "main.pdf"
                    if pdf_path.exists():
                        break  # Success!
                
                except subprocess.TimeoutExpired:
                    logger.error(f"LaTeX compilation timed out with {compiler}")
                    continue
                except Exception as e:
                    logger.error(f"Error running {compiler}: {e}")
                    continue
            
            if pdf_path is None or not pdf_path.exists():
                # Try to read log for debugging
                log_file = temp_path / "main.log"
                log_content = "No log file generated."
                if log_file.exists():
                    log_content = log_file.read_text(encoding='utf-8', errors='ignore')
                
                raise RuntimeError(
                    f"LaTeX compilation failed. Log output:\n{log_content[:1000]}..."
                )
            
            # Read PDF file
            pdf_content = pdf_path.read_bytes()
            
            return pdf_content

    def generate_pdf(
        self,
        resume_data: Dict[str, Any],
        template_name: str = "modern"
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
        pdf_content = self.compile_pdf(latex_source, template_name)
        
        return pdf_content


# Singleton instance
latex_compiler = LaTeXCompiler()
