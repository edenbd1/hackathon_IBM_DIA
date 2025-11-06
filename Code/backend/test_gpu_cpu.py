import requests
import json

url = 'http://localhost:5000/api/gpu-cpu-distribution'

print("Testing GPU-CPU distribution endpoint...")
response = requests.get(url)
result = response.json()

print("\n=== Backend Response ===")
print(json.dumps(result, indent=2))

print("\n=== Data Summary ===")
print(f"Number of items: {len(result)}")
if len(result) > 0:
    print(f"\nFirst item:")
    print(f"  name: {result[0].get('name')}")
    print(f"  GPU: {result[0].get('GPU')}%")
    print(f"  CPU: {result[0].get('CPU')}%")
    print(f"  gpu_wh: {result[0].get('gpu_wh')} Wh")
    print(f"  cpu_wh: {result[0].get('cpu_wh')} Wh")
