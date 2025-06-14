import os
import json
import subprocess
import sys


def ensure_packages():
    """Import required packages or attempt installation."""
    try:
        import torch  # noqa: F401
        from transformers import AutoTokenizer, AutoModelForCausalLM  # noqa: F401
        import gradio as gr  # noqa: F401
        return torch, AutoTokenizer, AutoModelForCausalLM, gr
    except ImportError:
        try:
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", "transformers", "torch", "gradio"]
            )
            import torch  # noqa: F401
            from transformers import AutoTokenizer, AutoModelForCausalLM  # noqa: F401
            import gradio as gr  # noqa: F401
            return torch, AutoTokenizer, AutoModelForCausalLM, gr
        except Exception:
            print(
                "Failed to install dependencies. Please install 'transformers', 'torch', and 'gradio'."
            )
            raise


torch, AutoTokenizer, AutoModelForCausalLM, gr = ensure_packages()

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if torch.cuda.is_available() else torch.float32

MODEL_PATH = os.environ.get("MODEL_PATH", "ghost-core-lora")
USER_FILE = "user_data.json"
HISTORY_FILE = "chat_history.json"
MAX_FREE_TURNS = 5
PREMIUM_CODE = "TENCEPRO2025"

# Load or initialize user data
if os.path.exists(USER_FILE):
    with open(USER_FILE, "r") as f:
        user_data = json.load(f)
else:
    user_data = {"premium": False, "use_count": 0}

use_count = user_data.get("use_count", 0)

chat_history = load_history()


def save_user_data():
    user_data["use_count"] = use_count
    with open(USER_FILE, "w") as f:
        json.dump(user_data, f)


def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []


def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f)


def load_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, torch_dtype=dtype)
    model.to(device)
    return tokenizer, model


tokenizer, model = load_model()


def chat(message, code, history, depth):
    global use_count, chat_history
    if code and code.strip() == PREMIUM_CODE:
        user_data["premium"] = True
        save_user_data()
    premium = user_data.get("premium", False)
    if not premium and use_count >= MAX_FREE_TURNS:
        history.append(("System", "Please enter the authorization code to continue."))
        return history, "", code, history
    use_count += 1
    save_user_data()
    relevant = history[-int(depth):] if depth else history
    prompt = ""
    for u, a in relevant:
        prompt += f"User: {u}\nAssistant: {a}\n"
    prompt += f"User: {message}\nAssistant:"
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    max_tokens = 200 if premium else 50
    outputs = model.generate(**inputs, max_new_tokens=max_tokens, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "Assistant:" in response:
        response = response.split("Assistant:")[-1].strip()
    history.append((message, response))
    chat_history = history
    save_history(chat_history)
    save_user_data()
    return history, "", code, history


def main():
    with gr.Blocks() as demo:
        gr.Markdown("# Tence AI")
        state = gr.State(chat_history)
        chatbot = gr.Chatbot()
        with gr.Row():
            txt = gr.Textbox(label="Question", placeholder="Ask anything")
            auth = gr.Textbox(label="Auth Code", placeholder="Enter code if available")
        depth = gr.Slider(1, 10, value=3, step=1, label="Memory Depth")
        send = gr.Button("Send")
        send.click(chat, [txt, auth, state, depth], [chatbot, txt, auth, state])
        txt.submit(chat, [txt, auth, state, depth], [chatbot, txt, auth, state])
    demo.launch()


if __name__ == "__main__":
    main()
