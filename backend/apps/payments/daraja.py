"""
Daraja API Service for M-Pesa Integration
Handles OAuth authentication, STK Push, and payment callbacks
"""
import requests
import base64
from datetime import datetime
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class DarajaAPI:
    """Service class for Safaricom Daraja API integration"""
    
    def __init__(self):
        self.consumer_key = getattr(settings, 'DARAJA_CONSUMER_KEY', '')
        self.consumer_secret = getattr(settings, 'DARAJA_CONSUMER_SECRET', '')
        self.business_short_code = getattr(settings, 'DARAJA_BUSINESS_SHORT_CODE', '')
        self.passkey = getattr(settings, 'DARAJA_PASSKEY', '')
        self.callback_url = getattr(settings, 'DARAJA_CALLBACK_URL', '')
        self.environment = getattr(settings, 'DARAJA_ENVIRONMENT', 'sandbox')
        
        # Set base URLs based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
    
    def get_access_token(self):
        """
        Get OAuth access token from Daraja API
        Returns: access_token string or None if failed
        """
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        try:
            # Create basic auth credentials
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}'
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            access_token = data.get('access_token')
            
            logger.info("Successfully obtained Daraja access token")
            return access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Daraja access token: {str(e)}")
            return None
    
    def generate_password(self):
        """
        Generate password for STK Push
        Password = Base64(BusinessShortCode + Passkey + Timestamp)
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_short_code}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode()).decode()
        return encoded, timestamp
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push (Lipa Na M-Pesa Online)
        
        Args:
            phone_number: Phone number in format 254XXXXXXXXX
            amount: Amount to charge
            account_reference: Reference for the transaction
            transaction_desc: Description of the transaction
            
        Returns:
            dict with response data or None if failed
        """
        access_token = self.get_access_token()
        if not access_token:
            return None
        
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        password, timestamp = self.generate_password()
        
        # Ensure phone number is in correct format
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]
        elif not phone_number.startswith('254'):
            phone_number = '254' + phone_number
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "BusinessShortCode": self.business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),  # Must be integer
            "PartyA": phone_number,
            "PartyB": self.business_short_code,
            "PhoneNumber": phone_number,
            "CallBackURL": self.callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"STK Push initiated successfully: {data}")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to initiate STK Push: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
            return None
    
    def query_transaction_status(self, checkout_request_id):
        """
        Query the status of an STK Push transaction
        
        Args:
            checkout_request_id: CheckoutRequestID from STK Push response
            
        Returns:
            dict with transaction status or None if failed
        """
        access_token = self.get_access_token()
        if not access_token:
            return None
        
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        password, timestamp = self.generate_password()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "BusinessShortCode": self.business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Transaction status query successful: {data}")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to query transaction status: {str(e)}")
            return None


# Singleton instance
daraja_api = DarajaAPI()
