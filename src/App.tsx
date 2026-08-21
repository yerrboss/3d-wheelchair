import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { Box, ChevronDown, CircleHelp, Download, Eye, Layers3, Minus, Plus, RotateCcw, Save, Search, Settings2, Undo2, Redo2, X } from 'lucide-react'
import './App.css'

type ComponentKey = 'frame' | 'wheels' | 'seat' | 'backrest' | 'casters' | 'footrest' | 'sideguards' | 'handles' | 'accessories'

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
  { key: 'handles', label: 'Push handles', items: [
    { id: 'standard-handles', name: 'Standard Push Handles', description: 'Textured ergonomic grip', weight: 0.5, color: '#303a38' },
    { id: 'folding-handles', name: 'Folding Push Handles', description: 'Low-profile folding pair', weight: 0.7, color: '#9ba7a2' },
    { id: 'integrated-handles', name: 'Integrated Handles', description: 'Carbon frame-integrated grip', weight: 0.3, color: '#20282a' },
  ] },
  { key: 'accessories', label: 'Accessories', items: [
    { id: 'headrest', name: 'Carbon Headrest', description: 'Adjustable lateral support', weight: 0.6, color: '#222b2e' },
    { id: 'bag', name: 'Under-seat Pack', description: 'Weatherproof technical textile', weight: 0.4, color: '#9d764d' },
    { id: 'flag', name: 'Safety Flag', description: 'High visibility marker', weight: 0.2, color: '#d18b39' },
  ] },
]

const initialConfig: Record<ComponentKey, string> = {
  frame: 'rigid', wheels: 'carbon-24', seat: 'contour', backrest: 'carbon-back', casters: 'soft-4', footrest: 'carbon-plate', sideguards: 'carbon-guard', handles: 'standard-handles', accessories: 'headrest',
}

function Wheel({ x, z, color, tire = '#15191a', selected, onSelect }: { x: number; z: number; color: string; tire?: string; selected: boolean; onSelect: () => void }) {
  return <group position={[x, 0.84, z]} rotation={[Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onSelect() }}>
    <mesh><torusGeometry args={[1.1, 0.12, 16, 48]} /><meshStandardMaterial color={tire} roughness={0.78} /></mesh>
    <mesh><cylinderGeometry args={[0.88, 0.88, 0.08, 32]} /><meshStandardMaterial color={color} metalness={0.72} roughness={0.23} /></mesh>
    <mesh><cylinderGeometry args={[0.12, 0.12, 0.13, 20]} /><meshStandardMaterial color="#c9964a" metalness={0.9} roughness={0.2} /></mesh>
    {selected && <mesh><torusGeometry args={[1.28, 0.018, 8, 48]} /><meshBasicMaterial color="#f2b75e" /></mesh>}
  </group>
}

function CameraController({ view, zoom }: { view: string; zoom: number }) {
  const { camera } = useThree()
  useEffect(() => {
    const positions: Record<string, [number, number, number]> = { isometric: [4.6, 3.1, 5.3], front: [0, 2.1, 6], rear: [0, 2.1, -6], left: [-6, 2.1, 0], right: [6, 2.1, 0], top: [0, 7, 0.01] }
    const [x, y, z] = positions[view] ?? positions.isometric
    camera.position.set(x * zoom, y * zoom, z * zoom)
    camera.lookAt(0, 0.8, 0)
  }, [camera, view, zoom])
  return null
}

function WheelchairScene({ config, selected, setSelected, activeAccessories, view, zoom, technical }: { config: Record<ComponentKey, string>; selected: ComponentKey; setSelected: (key: ComponentKey) => void; activeAccessories: string[]; view: string; zoom: number; technical: boolean }) {
  const find = (key: ComponentKey) => componentGroups.find((group) => group.key === key)!.items.find((item) => item.id === config[key])!
  const frame = find('frame')
  const wheels = find('wheels')
  const seat = find('seat')
  const back = find('backrest')
  const caster = find('casters')
  const foot = find('footrest')
  const guards = find('sideguards')
  const handles = find('handles')
  const hasAccessory = (id: string) => activeAccessories.includes(id)
  return <>
    <CameraController view={view} zoom={zoom} />
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
        {hasAccessory('headrest') && <><mesh position={[-1.2, 2.82, 0]}><sphereGeometry args={[0.24, 24, 16]} /><meshStandardMaterial color="#242c2e" roughness={0.42} /></mesh><mesh position={[-1.2, 2.63, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color="#a9b0aa" metalness={0.72} /></mesh></>}
        {hasAccessory('bag') && <mesh position={[0.55, 0.82, 0]}><boxGeometry args={[0.55, 0.48, 0.8]} /><meshStandardMaterial color="#9d764d" roughness={0.85} /></mesh>}
        {hasAccessory('flag') && <><mesh position={[-1.28, 2.9, 0.28]}><boxGeometry args={[0.04, 1.35, 0.04]} /><meshStandardMaterial color="#d9d1ba" metalness={0.3} /></mesh><mesh position={[-1.28, 3.48, 0.28]}><boxGeometry args={[0.38, 0.2, 0.03]} /><meshStandardMaterial color="#d18b39" roughness={0.7} /></mesh></>}
      </group>
      <group onClick={(event) => { event.stopPropagation(); setSelected('handles') }}>
        <mesh position={[-1.17, 2.73, 0.48]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.07, 0.07, handles.id === 'folding-handles' ? 0.48 : 0.32, 16]} /><meshStandardMaterial color={handles.color} metalness={0.55} roughness={0.35} /></mesh>
        <mesh position={[-1.17, 2.73, -0.48]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.07, 0.07, handles.id === 'folding-handles' ? 0.48 : 0.32, 16]} /><meshStandardMaterial color={handles.color} metalness={0.55} roughness={0.35} /></mesh>
        {selected === 'handles' && <mesh position={[-1.17, 2.73, 0]}><boxGeometry args={[0.1, 0.48, 1.18]} /><meshBasicMaterial color="#f2b75e" wireframe /></mesh>}
      </group>
      {technical && <group><Text position={[1.8, 2.6, 0]} fontSize={0.12} color="#e4ac56">860 mm OVERALL</Text><Text position={[0.15, -0.45, 0]} fontSize={0.12} color="#e4ac56">450 mm SEAT WIDTH</Text></group>}
      <Text position={[-1.65, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#d8a34b" letterSpacing={0.08}>AURA / 01</Text>
    </group>
    <ContactShadows position={[0, -1.22, 0]} opacity={0.48} scale={7} blur={2.6} far={4} />
  </>
}

function App() {
  const [config, setConfig] = useState(initialConfig)
  const [selected, setSelected] = useState<ComponentKey>('frame')
  const [activeAccessories, setActiveAccessories] = useState<string[]>(['headrest'])
  const [activeTab, setActiveTab] = useState<'library' | 'materials'>('library')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('isometric')
  const [zoom, setZoom] = useState(1)
  const [technical, setTechnical] = useState(false)
  const [material, setMaterial] = useState('Carbon composite')
  const [customized, setCustomized] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('System ready')
  const [history, setHistory] = useState<Record<ComponentKey, string>[]>([])
  const [future, setFuture] = useState<Record<ComponentKey, string>[]>([])
  const selectedGroup = componentGroups.find((group) => group.key === selected)!
  const selectedOption = selectedGroup.items.find((item) => item.id === config[selected])!
  const totalWeight = componentGroups.reduce((sum, group) => sum + group.items.find((item) => item.id === config[group.key])!.weight, 10.4)
  const commitConfig = (next: Record<ComponentKey, string>) => {
    setHistory((current) => [...current, config])
    setFuture([])
    setConfig(next)
    setSaved(false)
  }
  const setComponent = (key: ComponentKey, id: string) => {
    commitConfig({ ...config, [key]: id })
    if (key === 'accessories') setActiveAccessories((current) => current.includes(id) ? current : [...current, id])
  }
  const addAccessory = () => {
    const accessoryOptions = componentGroups.find((group) => group.key === 'accessories')!.items
    const next = accessoryOptions.find((item) => !activeAccessories.includes(item.id))
    if (!next) return
    setActiveAccessories((current) => [...current, next.id])
    commitConfig({ ...config, accessories: next.id })
    setSelected('accessories')
  }
  const replaceSelected = () => {
    const index = selectedGroup.items.findIndex((item) => item.id === config[selected])
    const next = selectedGroup.items[(index + 1) % selectedGroup.items.length]
    setComponent(selected, next.id)
  }
  const undo = () => {
    const previous = history.at(-1)
    if (!previous) return
    setHistory((current) => current.slice(0, -1))
    setFuture((current) => [...current, config])
    setConfig(previous)
  }
  const redo = () => {
    const next = future.at(-1)
    if (!next) return
    setFuture((current) => current.slice(0, -1))
    setHistory((current) => [...current, config])
    setConfig(next)
  }
  const exportConfiguration = () => {
    const payload = { configurationId: 'WC-26-A7F92', project: 'Custom Active // V4', units: 'mm', estimatedWeightKg: Number(totalWeight.toFixed(1)), components: config, accessories: activeAccessories, material }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aura-wheelchair-configuration.json'
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('Configuration JSON exported')
  }
  const announce = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice('System ready'), 2200)
  }
  const filteredGroups = componentGroups.map((group) => ({ ...group, items: group.items.filter((item) => `${group.label} ${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.items.length > 0)

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Box size={17} strokeWidth={2.4} /></div><span>AURA<span className="brand-slash">/</span>STUDIO</span><span className="beta">BETA</span></div>
        <button className="project-name" onClick={() => announce('Project menu opened')}><span className="eyebrow">PROJECT</span><strong>Custom Active // V4</strong><ChevronDown size={14} /></button>
        <div className="top-actions"><button className="icon-button" title="Undo" disabled={!history.length} onClick={() => { undo(); announce('Undo applied') }}><Undo2 size={16} /></button><button className="icon-button" title="Redo" disabled={!future.length} onClick={() => { redo(); announce('Redo applied') }}><Redo2 size={16} /></button><span className="divider" /><button className="save-button" onClick={() => { setSaved(true); announce('Configuration saved') }}><Save size={15} />{saved ? 'Saved' : 'Save'}</button><button className="export-button" onClick={exportConfiguration}><Download size={15} /> Export JSON</button><button className="avatar" onClick={() => announce('Profile menu opened')}>SC</button></div>
      </header>

      <div className="workspace">
        <aside className="left-panel">
          <div className="panel-heading"><div><span className="eyebrow">BUILD SYSTEM</span><h1>Component library</h1></div><button className="icon-button" title="Library settings" onClick={() => { setActiveTab('materials'); announce('Library settings opened') }}><Settings2 size={16} /></button></div>
          <div className="tabs"><button className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}><Layers3 size={14} /> Components</button><button className={activeTab === 'materials' ? 'active' : ''} onClick={() => setActiveTab('materials')}><CircleHelp size={14} /> Materials</button></div>
          <label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components" /><span>⌘ K</span></label>
          {activeTab === 'library' ? <div className="library-list">{filteredGroups.map((group) => <section className="library-group" key={group.key}><div className="group-label"><span>{group.label}</span><span className="count">{group.items.length.toString().padStart(2, '0')}</span></div>{group.items.map((item) => <button className={`component-row ${selected === group.key && config[group.key] === item.id ? 'selected' : ''} ${group.key === 'accessories' && activeAccessories.includes(item.id) ? 'enabled' : ''}`} key={item.id} onClick={() => { setComponent(group.key, item.id); setSelected(group.key) }}><span className="component-swatch" style={{ background: item.color }} /> <span className="component-copy"><strong>{item.name}</strong><small>{item.description}</small></span>{group.key === 'accessories' && activeAccessories.includes(item.id) ? <span className="selected-dot" /> : selected === group.key && config[group.key] === item.id && <span className="selected-dot" />}</button>)}</section>)}</div> : <div className="materials-panel"><div className="material-title">Surface library</div>{['Carbon composite', 'Brushed aluminum', 'Satin titanium', 'Technical mesh', 'Soft rubber', 'Powder coat'].map((materialName, index) => <button key={materialName} className={`material-row ${material === materialName ? 'selected' : ''}`} onClick={() => setMaterial(materialName)}><span className={`material-sample sample-${index}`} /><span>{materialName}</span>{material === materialName && <span className="selected-dot" />}</button>)}</div>}
          <div className="library-footer"><span>{activeAccessories.length} accessory part{activeAccessories.length === 1 ? '' : 's'} active</span><button onClick={addAccessory} disabled={activeAccessories.length === 3}><Plus size={14} /> Add part</button></div>
        </aside>

        <section className="viewport-panel">
          <div className="viewport-toolbar"><div className="mode-switch"><button className={!technical ? 'active' : ''} onClick={() => setTechnical(false)}>Presentation</button><button className={technical ? 'active' : ''} onClick={() => setTechnical(true)}>Technical</button></div><div className="viewport-status"><span className="live-dot" /> Live preview <span className="status-divider" /> <span>mm</span></div><button className="icon-button" title="Focus selected module" onClick={() => setView('isometric')}><Eye size={16} /></button></div>
          <div className="scene-wrap"><Canvas camera={{ position: [4.6, 3.1, 5.3], fov: 42 }} shadows><color attach="background" args={['#222725']} /><fog attach="fog" args={['#222725', 7, 13]} /><WheelchairScene config={config} selected={selected} setSelected={setSelected} activeAccessories={activeAccessories} view={view} zoom={zoom} technical={technical} /><OrbitControls makeDefault enablePan={false} minDistance={3.4} maxDistance={8} target={[0, 0.8, 0]} /></Canvas><div className="scene-label"><span className="label-kicker">AURA 01</span><span>{technical ? 'TECHNICAL DIMENSION VIEW' : 'ACTIVE PERFORMANCE CHASSIS'}</span></div><div className="scene-crosshair">+</div></div>
          <div className="view-dock"><div className="view-list">{['isometric', 'front', 'rear', 'left', 'right', 'top'].map((item) => <button className={view === item ? 'active' : ''} key={item} onClick={() => setView(item)}>{item}</button>)}</div><button className="reset-view" onClick={() => { setView('isometric'); setZoom(1) }}><RotateCcw size={14} /> Reset view</button><div className="zoom-controls"><button onClick={() => setZoom((value) => Math.min(1.3, Number((value + 0.1).toFixed(1))))}><Minus size={15} /></button><span>{Math.round(100 / zoom)}%</span><button onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(1))))}><Plus size={15} /></button></div></div>
        </section>

        <aside className="right-panel">
          <div className="inspector-heading"><div><span className="eyebrow">SELECTED MODULE</span><h2>{selectedGroup.label}</h2></div><button className="icon-button" title="Clear selection" onClick={() => announce('Selection remains available in the viewport')}><X size={16} /></button></div>
          <div className="selected-hero"><div className="hero-swatch" style={{ background: selectedOption.color }}><span className="hero-grid" /></div><div><span className="eyebrow">CURRENT CONFIGURATION</span><strong>{selectedOption.name}</strong><small>{selectedOption.description}</small></div></div>
          <div className="property-stack"><div className="property"><span>Material</span><strong>{selected === 'wheels' || selected === 'frame' ? 'Carbon composite' : 'Technical textile'} <ChevronDown size={13} /></strong></div><div className="property"><span>Finish</span><strong>Studio satin <ChevronDown size={13} /></strong></div><div className="property"><span>Color</span><strong><i className="color-dot" style={{ background: selectedOption.color }} /> {selectedOption.color.toUpperCase()} <ChevronDown size={13} /></strong></div><div className="dimension-row"><div><span>Width</span><strong>{selected === 'wheels' ? '25' : '45'} <em>cm</em></strong></div><div><span>Height</span><strong>{selected === 'backrest' ? '42' : '86'} <em>cm</em></strong></div></div></div>
          <div className="inspector-actions"><button className="primary-action" onClick={() => setCustomized((value) => !value)}>{customized ? 'Customized' : 'Customize'} <Settings2 size={14} /></button><button className="secondary-action" onClick={replaceSelected}>Replace</button></div>
          <div className="compatibility"><div className="compat-heading"><span className="live-dot" /> Compatibility check <strong>Compatible</strong></div><p>Mounting points align with the Rigid Performance frame.</p></div>
          <div className="notes"><div className="section-label">Component note <button onClick={() => announce('Note editor opened')}>+</button></div><p>Keep chassis as narrow as possible while preserving lateral support.</p></div>
          <div className="spec-card"><div className="spec-card-top"><span className="eyebrow">LIVE SPECIFICATION</span><span className="valid-pill">● VALID</span></div><div className="spec-line"><span>Estimated weight</span><strong>{totalWeight.toFixed(1)} kg</strong></div><div className="spec-line"><span>Configuration ID</span><strong>WC-26-A7F92</strong></div><div className="spec-line"><span>Last saved</span><strong>{saved ? 'Just now' : '2 min ago'}</strong></div></div>
        </aside>
      </div>
      <footer className="statusbar"><div><span className="status-live"><span className="live-dot" /> {notice}</span><span className="status-sep" /> 9 modules configured <span className="status-sep" /> Metric units</div><div>Estimated values only <CircleHelp size={13} /></div></footer>
    </main>
  )
}

export default App
