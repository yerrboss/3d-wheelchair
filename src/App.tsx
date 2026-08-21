import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useState } from 'react'
import { Box, ChevronDown, CircleHelp, Download, Eye, Layers3, Minus, Plus, RotateCcw, Save, Search, Settings2, Undo2, Redo2, X } from 'lucide-react'
import './App.css'

type ComponentKey = 'frame' | 'wheels' | 'seat' | 'backrest' | 'casters' | 'footrest' | 'sideguards' | 'accessories'

type ComponentOption = {
  id: string
  name: string
  description: string
  weight: number
  color: string
  accent?: string
}

const componentGroups: { key: ComponentKey; label: string; items: ComponentOption[] }[] = [
  { key: 'frame', label: 'Frame', items: [
    { id: 'rigid', name: 'Rigid Performance', description: '7000-series aluminum', weight: 4.8, color: '#b7c2c8' },
    { id: 'active', name: 'Active Carbon', description: 'Monocoque carbon composite', weight: 3.9, color: '#252d31' },
    { id: 'folding', name: 'Folding Classic', description: 'Aviation-grade alloy', weight: 7.2, color: '#8b969b' },
  ] },
  { key: 'wheels', label: 'Main wheels', items: [
    { id: 'carbon-24', name: 'Carbon Performance 24"', description: 'Deep carbon aero rim', weight: 1.1, color: '#171d20' },
    { id: 'spoke-24', name: 'Lightweight Spoke 24"', description: '24 spoke aluminum', weight: 1.4, color: '#7e8a8f' },
    { id: 'mag-24', name: 'Magnesium Aero 24"', description: 'Cast magnesium wheel', weight: 1.7, color: '#d5d3cb' },
  ] },
  { key: 'seat', label: 'Seating', items: [
    { id: 'contour', name: 'Contour Seat', description: 'Adjustable tension seat', weight: 1.2, color: '#263438' },
    { id: 'sport', name: 'Sport Sling', description: 'Low-profile technical fabric', weight: 0.8, color: '#273f43' },
  ] },
  { key: 'backrest', label: 'Backrest', items: [
    { id: 'carbon-back', name: 'Carbon Adjustable', description: 'Rigid ergonomic shell', weight: 1.0, color: '#1c2427' },
    { id: 'tension-back', name: 'Tension Adjustable', description: 'Breathable tension system', weight: 1.4, color: '#31454a' },
  ] },
  { key: 'casters', label: 'Casters', items: [
    { id: 'soft-4', name: 'Soft Performance 4"', description: 'Shock absorbing urethane', weight: 0.5, color: '#c69a58' },
    { id: 'outdoor-5', name: 'Outdoor 5"', description: 'All-terrain soft rubber', weight: 0.8, color: '#474f50' },
  ] },
  { key: 'footrest', label: 'Footrest', items: [
    { id: 'carbon-plate', name: 'Adjustable Carbon', description: 'Split carbon footplate', weight: 0.7, color: '#1f292b' },
    { id: 'aluminum-plate', name: 'Aluminum Sport', description: 'Machined alloy plate', weight: 1.1, color: '#a8b0ad' },
  ] },
  { key: 'sideguards', label: 'Side guards', items: [
    { id: 'carbon-guard', name: 'Carbon Full Coverage', description: 'Gloss carbon fiber', weight: 0.6, color: '#1a2224' },
    { id: 'clear-guard', name: 'Transparent Minimalist', description: 'Impact polycarbonate', weight: 0.4, color: '#8db5b8' },
  ] },
  { key: 'accessories', label: 'Accessories', items: [
    { id: 'headrest', name: 'Carbon Headrest', description: 'Adjustable lateral support', weight: 0.6, color: '#222b2e' },
    { id: 'bag', name: 'Under-seat Pack', description: 'Weatherproof technical textile', weight: 0.4, color: '#9d764d' },
    { id: 'flag', name: 'Safety Flag', description: 'High visibility marker', weight: 0.2, color: '#d18b39' },
  ] },
]

const initialConfig: Record<ComponentKey, string> = {
  frame: 'rigid', wheels: 'carbon-24', seat: 'contour', backrest: 'carbon-back', casters: 'soft-4', footrest: 'carbon-plate', sideguards: 'carbon-guard', accessories: 'headrest',
}

function Wheel({ x, z, color, tire = '#15191a', selected, onSelect }: { x: number; z: number; color: string; tire?: string; selected: boolean; onSelect: () => void }) {
  return <group position={[x, 0.84, z]} rotation={[Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onSelect() }}>
    <mesh><torusGeometry args={[1.1, 0.12, 16, 48]} /><meshStandardMaterial color={tire} roughness={0.78} /></mesh>
    <mesh><cylinderGeometry args={[0.88, 0.88, 0.08, 32]} /><meshStandardMaterial color={color} metalness={0.72} roughness={0.23} /></mesh>
    <mesh><cylinderGeometry args={[0.12, 0.12, 0.13, 20]} /><meshStandardMaterial color="#c9964a" metalness={0.9} roughness={0.2} /></mesh>
    {selected && <mesh><torusGeometry args={[1.28, 0.018, 8, 48]} /><meshBasicMaterial color="#f2b75e" /></mesh>}
  </group>
}

function WheelchairScene({ config, selected, setSelected }: { config: Record<ComponentKey, string>; selected: ComponentKey; setSelected: (key: ComponentKey) => void }) {
  const find = (key: ComponentKey) => componentGroups.find((group) => group.key === key)!.items.find((item) => item.id === config[key])!
  const frame = find('frame')
  const wheels = find('wheels')
  const seat = find('seat')
  const back = find('backrest')
  const caster = find('casters')
  const foot = find('footrest')
  const guards = find('sideguards')
  return <>
    <ambientLight intensity={0.65} />
    <directionalLight position={[4, 8, 5]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} />
    <Environment preset="studio" />
    <group rotation={[0, -0.35, 0]} position={[0, -0.15, 0]}>
      <group onClick={(event) => { event.stopPropagation(); setSelected('frame') }}>
        <RoundedBox args={[2.7, 0.15, 1.45]} radius={0.07} position={[0, 1.2, 0]}><meshStandardMaterial color={frame.color} metalness={0.78} roughness={0.22} /></RoundedBox>
        <RoundedBox args={[0.14, 1.35, 0.14]} radius={0.05} position={[-1.12, 0.62, 0.38]} rotation={[0, 0.15, -0.28]}><meshStandardMaterial color={frame.color} metalness={0.8} roughness={0.2} /></RoundedBox>
        <RoundedBox args={[0.14, 1.35, 0.14]} radius={0.05} position={[-1.12, 0.62, -0.38]} rotation={[0, -0.15, -0.28]}><meshStandardMaterial color={frame.color} metalness={0.8} roughness={0.2} /></RoundedBox>
        {selected === 'frame' && <mesh position={[0, 1.29, 0]}><boxGeometry args={[2.88, 0.02, 1.62]} /><meshBasicMaterial color="#f2b75e" wireframe /></mesh>}
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('seat') }}>
        <RoundedBox args={[2.05, 0.18, 1.2]} radius={0.08} position={[0.08, 1.38, 0]}><meshStandardMaterial color={seat.color} roughness={0.88} /></RoundedBox>
        {selected === 'seat' && <mesh position={[0.08, 1.49, 0]}><boxGeometry args={[2.16, 0.02, 1.3]} /><meshBasicMaterial color="#f2b75e" wireframe /></mesh>}
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('backrest') }}>
        <RoundedBox args={[0.16, 1.45, 1.16]} radius={0.07} position={[-0.96, 2.05, 0]} rotation={[0, 0, -0.06]}><meshStandardMaterial color={back.color} metalness={0.25} roughness={0.55} /></RoundedBox>
        {selected === 'backrest' && <mesh position={[-1.06, 2.05, 0]} rotation={[0, 0, -0.06]}><boxGeometry args={[0.02, 1.56, 1.28]} /><meshBasicMaterial color="#f2b75e" wireframe /></mesh>}
      </group>
      <Wheel x={0.05} z={0.86} color={wheels.color} selected={selected === 'wheels'} onSelect={() => setSelected('wheels')} />
      <Wheel x={0.05} z={-0.86} color={wheels.color} selected={selected === 'wheels'} onSelect={() => setSelected('wheels')} />
      <group onClick={(event) => { event.stopPropagation(); setSelected('casters') }}>
        <mesh position={[1.03, 0.38, 0.52]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.36, 0.09, 14, 32]} /><meshStandardMaterial color={caster.color} roughness={0.65} /></mesh>
        <mesh position={[1.03, 0.38, -0.52]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.36, 0.09, 14, 32]} /><meshStandardMaterial color={caster.color} roughness={0.65} /></mesh>
        <mesh position={[1.03, 0.75, 0]}><boxGeometry args={[0.12, 0.6, 1.18]} /><meshStandardMaterial color="#a9b0aa" metalness={0.72} roughness={0.3} /></mesh>
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('footrest') }}>
        <mesh position={[1.12, 0.34, 0]} rotation={[0, 0, -0.08]}><boxGeometry args={[0.72, 0.1, 1.0]} /><meshStandardMaterial color={foot.color} metalness={0.58} roughness={0.28} /></mesh>
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('sideguards') }}>
        <mesh position={[-0.05, 1.62, 0.69]}><boxGeometry args={[1.76, 0.52, 0.035]} /><meshStandardMaterial color={guards.color} metalness={0.5} roughness={0.25} transparent={guards.id === 'clear-guard'} opacity={guards.id === 'clear-guard' ? 0.42 : 1} /></mesh>
        <mesh position={[-0.05, 1.62, -0.69]}><boxGeometry args={[1.76, 0.52, 0.035]} /><meshStandardMaterial color={guards.color} metalness={0.5} roughness={0.25} transparent={guards.id === 'clear-guard'} opacity={guards.id === 'clear-guard' ? 0.42 : 1} /></mesh>
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('accessories') }}>
        <mesh position={[-1.2, 2.82, 0]}><sphereGeometry args={[0.24, 24, 16]} /><meshStandardMaterial color="#242c2e" roughness={0.42} /></mesh>
        <mesh position={[-1.2, 2.63, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color="#a9b0aa" metalness={0.72} /></mesh>
      </group>
      <Text position={[-1.65, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#d8a34b" letterSpacing={0.08}>AURA / 01</Text>
    </group>
    <ContactShadows position={[0, -1.22, 0]} opacity={0.48} scale={7} blur={2.6} far={4} />
  </>
}

function App() {
  const [config, setConfig] = useState(initialConfig)
  const [selected, setSelected] = useState<ComponentKey>('frame')
  const [activeTab, setActiveTab] = useState<'library' | 'materials'>('library')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('isometric')
  const [saved, setSaved] = useState(false)
  const selectedGroup = componentGroups.find((group) => group.key === selected)!
  const selectedOption = selectedGroup.items.find((item) => item.id === config[selected])!
  const totalWeight = componentGroups.reduce((sum, group) => sum + group.items.find((item) => item.id === config[group.key])!.weight, 10.4)
  const setComponent = (key: ComponentKey, id: string) => setConfig((current) => ({ ...current, [key]: id }))
  const filteredGroups = componentGroups.map((group) => ({ ...group, items: group.items.filter((item) => `${group.label} ${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.items.length > 0)

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Box size={17} strokeWidth={2.4} /></div><span>AURA<span className="brand-slash">/</span>STUDIO</span><span className="beta">BETA</span></div>
        <div className="project-name"><span className="eyebrow">PROJECT</span><strong>Custom Active // V4</strong><ChevronDown size={14} /></div>
        <div className="top-actions"><button className="icon-button" title="Undo"><Undo2 size={16} /></button><button className="icon-button" title="Redo"><Redo2 size={16} /></button><span className="divider" /><button className="save-button" onClick={() => setSaved(true)}><Save size={15} />{saved ? 'Saved' : 'Save'}</button><button className="export-button"><Download size={15} /> Export</button><button className="avatar">SC</button></div>
      </header>

      <div className="workspace">
        <aside className="left-panel">
          <div className="panel-heading"><div><span className="eyebrow">BUILD SYSTEM</span><h1>Component library</h1></div><button className="icon-button"><Settings2 size={16} /></button></div>
          <div className="tabs"><button className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}><Layers3 size={14} /> Components</button><button className={activeTab === 'materials' ? 'active' : ''} onClick={() => setActiveTab('materials')}><CircleHelp size={14} /> Materials</button></div>
          <label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components" /><span>⌘ K</span></label>
          {activeTab === 'library' ? <div className="library-list">{filteredGroups.map((group) => <section className="library-group" key={group.key}><div className="group-label"><span>{group.label}</span><span className="count">{group.items.length.toString().padStart(2, '0')}</span></div>{group.items.map((item) => <button className={`component-row ${selected === group.key && config[group.key] === item.id ? 'selected' : ''}`} key={item.id} onClick={() => { setComponent(group.key, item.id); setSelected(group.key) }}><span className="component-swatch" style={{ background: item.color }} /> <span className="component-copy"><strong>{item.name}</strong><small>{item.description}</small></span>{selected === group.key && config[group.key] === item.id && <span className="selected-dot" />}</button>)}</section>)}</div> : <div className="materials-panel"><div className="material-title">Surface library</div>{['Carbon fiber weave', 'Brushed aluminum', 'Satin titanium', 'Technical mesh', 'Soft rubber', 'Powder coat'].map((material, index) => <button key={material} className="material-row"><span className={`material-sample sample-${index}`} /><span>{material}</span><ChevronDown size={13} /></button>)}</div>}
          <div className="library-footer"><span>42 components available</span><button><Plus size={14} /> Add custom</button></div>
        </aside>

        <section className="viewport-panel">
          <div className="viewport-toolbar"><div className="mode-switch"><button className="active">Presentation</button><button>Technical</button></div><div className="viewport-status"><span className="live-dot" /> Live preview <span className="status-divider" /> <span>mm</span></div><button className="icon-button"><Eye size={16} /></button></div>
          <div className="scene-wrap"><Canvas camera={{ position: [4.6, 3.1, 5.3], fov: 42 }} shadows><color attach="background" args={['#222725']} /><fog attach="fog" args={['#222725', 7, 13]} /><WheelchairScene config={config} selected={selected} setSelected={setSelected} /><OrbitControls makeDefault enablePan={false} minDistance={3.4} maxDistance={8} target={[0, 0.8, 0]} /></Canvas><div className="scene-label"><span className="label-kicker">AURA 01</span><span>ACTIVE PERFORMANCE CHASSIS</span></div><div className="scene-crosshair">+</div></div>
          <div className="view-dock"><div className="view-list">{['isometric', 'front', 'rear', 'left', 'right', 'top'].map((item) => <button className={view === item ? 'active' : ''} key={item} onClick={() => setView(item)}>{item}</button>)}</div><button className="reset-view" onClick={() => setView('isometric')}><RotateCcw size={14} /> Reset view</button><div className="zoom-controls"><button><Minus size={15} /></button><span>100%</span><button><Plus size={15} /></button></div></div>
        </section>

        <aside className="right-panel">
          <div className="inspector-heading"><div><span className="eyebrow">SELECTED MODULE</span><h2>{selectedGroup.label}</h2></div><button className="icon-button"><X size={16} /></button></div>
          <div className="selected-hero"><div className="hero-swatch" style={{ background: selectedOption.color }}><span className="hero-grid" /></div><div><span className="eyebrow">CURRENT CONFIGURATION</span><strong>{selectedOption.name}</strong><small>{selectedOption.description}</small></div></div>
          <div className="property-stack"><div className="property"><span>Material</span><strong>{selected === 'wheels' || selected === 'frame' ? 'Carbon composite' : 'Technical textile'} <ChevronDown size={13} /></strong></div><div className="property"><span>Finish</span><strong>Studio satin <ChevronDown size={13} /></strong></div><div className="property"><span>Color</span><strong><i className="color-dot" style={{ background: selectedOption.color }} /> {selectedOption.color.toUpperCase()} <ChevronDown size={13} /></strong></div><div className="dimension-row"><div><span>Width</span><strong>{selected === 'wheels' ? '25' : '45'} <em>cm</em></strong></div><div><span>Height</span><strong>{selected === 'backrest' ? '42' : '86'} <em>cm</em></strong></div></div></div>
          <div className="inspector-actions"><button className="primary-action">Customize <Settings2 size={14} /></button><button className="secondary-action">Replace</button></div>
          <div className="compatibility"><div className="compat-heading"><span className="live-dot" /> Compatibility check <strong>Compatible</strong></div><p>Mounting points align with the Rigid Performance frame.</p></div>
          <div className="notes"><div className="section-label">Component note <button>+</button></div><p>Keep chassis as narrow as possible while preserving lateral support.</p></div>
          <div className="spec-card"><div className="spec-card-top"><span className="eyebrow">LIVE SPECIFICATION</span><span className="valid-pill">● VALID</span></div><div className="spec-line"><span>Estimated weight</span><strong>{totalWeight.toFixed(1)} kg</strong></div><div className="spec-line"><span>Configuration ID</span><strong>WC-26-A7F92</strong></div><div className="spec-line"><span>Last saved</span><strong>{saved ? 'Just now' : '2 min ago'}</strong></div></div>
        </aside>
      </div>
      <footer className="statusbar"><div><span className="status-live"><span className="live-dot" /> System ready</span><span className="status-sep" /> 8 modules configured <span className="status-sep" /> Metric units</div><div>Estimated values only <CircleHelp size={13} /></div></footer>
    </main>
  )
}

export default App
