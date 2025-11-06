import pandas as pd
import os

# Load all CSV files
data_dir = 'C:/Users/famil/OneDrive/Documents/hackathon_IBM_DIA/Code/data'
csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]

# Parse files to find models with both workstation and laptop1/server
models_with_workstation = set()
models_with_cpu_platform = set()

for csv_file in csv_files:
    parts = csv_file.replace('.csv', '')
    
    if '_workstation' in parts:
        model = parts.replace('_workstation', '')
        models_with_workstation.add(model)
    
    if '_laptop1' in parts:
        model = parts.replace('_laptop1', '')
        models_with_cpu_platform.add(model)
    
    if '_server' in parts:
        model = parts.replace('_server', '')
        models_with_cpu_platform.add(model)

print("=== Models with workstation data ===")
for m in sorted(models_with_workstation):
    print(f"  - {m}")

print("\n=== Models with laptop1/server data (CPU-dominant) ===")
for m in sorted(models_with_cpu_platform):
    print(f"  - {m}")

print("\n=== Models with BOTH workstation AND laptop1/server ===")
common_models = models_with_workstation.intersection(models_with_cpu_platform)
for m in sorted(common_models):
    print(f"  ✓ {m}")

print(f"\nTotal: {len(common_models)} models")

# Now check which ones actually have CPU data
print("\n=== Detailed CPU/GPU check for common models ===")
for model in sorted(common_models):
    # Find workstation file
    ws_file = f"{model}_workstation.csv"
    
    # Find CPU platform file
    cpu_file = None
    if f"{model}_laptop1.csv" in csv_files:
        cpu_file = f"{model}_laptop1.csv"
    elif f"{model}_server.csv" in csv_files:
        cpu_file = f"{model}_server.csv"
    
    if ws_file in csv_files and cpu_file:
        ws_df = pd.read_csv(os.path.join(data_dir, ws_file))
        cpu_df = pd.read_csv(os.path.join(data_dir, cpu_file))
        
        ws_gpu = ws_df['energy_consumption_llm_gpu'].mean()
        cpu_cpu = cpu_df['energy_consumption_llm_cpu'].mean()
        
        print(f"\n{model}:")
        print(f"  GPU (workstation): {ws_gpu * 1000:.2f} Wh")
        print(f"  CPU ({cpu_file.split('_')[-1].replace('.csv','')}): {cpu_cpu * 1000:.2f} Wh")
