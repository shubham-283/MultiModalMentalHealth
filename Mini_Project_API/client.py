import webbrowser
import uvicorn
import socket

if __name__ == '__main__':
    # Get local IP dynamically
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    url = f"http://{local_ip}:8000"

    # webbrowser.open(url)
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
