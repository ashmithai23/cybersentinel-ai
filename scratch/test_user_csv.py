import pandas as pd
from ml.predict import CyberSentinelInferenceEngine

engine = CyberSentinelInferenceEngine()
df = pd.read_csv(r"C:\Users\Ashmith\Downloads\cybersecurity_threat_detection_logs.csv")
print("Input CSV shape:", df.shape)

results = engine.predict_batch(df.head(10))
print(f"Processed {len(results)} rows successfully!")
for r in results[:3]:
    print(f"Index #{r['event_index']}: Prediction={r['prediction']} | Conf={r['confidence']}% | Severity={r['severity']}")
