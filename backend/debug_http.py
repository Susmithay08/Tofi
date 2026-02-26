import urllib.request
import json

data = json.dumps({"message": "what is 2+2"}).encode()
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/chat/",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req) as resp:
        print("SUCCESS:", resp.read().decode())
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP ERROR", e.code, ":", body)