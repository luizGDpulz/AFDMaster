import os
from time import sleep

examples_dir = r"c:\Utilities\Projects\AFDMaster"
file_path = os.path.join(examples_dir, "ExemploAFD1510.txt")
out_path = os.path.join(examples_dir, "TestAFD_Warnings.txt")

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Induzindo duplicação e numeração ímpar
# Vamos pegar as 5 primeiras batidas (tipo 3) e duplicar a última com 1 min de diferença
tipo3_lines = [l for l in lines if l.startswith("0000000003")]
if len(tipo3_lines) > 5:
    target_idx = lines.index(tipo3_lines[2])
    # clona a batida 3
    cloned = lines[target_idx]
    # avança 1 minuto (ex: 0800 -> 0801) - string fixed position hack for 1510
    # Pos 019-022 Hora
    hora_str = cloned[18:22]
    nova_hora = f"{(int(hora_str) + 1):04d}"
    cloned = cloned[:18] + nova_hora + cloned[22:]
    
    # insert cloned just after
    lines.insert(target_idx + 1, cloned)

# Salvar arquivo alterado
with open(out_path, "w", encoding="utf-8") as f:
    f.writelines(lines)
    
print(f"Generated {out_path} for testing warnings and odd pairs.")
