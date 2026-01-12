"""
Template Service - Production-Ready
Fetches email templates from S3 for preview and variable extraction.
"""

import boto3
import json
from typing import Dict, List, Optional
from functools import lru_cache
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class TemplateService:
    """
    Service to fetch and manage email templates from S3.
    Uses caching to minimize S3 API calls.
    """
    
    def __init__(self):
        """Initialize S3 client with AWS credentials."""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.EMAIL_TEMPLATE_S3_BUCKET
        self._template_cache = {}
        self._email_map_cache = None
    
    async def get_template(self, template_name: str, force_refresh: bool = False) -> Optional[str]:
        """
        Fetch template HTML from S3 with caching.
        
        Args:
            template_name: Template name (e.g., "BillingTemplate")
            force_refresh: Force refresh from S3, bypass cache
            
        Returns:
            HTML template string or None if not found
        """
        # Check cache first
        if not force_refresh and template_name in self._template_cache:
            logger.info(f"Template cache hit: {template_name}")
            return self._template_cache[template_name]
        
        try:
            # Fetch from S3
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=f"templates/{template_name}.html"
            )
            
            html_content = response['Body'].read().decode('utf-8')
            
            # Cache it
            self._template_cache[template_name] = html_content
            
            logger.info(f"✅ Template fetched from S3: {template_name}")
            return html_content
            
        except self.s3_client.exceptions.NoSuchKey:
            logger.error(f"❌ Template not found: {template_name}")
            return None
        except Exception as e:
            logger.error(f"❌ Error fetching template: {str(e)}")
            return None
    
    async def get_email_map(self, force_refresh: bool = False) -> Dict:
        """
        Fetch email_map.json from S3 with caching.
        
        Args:
            force_refresh: Force refresh from S3
            
        Returns:
            Email map dict {type: {from, template}}
        """
        # Check cache
        if not force_refresh and self._email_map_cache:
            logger.info("Email map cache hit")
            return self._email_map_cache
        
        try:
            # Fetch from S3
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key="config/email_map.json"
            )
            
            email_map = json.loads(response['Body'].read().decode('utf-8'))
            
            # Cache it
            self._email_map_cache = email_map
            
            logger.info("✅ Email map fetched from S3")
            return email_map
            
        except Exception as e:
            logger.error(f"❌ Error fetching email_map: {str(e)}")
            return {}
    
    async def get_template_by_type(self, email_type: str) -> Optional[str]:
        """
        Get template HTML by email type (e.g., "billing", "welcome").
        Uses email_map.json to find template name.
        
        Args:
            email_type: Type from email_map.json
            
        Returns:
            HTML template string or None
        """
        email_map = await self.get_email_map()
        
        template_info = email_map.get(email_type)
        if not template_info:
            logger.error(f"Unknown email type: {email_type}")
            return None
        
        template_name = template_info.get('template')
        if not template_name:
            logger.error(f"No template name for type: {email_type}")
            return None
        
        return await self.get_template(template_name)
    
    async def list_available_templates(self) -> List[Dict[str, str]]:
        """
        List all available email templates from email_map.
        
        Returns:
            List of {type, template, from} dicts
        """
        email_map = await self.get_email_map()
        
        templates = []
        for email_type, info in email_map.items():
            templates.append({
                "type": email_type,
                "template": info.get("template"),
                "from": info.get("from"),
                "subject": info.get("subject", f"{email_type.title()} Email")
            })
        
        return templates
    
    def clear_cache(self):
        """Clear template cache (useful for dev/testing)."""
        self._template_cache.clear()
        self._email_map_cache = None
        logger.info("Template cache cleared")


# Global template service instance
template_service = TemplateService()
