const { useState } = React;

function AgentList({ agents, onSelect }) {
  return (
    <div id="agent-list">
      <h3>Agents</h3>
      <ul>
        {agents.map(agent => (
          <li key={agent.id} onClick={() => onSelect(agent)}>
            <strong>{agent.name}</strong> - {agent.role} ({agent.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgentModal({ agent, onClose }) {
  if (!agent) return null;
  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <h3>{agent.name}</h3>
        <p><strong>Role:</strong> {agent.role}</p>
        <p><strong>Status:</strong> {agent.status}</p>
        <p>{agent.description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </>
  );
}

function ModelStatus({ models }) {
  return (
    <div id="model-status">
      <h3>Local Model Status</h3>
      {models.map((m, idx) => (
        <div key={idx}>
          <strong>{m.name}</strong> - {m.running ? 'Running' : 'Stopped'} - {m.tps} tokens/s
          <div style={{fontSize: '0.9em', color: '#555'}}>{m.log}</div>
        </div>
      ))}
    </div>
  );
}

function Terminal({ logs, onCommand }) {
  const [cmd, setCmd] = useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommand(cmd);
      setCmd('');
    }
  };
  return (
    <div>
      <textarea id="command-input" rows="2" value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={handleKey} placeholder="Enter command and press Enter" />
      <div id="terminal">
        {logs.map((l,i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

function Settings({ settings, onChange, onKeyChange }) {
  const update = (field, value) => onChange({ ...settings, [field]: value });
  return (
    <div id="settings">
      <h3>LLM Settings</h3>
      <div>
        Temperature:{' '}
        <input
          type="number"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => update('temperature', parseFloat(e.target.value))}
        />
      </div>
      <div>
        Top P:{' '}
        <input
          type="number"
          step="0.1"
          value={settings.top_p}
          onChange={(e) => update('top_p', parseFloat(e.target.value))}
        />
      </div>
      <div>
        Max Tokens:{' '}
        <input
          type="number"
          value={settings.max_tokens}
          onChange={(e) => update('max_tokens', parseInt(e.target.value))}
        />
      </div>
      <div>
        Premium Key:{' '}
        <input type="number" onChange={(e) => onKeyChange(e.target.value)} />
      </div>
    </div>
  );
}

function App() {
  const [agents] = useState([
    { id: 1, name: 'Planner', role: 'Planning', status: 'Idle', description: 'Plans tasks' },
    { id: 2, name: 'Worker', role: 'Execution', status: 'Running', description: 'Executes tasks' }
  ]);
  const [selected, setSelected] = useState(null);
  const [premiumKey, setPremiumKey] = useState('');
  const premiumEnabled = premiumKey === '1234';
  const models = [
    { name: 'llama.cpp', running: true, tps: 15, log: 'ready' },
    { name: 'gguf model', running: false, tps: 0, log: 'stopped' },
    { name: 'ghost-core (phi-2)', running: true, tps: 20, log: 'training complete' },
    { name: 'ghost-pro', running: premiumEnabled, tps: premiumEnabled ? 30 : 0, log: premiumEnabled ? 'ready' : 'locked' }
  ];
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ temperature: 0.7, top_p: 0.9, max_tokens: 512 });

  const handleCommand = (cmd) => {
    setLogs(logs => [...logs, '> '+cmd, 'Response: ...']);
  };

  return (
    <>
      <header>Tence AI Dashboard</header>
      <div id="container">
        <AgentList agents={agents} onSelect={setSelected} />
        <div id="main">
          <div id="knowledge-graph">Knowledge Graph Visualization</div>
          <ModelStatus models={models} />
          <Terminal logs={logs} onCommand={handleCommand} />
          <Settings settings={settings} onChange={setSettings} onKeyChange={setPremiumKey} />
        </div>
      </div>
      <AgentModal agent={selected} onClose={() => setSelected(null)} />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
