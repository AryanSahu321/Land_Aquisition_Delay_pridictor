from datetime import date
import requests
# EmailJS Credentials
SERVICE_ID = "service_3w5qs6s" 
TEMPLATE_ID = "template_xrnc9k1"  
PUBLIC_KEY = "BhtYrfQja4PTDmpUZ"  
PRIVATE_KEY = "70K19Qq0tTfl4-XnzyJZQ"  
def send_delay_alert(project_name, delay_days):
    url = "https://api.emailjs.com/api/v1.0/email/send"
    payload = {
        "service_id": SERVICE_ID,
        "template_id": TEMPLATE_ID,
        "user_id": PUBLIC_KEY,
        "accessToken": PRIVATE_KEY,  
        "template_params": {
            "project_name": project_name,
            "predicted_delay_days": delay_days,
            "prediction_date": str(date.today()),
        },
    }
    response = requests.post(url, json=payload)

    if response.status_code == 200:
        print(f"Alert mail sent successfully for project: {project_name}")
    else:
        print(
            f"Failed to send mail. Status: {response.status_code}, Response: {response.text}"
        )