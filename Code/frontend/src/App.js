import React, { useState, useEffect } from 'react';
import './App.css';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [selectedLLM, setSelectedLLM] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState('');
  const [prompt, setPrompt] = useState('');
  const [co2Score, setCo2Score] = useState(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [energyKwh, setEnergyKwh] = useState(null); // Store energy consumption from API
  const [dropdownOpen, setDropdownOpen] = useState({
    llm: false,
    platform: false,
    energy: false,
  });

  // Data from backend
  const [energyByModelData, setEnergyByModelData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  const llmOptions = [
    'alpaca_gemma_2b',
    'alpaca_gemma_7b',
    'alpaca_llama3_70b',
    'alpaca_llama3_8b',
    'codellama_70b',
    'codellama_7b',
    'gemma_2b',
    'gemma_7b'
  ];

  const energyOptions = [
    { name: 'France Mix', value: 'mix_france', co2PerKwh: 32 },
    { name: 'Nuclear', value: 'nuclear', co2PerKwh: 6 },
    { name: 'Wind', value: 'wind', co2PerKwh: 7 },
    { name: 'Solar', value: 'solar', co2PerKwh: 41 },
    { name: 'Hydro', value: 'hydro', co2PerKwh: 6 },
    { name: 'Natural Gas', value: 'gas', co2PerKwh: 490 },
    { name: 'Coal', value: 'coal', co2PerKwh: 820 },
    { name: 'EU Mix', value: 'mix_eu', co2PerKwh: 275 },
  ];

  const platformMapping = {
    'alpaca_gemma_2b': ['laptop', 'workstation'],
    'alpaca_gemma_7b': ['laptop', 'workstation'],
    'alpaca_llama3_70b': ['server'],
    'alpaca_llama3_8b': ['laptop'],
    'codellama_70b': ['workstation'],
    'codellama_7b': ['laptop', 'workstation'],
    'gemma_2b': ['laptop', 'workstation'],
    'gemma_7b': ['laptop', 'workstation']
  };

  const handleLLMSelect = (llm) => {
    setSelectedLLM(llm);
    setSelectedPlatform('');
    setDropdownOpen({ ...dropdownOpen, llm: false });
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setDropdownOpen({ ...dropdownOpen, platform: false });
  };

  const handleEnergySelect = (energy) => {
    setSelectedEnergy(energy);
    setDropdownOpen({ ...dropdownOpen, energy: false });
    
    // If we already have energy consumption data, recalculate CO2 with new energy source
    if (energyKwh !== null) {
      const energyOption = energyOptions.find(opt => opt.value === energy);
      if (energyOption) {
        const newCo2Grams = energyKwh * energyOption.co2PerKwh;
        const newCo2Mg = newCo2Grams * 1000;
        setCo2Score(newCo2Mg);
      }
    }
  };

  const handleMouseLeave = (dropdownType) => {
    setTimeout(() => {
      setDropdownOpen({ ...dropdownOpen, [dropdownType]: false });
    }, 500);
  };

  const getComparisons = (co2Milligrams) => {
    // Convert mg back to grams for calculations
    const co2Grams = co2Milligrams / 1000;
    
    const smartphoneCharge = 8; // g CO2 per charge
    const ledBulbHour = 4; // g CO2 per hour
    const treeYearAbsorption = 21000; // g CO2 per year
    
    // Calculate percentages and convert time units
    const smartphonePercent = (co2Grams / smartphoneCharge) * 100;
    const ledSeconds = (co2Grams / ledBulbHour) * 3600; // Convert hours to seconds
    const treeMinutes = (co2Grams / treeYearAbsorption) * 365 * 24 * 60; // Convert days to minutes
    
    // Format with appropriate precision
    const formatValue = (val) => {
      if (val < 0.001) return val.toExponential(2);
      if (val < 0.01) return val.toFixed(4);
      if (val < 1) return val.toFixed(3);
      if (val < 10) return val.toFixed(2);
      return val.toFixed(1);
    };
    
    return {
      smartphones: formatValue(smartphonePercent),
      ledHours: formatValue(ledSeconds),
      treeDays: formatValue(treeMinutes)
    };
  };

  const handleSubmit = () => {
    if (selectedLLM && selectedPlatform && selectedEnergy && prompt) {
      // Call backend API to calculate real CO2
      fetch(`${API_BASE_URL}/calculate-co2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedLLM,
          platform: selectedPlatform,
          energy_source: selectedEnergy,
          prompt: prompt
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('CO2 API response:', data);
          // Store energy consumption for recalculation when energy source changes
          setEnergyKwh(data.energy_kwh);
          // Convert grams to milligrams for display
          setCo2Score(data.co2_grams * 1000);
        })
        .catch(err => {
          console.error('Error calculating CO2:', err);
          alert('❌ Error: Unable to connect to the backend server.\n\nPlease make sure the backend is running on http://localhost:5000\n\nTo start the backend, run:\ncd Code/backend\npython main.py');
        });
    } else {
      alert('Please fill in all fields before submitting');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleCloseResults = () => {
    setCo2Score(null);
    setDisplayedScore(0);
    setEnergyKwh(null);
  };

  // Load data from backend on component mount
  useEffect(() => {
    // Fetch energy by model data
    fetch(`${API_BASE_URL}/energy-by-model`)
      .then(res => res.json())
      .then(data => {
        console.log('Energy by model data:', data);
        // Convert kWh to Wh (multiply by 1000) and restructure data
        const restructuredData = data.flatMap(item => {
          const platforms = [];
          if (item.Workstation > 0) {
            platforms.push({
              model: item.model,
              platform: 'Workstation',
              energy: item.Workstation * 1000
            });
          }
          if (item.Server > 0) {
            platforms.push({
              model: item.model,
              platform: 'Server',
              energy: item.Server * 1000
            });
          }
          if (item.Laptop1 > 0) {
            platforms.push({
              model: item.model,
              platform: 'Laptop1',
              energy: item.Laptop1 * 1000
            });
          }
          if (item.Laptop2 > 0) {
            platforms.push({
              model: item.model,
              platform: 'Laptop2',
              energy: item.Laptop2 * 1000
            });
          }
          return platforms;
        });
        setEnergyByModelData(restructuredData);
      })
      .catch(err => console.error('Error fetching energy-by-model:', err));

    // Fetch timeline data
    fetch(`${API_BASE_URL}/energy-timeline`)
      .then(res => res.json())
      .then(data => {
        console.log('Timeline data:', data);
        // Convert kWh to Wh (multiply by 1000)
        const convertedData = data.map(item => ({
          ...item,
          CodeLlama_WS: item.CodeLlama_WS * 1000,
          Gemma2B_L1: item.Gemma2B_L1 * 1000,
          Llama3_70B_S: item.Llama3_70B_S * 1000
        }));
        setTimelineData(convertedData);
      })
      .catch(err => console.error('Error fetching timeline:', err));

    // Fetch efficiency data
    fetch(`${API_BASE_URL}/energy-efficiency`)
      .then(res => res.json())
      .then(data => {
        console.log('Efficiency data:', data);
        // Convert kWh to Wh (multiply by 1000)
        const convertedData = data.map(item => ({
          ...item,
          energy: item.energy * 1000
        }));
        setEfficiencyData(convertedData);
      })
      .catch(err => console.error('Error fetching efficiency:', err));

    // Fetch available models
    fetch(`${API_BASE_URL}/models`)
      .then(res => res.json())
      .then(data => setAvailableModels(data))
      .catch(err => console.error('Error fetching models:', err));
  }, []);

  // Fetch platforms when LLM is selected
  useEffect(() => {
    if (selectedLLM) {
      fetch(`${API_BASE_URL}/platforms/${selectedLLM}`)
        .then(res => res.json())
        .then(data => setAvailablePlatforms(data))
        .catch(err => console.error('Error fetching platforms:', err));
    }
  }, [selectedLLM]);

  const modelColors = {
    'Gemma 2B': '#4ade80',
    'Gemma 7B': '#22c55e',
    'Llama3 8B': '#fbbf24',
    'CodeLlama 70B': '#fb923c',
    'Llama3 70B': '#ef4444',
  };

  useEffect(() => {
    if (co2Score !== null) {
      // Reset displayed score to 0 before starting animation
      setDisplayedScore(0);
      
      const duration = 2000;
      const steps = 60;
      const increment = co2Score / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayedScore(prev => {
            const newValue = increment * currentStep;
            return newValue > co2Score ? co2Score : newValue;
          });
        } else {
          clearInterval(timer);
          setDisplayedScore(co2Score);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [co2Score]);

  const comparisons = co2Score !== null ? getComparisons(co2Score) : null;

  return (
    <div className="App">
      <div className="wave-decoration top-left-wave"></div>
      <div className="wave-decoration top-right-wave"></div>
      <div className="wave-decoration bottom-left-wave"></div>
      <div className="wave-decoration bottom-right-wave"></div>
      
      <div className="container">
        <div className="header-section">
          <div className="decorative-dots top-left">
            {[...Array(20)].map((_, i) => <span key={i} className="dot"></span>)}
          </div>
          <div className="decorative-dots top-right">
            {[...Array(20)].map((_, i) => <span key={i} className="dot"></span>)}
          </div>
          <div className="decorative-dots bottom-right">
            {[...Array(20)].map((_, i) => <span key={i} className="dot"></span>)}
          </div>
          <div className="leaf-decoration top-right-leaf">🍃</div>
          <div className="leaf-decoration bottom-right-leaf">🌿</div>
          <div className="leaf-decoration top-left-leaf">🍃</div>
          
          <h1 className="title">
            CO<sub>2</sub> Impact of LLM
          </h1>
        </div>
        
        <div className="selection-container">
          <div 
            className="dropdown-wrapper"
            onMouseLeave={() => handleMouseLeave('llm')}
          >
            <button 
              className="dropdown-button"
              onClick={() => setDropdownOpen({ ...dropdownOpen, llm: !dropdownOpen.llm })}
            >
              {selectedLLM || 'Select an LLM'}
              <span className="arrow">{dropdownOpen.llm ? '▲' : '▼'}</span>
            </button>
            {dropdownOpen.llm && (
              <div className="dropdown-menu">
                {(availableModels.length > 0 ? availableModels : llmOptions).map((llm) => (
                  <div 
                    key={llm}
                    className="dropdown-item"
                    onClick={() => handleLLMSelect(llm)}
                  >
                    {llm}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            className="dropdown-wrapper"
            onMouseLeave={() => handleMouseLeave('platform')}
          >
            <button 
              className={`dropdown-button ${!selectedLLM ? 'disabled' : ''}`}
              onClick={() => selectedLLM && setDropdownOpen({ ...dropdownOpen, platform: !dropdownOpen.platform })}
              disabled={!selectedLLM}
            >
              {selectedPlatform || 'Select a platform'}
              <span className="arrow">{dropdownOpen.platform ? '▲' : '▼'}</span>
            </button>
            {dropdownOpen.platform && selectedLLM && (
              <div className="dropdown-menu">
                {availablePlatforms.map((platform) => (
                  <div 
                    key={platform}
                    className="dropdown-item"
                    onClick={() => handlePlatformSelect(platform)}
                  >
                    {platform}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div 
            className="dropdown-wrapper"
            onMouseLeave={() => handleMouseLeave('energy')}
          >
            <button 
              className={`dropdown-button ${!selectedPlatform ? 'disabled' : ''}`}
              onClick={() => selectedPlatform && setDropdownOpen({ ...dropdownOpen, energy: !dropdownOpen.energy })}
              disabled={!selectedPlatform}
            >
              {selectedEnergy ? energyOptions.find(e => e.value === selectedEnergy)?.name : 'Select energy source'}
              <span className="arrow">{dropdownOpen.energy ? '▲' : '▼'}</span>
            </button>
            {dropdownOpen.energy && selectedPlatform && (
              <div className="dropdown-menu">
                {energyOptions.map((energy) => (
                  <div 
                    key={energy.value}
                    className="dropdown-item"
                    onClick={() => handleEnergySelect(energy.value)}
                  >
                    {energy.name} ({energy.co2PerKwh} g/kWh)
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="prompt-wrapper">
            <input
              type="text"
              className={`prompt-input ${!selectedEnergy ? 'disabled' : ''}`}
              placeholder="Enter your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!selectedEnergy}
            />
            <button 
              className={`submit-button ${!selectedEnergy || !prompt ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!selectedEnergy || !prompt}
            >
              Submit
            </button>
          </div>
        </div>

        {co2Score === null && (
          <div className="charts-container">
            <div className="chart-card">
              <h3 className="chart-title">Energy Consumption by Model & Platform</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={energyByModelData} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                    barCategoryGap="0%"
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#c8ddb5" />
                    <XAxis 
                      dataKey="platform"
                      tick={false}
                      axisLine={false}
                      height={1}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }} 
                      stroke="#5a7a4a" 
                      label={{ value: 'Wh', angle: -90, position: 'insideLeft', fontSize: 10 }}
                      domain={[0, 5]}
                      tickCount={6}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #5a7a4a', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value, name, props) => [value.toFixed(3) + ' Wh', props.payload.platform]}
                      labelFormatter={(label, payload) => payload && payload[0] ? `${payload[0].payload.model}` : label}
                    />
                    <Bar 
                      dataKey="energy" 
                      radius={[4, 4, 0, 0]}
                      background={(props) => {
                        const { x, y, width, height, index } = props;
                        
                        // Déterminer le groupe du modèle pour l'arrière-plan
                        let modelIndex = 0;
                        let currentModel = null;
                        for (let i = 0; i <= index; i++) {
                          if (energyByModelData[i] && energyByModelData[i].model !== currentModel) {
                            if (i !== 0) modelIndex++;
                            currentModel = energyByModelData[i].model;
                          }
                        }
                        
                        // Couleur de fond selon le groupe (alternance blanc/gris plus foncé)
                        const bgColor = modelIndex % 2 === 0 ? '#e0e0e0' : '#ffffff';
                        
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={bgColor}
                          />
                        );
                      }}
                      shape={(props) => {
                        const { x, y, width, height, payload } = props;
                        
                        // Couleur de la barre selon la plateforme
                        let fill = '#8b5cf6'; // Violet pour Workstation
                        if (payload.platform === 'Server') fill = '#2563eb'; // Bleu
                        else if (payload.platform === 'Laptop1') fill = '#f59e0b'; // Orange
                        else if (payload.platform === 'Laptop2') fill = '#10b981'; // Vert
                        
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fill}
                            rx={4}
                            ry={4}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Labels des modèles sous les groupes de barres */}
                <div style={{ 
                  position: 'relative',
                  height: '40px',
                  marginTop: '5px',
                  paddingLeft: '40px',
                  paddingRight: '20px'
                }}>
                  {(() => {
                    const uniqueModels = [];
                    const modelCounts = [];
                    let lastModel = null;
                    let count = 0;
                    
                    energyByModelData.forEach((item, index) => {
                      if (item.model !== lastModel) {
                        if (lastModel !== null) {
                          uniqueModels.push(lastModel);
                          modelCounts.push(count);
                        }
                        lastModel = item.model;
                        count = 1;
                      } else {
                        count++;
                      }
                    });
                    
                    if (lastModel !== null) {
                      uniqueModels.push(lastModel);
                      modelCounts.push(count);
                    }
                    
                    const totalBars = energyByModelData.length;
                    let cumulativePercent = 0;
                    
                    return uniqueModels.map((model, idx) => {
                      const widthPercent = (modelCounts[idx] / totalBars) * 100;
                      const leftPosition = cumulativePercent;
                      const centerPosition = leftPosition + (widthPercent / 2);
                      cumulativePercent += widthPercent;
                      
                      return (
                        <div 
                          key={model} 
                          style={{ 
                            position: 'absolute',
                            left: `${centerPosition}%`,
                            transform: 'translateX(-50%)',
                            fontSize: '9px',
                            color: '#5a7a4a',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{
                            transform: 'rotate(-25deg)',
                            transformOrigin: 'left center',
                            display: 'inline-block'
                          }}>
                            {model}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Energy Consumption Timeline</h3>
              <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c8ddb5" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#5a7a4a" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#5a7a4a" label={{ value: 'Wh', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #5a7a4a', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="CodeLlama_WS" stroke="#fb923c" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Gemma2B_L1" stroke="#4ade80" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Llama3_70B_S" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Energy Efficiency: Consumption vs Performance</h3>
              <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c8ddb5" />
                    <XAxis dataKey="responseLength" tick={{ fontSize: 10 }} stroke="#5a7a4a" label={{ value: 'Response Length (words)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                    <YAxis dataKey="energy" tick={{ fontSize: 10 }} stroke="#5a7a4a" label={{ value: 'Wh', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #5a7a4a', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(value, name) => {
                        if (name === 'energy') return [`${value} Wh`, 'Energy'];
                        if (name === 'duration') return [`${value}s`, 'Duration'];
                        return value;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Scatter name="Gemma 2B" data={efficiencyData.filter(d => d.model === 'Gemma 2B')} fill="#4ade80" />
                    <Scatter name="Gemma 7B" data={efficiencyData.filter(d => d.model === 'Gemma 7B')} fill="#22c55e" />
                    <Scatter name="Llama3 8B" data={efficiencyData.filter(d => d.model === 'Llama3 8B')} fill="#fbbf24" />
                    <Scatter name="CodeLlama 70B" data={efficiencyData.filter(d => d.model === 'CodeLlama 70B')} fill="#fb923c" />
                    <Scatter name="Llama3 70B" data={efficiencyData.filter(d => d.model === 'Llama3 70B')} fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {co2Score !== null && (
          <div className="co2-container">
            <button className="close-button" onClick={handleCloseResults}>✕</button>
            <h2 className="co2-title">CO2 Consumption</h2>
            <div className="co2-score-display">
              <div className="co2-value">
                <span className="co2-number">
                  {displayedScore < 10 
                    ? displayedScore.toFixed(3) 
                    : displayedScore.toFixed(2)}
                </span>
                <span className="co2-unit">mg CO₂</span>
              </div>
            </div>
            
            <div className="comparisons-grid">
              <div className="comparison-card">
                <div className="comparison-icon">📱</div>
                <div className="comparison-content">
                  <div className="comparison-value">{comparisons.smartphones}%</div>
                  <div className="comparison-label">of a smartphone charge</div>
                  <div className="comparison-source">Source: EXPLORIST.life, DEJI Battery</div>
                </div>
              </div>
              
              <div className="comparison-card">
                <div className="comparison-icon">💡</div>
                <div className="comparison-content">
                  <div className="comparison-value">{comparisons.ledHours}s</div>
                  <div className="comparison-label">of LED lighting</div>
                  <div className="comparison-source">Source: EnergySage, Crompton</div>
                </div>
              </div>
              
              <div className="comparison-card">
                <div className="comparison-icon">🌳</div>
                <div className="comparison-content">
                  <div className="comparison-value">{comparisons.treeDays}min</div>
                  <div className="comparison-label">of tree absorption</div>
                  <div className="comparison-source">Source: One Tree Planted, MIT</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="footer-decorations">
          <div className="tree-left">🌳</div>
          <div className="tree-left-small">🌲</div>
          <div className="tree-center">🌳</div>
          <div className="grass-left">🌿</div>
          <div className="grass-right">🌿</div>
          <div className="leaves-falling">
            <span className="falling-leaf">🍃</span>
            <span className="falling-leaf">🍃</span>
            <span className="falling-leaf">🍂</span>
            <span className="falling-leaf">🍃</span>
          </div>
          <div className="plant-right">🌱</div>
          <div className="flowers">
            <span className="flower">🌸</span>
            <span className="flower">🌼</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
