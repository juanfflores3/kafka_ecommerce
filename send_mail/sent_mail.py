import smtplib
from email.message import EmailMessage

def send_email(to_address, subject, message):
    # Crear el mensaje de correo con codificación UTF-8
    email_message = EmailMessage()
    email_message.set_content(message)
    email_message['Subject'] = subject
    email_message['From'] = 'sdistribuidos18@gmail.com'
    email_message['To'] = to_address

    # Conexión al servidor SMTP de Gmail
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()  # Inicia TLS
    server.login('sdistribuidos18@gmail.com', 'ffgo bvzh jzxm jwpt')  # Credenciales de Gmail

    # Enviar el correo
    server.send_message(email_message)
    server.quit()