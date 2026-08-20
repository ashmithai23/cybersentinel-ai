import os
import json

def load_evaluation_summary(model_dir: str = "models") -> dict:
    comp_path = os.path.join(model_dir, "model_comparison.json")
    if not os.path.exists(comp_path):
        raise FileNotFoundError("Model comparison metrics not found. Run 'python ml/train.py' first.")
    with open(comp_path, "r") as f:
        return json.load(f)

def print_evaluation_report():
    summary = load_evaluation_summary()
    print("=" * 80)
    print("              CYBERSENTINEL AI - MODEL EVALUATION SUMMARY")
    print("=" * 80)
    print(f"{'Model':<25} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1-Score':<8} | {'ROC-AUC':<8}")
    print("-" * 80)
    for model_name, metrics in summary.items():
        print(
            f"{model_name:<25} | "
            f"{metrics['accuracy']:<8.4f} | "
            f"{metrics['precision']:<9.4f} | "
            f"{metrics['recall']:<8.4f} | "
            f"{metrics['f1_score']:<8.4f} | "
            f"{metrics['roc_auc']:<8.4f}"
        )
    print("=" * 80)

if __name__ == "__main__":
    print_evaluation_report()
