"""Test local LaTeX compilation with MiKTeX"""
import sys
sys.path.insert(0, 'backend')

from app.services.latex_compiler import LaTeXCompiler

# Simple test LaTeX document
test_latex = r"""
\documentclass[a4paper,11pt]{article}
\usepackage{fontawesome5}
\usepackage{xcolor}
\usepackage{geometry}
\usepackage{hyperref}

\geometry{left=2cm, top=2cm, right=2cm, bottom=2cm}

\begin{document}
\section*{Test Document}
This is a test to verify MiKTeX can compile our resume templates.

\subsection*{Required Packages Test:}
\begin{itemize}
    \item \textbf{fontawesome5:} \faPhone\ Icons work
    \item \textbf{xcolor:} {\color{blue}Colors work}
    \item \textbf{hyperref:} \href{https://example.com}{Links work}
\end{itemize}

\end{document}
"""

print("Testing LaTeX compilation with MiKTeX...")
print("=" * 80)

compiler = LaTeXCompiler()

try:
    pdf_content = compiler.compile_pdf(test_latex, "test_document")
    print(f"✅ SUCCESS! Generated PDF of {len(pdf_content)} bytes")
    
    # Save to file for verification
    with open("test_output.pdf", "wb") as f:
        f.write(pdf_content)
    print("✅ Saved to test_output.pdf - you can open it to verify")
    
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
