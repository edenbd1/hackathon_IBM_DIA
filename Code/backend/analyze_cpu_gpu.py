import pandas as pd
import os

# Load all CSV files and check CPU vs GPU consumption
data_dir = 'C:/Users/famil/OneDrive/Documents/hackathon_IBM_DIA/Code/data'
csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]

results = []

for csv_file in csv_files:
    file_path = os.path.join(data_dir, csv_file)
    df = pd.read_csv(file_path)
    
    # Extract model and platform from filename
    parts = csv_file.replace('.csv', '').split('_')
    
    # Calculate averages
    if 'energy_consumption_llm_cpu' in df.columns and 'energy_consumption_llm_gpu' in df.columns:
        avg_cpu = df['energy_consumption_llm_cpu'].mean()
        avg_gpu = df['energy_consumption_llm_gpu'].mean()
        total = avg_cpu + avg_gpu
        
        if total > 0:
            cpu_percent = (avg_cpu / total) * 100
            gpu_percent = (avg_gpu / total) * 100
            
            results.append({
                'file': csv_file,
                'avg_cpu_kwh': avg_cpu,
                'avg_gpu_kwh': avg_gpu,
                'cpu_percent': cpu_percent,
                'gpu_percent': gpu_percent,
                'dominant': 'CPU' if cpu_percent > gpu_percent else 'GPU'
            })

# Sort by CPU percentage (descending)
results_sorted = sorted(results, key=lambda x: x['cpu_percent'], reverse=True)

print("\n=== Top 10 CPU-dominant configurations ===")
for i, r in enumerate(results_sorted[:10], 1):
    print(f"\n{i}. {r['file']}")
    print(f"   CPU: {r['avg_cpu_kwh']:.6f} kWh ({r['cpu_percent']:.1f}%)")
    print(f"   GPU: {r['avg_gpu_kwh']:.6f} kWh ({r['gpu_percent']:.1f}%)")
    print(f"   Dominant: {r['dominant']}")

print("\n\n=== Top 10 GPU-dominant configurations ===")
results_gpu = sorted(results, key=lambda x: x['gpu_percent'], reverse=True)
for i, r in enumerate(results_gpu[:10], 1):
    print(f"\n{i}. {r['file']}")
    print(f"   CPU: {r['avg_cpu_kwh']:.6f} kWh ({r['cpu_percent']:.1f}%)")
    print(f"   GPU: {r['avg_gpu_kwh']:.6f} kWh ({r['gpu_percent']:.1f}%)")
    print(f"   Dominant: {r['dominant']}")
