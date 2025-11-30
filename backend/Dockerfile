FROM python:3.10-slim

# Install system dependencies including TeX Live for PDF generation
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port (Render sets PORT env var)
EXPOSE 8000

# Command to run
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
