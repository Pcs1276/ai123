# Tence AI Dashboard

This project provides a minimal dashboard to visualize and control Tence AI agents.
Open `index.html` in a browser to view the dashboard.

## Premium AI

An upgraded `ghost-pro` model is displayed in the dashboard. Enter the numeric
key `1234` in the **Premium Key** field to enable the premium model.

## Offline Chat

The `tence_ai.py` script starts a local Gradio chat interface using a
phi-3 model stored in the `ghost-core-lora` directory. Free users get five
turns unless they enter `TENCEPRO2025`. Usage data and chat history are saved in
`user_data.json` and `chat_history.json` so sessions persist offline.
