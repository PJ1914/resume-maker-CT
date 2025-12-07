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
TemplateType = Literal["modern", "classic", "minimalist", "awesomecv", "moderncv", "engineering", "simple", "onepage", "resume_1", "resume_2", "resume_3", "resume_4", "resume_5", "resume_6", "resume_7"]

# Get templates directory
TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "latex"


class LaTeXCompiler:
    """Handles LaTeX template rendering and PDF compilation"""
    
    def __init__(self):
        """Initialize Jinja2 environment for LaTeX templates"""
        # Configure Jinja2 with LaTeX-friendly delimiters
        # IMPORTANT: NO line-based prefixes to avoid conflicts with LaTeX % comments
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            block_start_string='\\BLOCK{',
            block_end_string='}',
            variable_start_string='\\VAR{',
            variable_end_string='}',
            comment_start_string='\\#{',
            comment_end_string='}',
            line_statement_prefix=None,  # Explicitly disable line statements
            line_comment_prefix=None,    # Explicitly disable line comments (prevents % issues)
            trim_blocks=True,
            autoescape=False,
            cache_size=0, # Disable cache
        )
        
        # Register filters
        self.jinja_env.filters['escape_tex'] = self.escape_latex
        self.jinja_env.filters['escape_tex_def'] = self.escape_latex_for_def
    
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
    
    def escape_latex_for_def(self, s: Any) -> str:
        """
        Escape special LaTeX characters for use in macro definitions (\\def, \\gdef).
        In macro definitions, # must be doubled to ##.
        
        Args:
            s: String to escape
            
        Returns:
            Escaped string safe for use in LaTeX macro definitions
        """
        if not s:
            return ""
            
        return str(s).replace('#', '\\#\\#') \
                     .replace('&', '\\&') \
                     .replace('%', '\\%') \
                     .replace('$', '\\$') \
                     .replace('_', '\\_') \
                     .replace('{', '\\{') \
                     .replace('}', '\\}') \
                     .replace('~', '\\textasciitilde') \
                     .replace('^', '\\textasciicircum')

    def render_template(
        self,
        template_name: str,
        resume_data: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Render LaTeX template with resume data.
        
        Args:
            template_name: Name of the template folder (e.g., 'awesomecv')
            resume_data: Resume data from Firestore
            
        Returns:
            Dictionary of {filename: rendered_content} for all template files
            
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
        rendered_files = {}
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
            
            rendered_files['main.tex'] = rendered
            
            # Note: page1sidebar.tex is now embedded inline in main.tex for proper Jinja2 rendering
                    
        except Exception as e:
            logger.error(f"Jinja rendering failed for {template_name}: {e}")
            raise
        
        return rendered_files
    
    def compile_pdf(
        self,
        latex_source: str,
        template_name: str = "modern",
        additional_files: Optional[Dict[str, str]] = None
    ) -> bytes:
        """
        Compile LaTeX source to PDF.
        
        Args:
            latex_source: LaTeX source code (main.tex content)
            template_name: Name of the template (to find assets)
            additional_files: Dictionary of {filename: content} for additional template files
            
        Returns:
            PDF file contents as bytes
            
        Raises:
            RuntimeError: If compilation fails
        """
        return self._compile_pdf_local(latex_source, template_name, additional_files)
    
    def _compile_pdf_local(
        self,
        latex_source: str,
        template_name: str,
        additional_files: Optional[Dict[str, str]] = None
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
            
            # 3. Write any additional template files (like page1sidebar.tex)
            if additional_files:
                for filename, content in additional_files.items():
                    file_path = temp_path / filename
                    file_path.write_text(content, encoding='utf-8')
                    logger.info(f"Wrote additional template file: {filename}")
            # Use pdflatex from MiKTeX (skip tectonic due to fontconfig issues)
            # For resume_4, use only pdflatex as it uses res.cls which works better with pdf latex
            if template_name == 'resume_4':
                compilers = ['pdflatex']
            else:
                compilers = ['pdflatex', 'xelatex']
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
                        # Enable automatic package installation for MiKTeX
                        env = os.environ.copy()
                        env['MIKTEX_TEMP'] = str(temp_path)
                        env['MIKTEX_ENABLE_INSTALLER'] = 't'  # Auto-install missing packages
                        
                        for run_num in range(2):
                            cmd = [
                                compiler,
                                '-interaction=nonstopmode',
                                '-halt-on-error',
                                '-file-line-error',
                                "main.tex"
                            ]
                            logger.info(f"{compiler} run {run_num + 1}/2...")
                            result = subprocess.run(
                                cmd,
                                cwd=temp_path,
                                capture_output=True,
                                text=True,
                                timeout=240,  # Increase timeout to allow package installation
                                env=env
                            )
                            
                            # Log output for debugging
                            if result.stdout:
                                logger.debug(f"{compiler} stdout: {result.stdout[-500:]}")
                            if result.stderr:
                                logger.debug(f"{compiler} stderr: {result.stderr[-500:]}")
                    
                    if result.returncode != 0:
                        # Log full error for debugging
                        error_msg = result.stderr or result.stdout
                        logger.warning(f"{compiler} compilation failed with code {result.returncode}")
                        if error_msg:
                            logger.warning(f"Error output (last 1000 chars): {error_msg[-1000:]}")
                        # Try next compiler
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
                    try:
                        log_content = log_file.read_text(encoding='utf-8', errors='ignore')
                        # Extract key error lines
                        error_lines = [line for line in log_content.split('\n') if '!' in line or 'Error' in line or 'error' in line]
                        if error_lines:
                            logger.error(f"LaTeX errors found: {error_lines[:10]}")
                    except Exception as e:
                        logger.error(f"Could not read log file: {e}")
                
                # Also save the generated .tex file for debugging
                tex_content = "Could not read .tex file"
                tex_file_path = temp_path / "main.tex"
                if tex_file_path.exists():
                    try:
                        tex_content = tex_file_path.read_text(encoding='utf-8', errors='ignore')
                        logger.error(f"Generated LaTeX (first 1000 chars):\n{tex_content[:1000]}")
                    except Exception as e:
                        logger.error(f"Could not read tex file: {e}")
                
                raise RuntimeError(
                    f"LaTeX compilation failed. Check logs for details. Log preview:\n{log_content[:2000]}..."
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
        # Render LaTeX template (returns dict of {filename: content})
        rendered_files = self.render_template(template_name, resume_data)
        
        # Extract main.tex content and any additional files
        latex_source = rendered_files.get('main.tex', '')
        additional_files = {k: v for k, v in rendered_files.items() if k != 'main.tex'}
        
        # Compile to PDF
        pdf_content = self.compile_pdf(latex_source, template_name, additional_files)
        
        return pdf_content


# Singleton instance
latex_compiler = LaTeXCompiler()
