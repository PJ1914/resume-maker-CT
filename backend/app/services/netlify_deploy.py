"""
Netlify deployment service
Handles portfolio deployment to Netlify using Personal Access Token
"""
import requests
import zipfile
import tempfile
import os
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class NetlifyDeployService:
    """Service for deploying portfolios to Netlify"""
    
    NETLIFY_API_BASE = "https://api.netlify.com/api/v1"
    
    def __init__(self):
        pass
    
    async def deploy(
        self,
        user_id: str,
        session_id: str,
        site_name: str,
        zip_url: str,
        netlify_token: str
    ) -> Dict[str, Any]:
        """
        Deploy portfolio to Netlify using PAT
        
        Args:
            user_id: Firebase user ID
            session_id: Portfolio session ID
            site_name: Name for the Netlify site
            zip_url: URL to the portfolio ZIP file
            netlify_token: Netlify Personal Access Token
        
        Returns:
            Dict with url, status, and deployment info
        """
        try:
            # Verify token and get user info
            user_info = self._get_user_info(netlify_token)
            username = user_info.get('slug') or user_info.get('email', 'user')
            logger.info(f"🚀 Deploying to Netlify for user: {username}")
            
            # Download ZIP file
            zip_path = self._download_zip(zip_url)
            logger.info(f"📦 Downloaded ZIP file")
            
            # Create or get site
            site = self._create_or_get_site(site_name, netlify_token)
            site_id = site['id']
            site_url = site.get('ssl_url') or site.get('url')
            
            logger.info(f"📍 Deploying to site: {site_id}")
            
            # Deploy ZIP to site
            deployment = self._deploy_zip(
                site_id=site_id,
                zip_path=zip_path,
                netlify_token=netlify_token
            )
            
            # Clean up temp file
            os.unlink(zip_path)
            
            deploy_url = deployment.get('ssl_url') or deployment.get('deploy_ssl_url') or site_url
            
            logger.info(f"✅ Netlify deployment successful: {deploy_url}")
            
            return {
                "url": deploy_url,
                "status": "deployed",
                "site_id": site_id,
                "deployment_id": deployment.get('id'),
                "message": f"Portfolio deployed successfully to Netlify! May take 1-2 minutes to become available."
            }
            
        except Exception as e:
            logger.error(f"❌ Netlify deployment failed: {str(e)}")
            raise Exception(f"Netlify deployment failed: {str(e)}")
    
    def _get_user_info(self, netlify_token: str) -> Dict[str, Any]:
        """Get Netlify user information to verify token"""
        headers = {
            "Authorization": f"Bearer {netlify_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{self.NETLIFY_API_BASE}/user", headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Invalid Netlify token: {response.json().get('message', 'Unknown error')}")
        
        return response.json()
    
    def _download_zip(self, zip_url: str) -> str:
        """
        Download ZIP from URL and save to temp file
        
        Returns:
            Path to temporary ZIP file
        """
        response = requests.get(zip_url, timeout=30)
        if response.status_code != 200:
            raise Exception(f"Failed to download ZIP: HTTP {response.status_code}")
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as tmp_file:
            tmp_file.write(response.content)
            return tmp_file.name
    
    def _create_or_get_site(self, site_name: str, netlify_token: str) -> Dict[str, Any]:
        """Create a new Netlify site or get existing one"""
        headers = {
            "Authorization": f"Bearer {netlify_token}",
            "Content-Type": "application/json"
        }
        
        # Try to create new site
        payload = {
            "name": site_name
        }
        
        response = requests.post(
            f"{self.NETLIFY_API_BASE}/sites",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            return response.json()
        
        # If site name exists, try to get it
        if response.status_code == 422:
            # Site name might already exist, list sites and find it
            list_response = requests.get(
                f"{self.NETLIFY_API_BASE}/sites",
                headers=headers,
                timeout=30
            )
            
            if list_response.status_code == 200:
                sites = list_response.json()
                for site in sites:
                    if site.get('name') == site_name:
                        return site
            
            # If not found, create with random name
            payload = {}  # Let Netlify assign a random name
            response = requests.post(
                f"{self.NETLIFY_API_BASE}/sites",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return response.json()
        
        raise Exception(f"Failed to create Netlify site: {response.json().get('message', 'Unknown error')}")
    
    def _deploy_zip(self, site_id: str, zip_path: str, netlify_token: str) -> Dict[str, Any]:
        """Deploy ZIP file to Netlify site"""
        headers = {
            "Authorization": f"Bearer {netlify_token}",
            "Content-Type": "application/zip"
        }
        
        # Read ZIP file
        with open(zip_path, 'rb') as f:
            zip_content = f.read()
        
        # Deploy to site
        response = requests.post(
            f"{self.NETLIFY_API_BASE}/sites/{site_id}/deploys",
            headers=headers,
            data=zip_content,
            timeout=120
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to deploy to Netlify: {response.json().get('message', 'Unknown error')}")
        
        return response.json()

    def delete_site(self, site_id: str, netlify_token: str) -> bool:
        """
        Delete a Netlify site
        
        Args:
            site_id: ID of the site to delete
            netlify_token: Netlify Personal Access Token
        """
        try:
            headers = {
                "Authorization": f"Bearer {netlify_token}",
            }
            
            logger.info(f"🗑️ Deleting Netlify site: {site_id}")
            
            response = requests.delete(
                f"{self.NETLIFY_API_BASE}/sites/{site_id}",
                headers=headers
            )
            
            if response.status_code == 204:
                 logger.info(f"✅ Netlify site deleted: {site_id}")
                 return True
            elif response.status_code == 404:
                 logger.warning(f"Netlify site {site_id} not found")
                 return True
            else:
                 error_msg = response.json().get('message', 'Unknown error')
                 raise Exception(f"Netlify API Error: {error_msg}")
                 
        except Exception as e:
            logger.error(f"❌ Failed to delete Netlify site: {str(e)}")
            raise
