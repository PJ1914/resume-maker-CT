"""
Vercel deployment service
Handles portfolio deployment to Vercel using Personal Access Token
"""
import requests
import zipfile
import tempfile
import os
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class VercelDeployService:
    """Service for deploying portfolios to Vercel"""
    
    VERCEL_API_BASE = "https://api.vercel.com"
    
    def __init__(self):
        pass
    
    async def deploy(
        self,
        user_id: str,
        session_id: str,
        project_name: str,
        zip_url: str,
        vercel_token: str
    ) -> Dict[str, Any]:
        """
        Deploy portfolio to Vercel using PAT
        
        Args:
            user_id: Firebase user ID
            session_id: Portfolio session ID
            project_name: Name for the Vercel project
            zip_url: URL to the portfolio ZIP file
            vercel_token: Vercel Personal Access Token
        
        Returns:
            Dict with url, status, and deployment info
        """
        try:
            # Verify token and get user info
            user_info = self._get_user_info(vercel_token)
            username = user_info.get('username') or user_info.get('name', 'user')
            logger.info(f"🚀 Deploying to Vercel for user: {username}")
            
            # Download and extract ZIP
            files_content = self._download_and_extract_zip(zip_url)
            logger.info(f"📦 Extracted {len(files_content)} files from ZIP")
            
            # Prepare deployment payload
            deployment_payload = {
                "name": project_name,
                "files": files_content,
                "projectSettings": {
                    "framework": None,  # Static site
                    "buildCommand": None,
                    "outputDirectory": None
                },
                "target": "production"
            }
            
            # Create deployment
            deployment_result = self._create_deployment(
                payload=deployment_payload,
                vercel_token=vercel_token
            )
            
            deployment_url = deployment_result.get('url')
            if not deployment_url.startswith('https://'):
                deployment_url = f"https://{deployment_url}"
            
            logger.info(f"✅ Vercel deployment successful: {deployment_url}")
            
            return {
                "url": deployment_url,
                "status": "deployed",
                "deployment_id": deployment_result.get('id'),
                "message": f"Portfolio deployed successfully to Vercel! May take 1-2 minutes to become available."
            }
            
        except Exception as e:
            logger.error(f"❌ Vercel deployment failed: {str(e)}")
            raise Exception(f"Vercel deployment failed: {str(e)}")
    
    def _get_user_info(self, vercel_token: str) -> Dict[str, Any]:
        """Get Vercel user information to verify token"""
        headers = {
            "Authorization": f"Bearer {vercel_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{self.VERCEL_API_BASE}/v2/user", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Invalid Vercel token: {response.json().get('error', {}).get('message', 'Unknown error')}")
        
        return response.json()['user']
    
    def _download_and_extract_zip(self, zip_url: str) -> list:
        """
        Download ZIP from URL and extract files for Vercel API
        
        Returns:
            List of file objects for Vercel deployment API
        """
        # Download ZIP
        response = requests.get(zip_url, timeout=30)
        if response.status_code != 200:
            raise Exception(f"Failed to download ZIP: HTTP {response.status_code}")
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name
        
        # Extract files
        files = []
        try:
            with zipfile.ZipFile(tmp_path, 'r') as zip_ref:
                for file_info in zip_ref.filelist:
                    if not file_info.is_dir():
                        file_content = zip_ref.read(file_info.filename)
                        # Vercel expects base64 or utf-8 content
                        try:
                            # Try to decode as text
                            content = file_content.decode('utf-8')
                            files.append({
                                "file": file_info.filename,
                                "data": content
                            })
                        except UnicodeDecodeError:
                            # Binary file - use base64
                            import base64
                            content = base64.b64encode(file_content).decode('utf-8')
                            files.append({
                                "file": file_info.filename,
                                "data": content,
                                "encoding": "base64"
                            })
        finally:
            os.unlink(tmp_path)
        
        return files
    
    def _create_deployment(self, payload: Dict[str, Any], vercel_token: str) -> Dict[str, Any]:
        """Create a new Vercel deployment"""
        headers = {
            "Authorization": f"Bearer {vercel_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{self.VERCEL_API_BASE}/v13/deployments",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code not in [200, 201]:
            error_msg = response.json().get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Failed to create Vercel deployment: {error_msg}")
        
        return response.json()

    def delete_project(self, project_name: str, vercel_token: str) -> bool:
        """
        Delete a Vercel project by name
        
        Args:
            project_name: Name of the project to delete
            vercel_token: Vercel Personal Access Token
        """
        try:
            headers = {
                "Authorization": f"Bearer {vercel_token}",
                "Content-Type": "application/json"
            }
            
            logger.info(f"🗑️ Deleting Vercel project: {project_name}")
            
            # Delete project
            response = requests.delete(
                f"{self.VERCEL_API_BASE}/v9/projects/{project_name}",
                headers=headers
            )
            
            if response.status_code == 204:
                logger.info(f"✅ Vercel project deleted: {project_name}")
                return True
            elif response.status_code == 404:
                logger.warning(f"Vercel project {project_name} not found")
                return True
            else:
                error_msg = response.json().get('error', {}).get('message', 'Unknown error')
                raise Exception(f"Vercel API Error: {error_msg}")
                
        except Exception as e:
            logger.error(f"❌ Failed to delete Vercel project: {str(e)}")
            raise
