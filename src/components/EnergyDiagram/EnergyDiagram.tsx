import type { OccupiedLevel } from '../../models/piChain';

function yForEnergy(energy: number, min = -2.4, max = 2.4): number {
  return 250 - ((energy - min) / (max - min)) * 190;
}

interface LevelProps {
  x: number;
  y: number;
  width?: number;
  label: string;
  className?: string;
}

function Level({ x, y, width = 78, label, className = '' }: LevelProps) {
  return (
    <g>
      <line x1={x - width / 2} x2={x + width / 2} y1={y} y2={y} className={`energy-level ${className}`} />
      <text x={x} y={y - 9} textAnchor="middle" className="energy-label">{label}</text>
    </g>
  );
}

export function TwoLevelEnergyDiagram({
  energyA,
  energyB,
  lowerEnergy,
  upperEnergy,
  labelA = 'A',
  labelB = 'B',
}: {
  energyA: number;
  energyB: number;
  lowerEnergy: number;
  upperEnergy: number;
  labelA?: string;
  labelB?: string;
}) {
  return (
    <svg className="energy-svg" viewBox="0 0 420 300" role="img" aria-label="Two starting energy levels and two mixed energy levels">
      <rect x="20" y="24" width="380" height="236" rx="8" className="diagram-frame" />
      <text x="112" y="52" textAnchor="middle" className="diagram-title">starting</text>
      <text x="306" y="52" textAnchor="middle" className="diagram-title">mixed MOs</text>
      <Level x={92} y={yForEnergy(energyA)} label={labelA} />
      <Level x={132} y={yForEnergy(energyB)} label={labelB} />
      <Level x={306} y={yForEnergy(lowerEnergy)} label="lower" className="energy-level--bonding" />
      <Level x={306} y={yForEnergy(upperEnergy)} label="upper" className="energy-level--antibonding" />
      <line x1="178" x2="260" y1={yForEnergy(energyA)} y2={yForEnergy(upperEnergy)} className="mixing-guide" />
      <line x1="178" x2="260" y1={yForEnergy(energyB)} y2={yForEnergy(lowerEnergy)} className="mixing-guide" />
      <text x="210" y="282" textAnchor="middle" className="diagram-caption">relative energy in arbitrary teaching units</text>
    </svg>
  );
}

export function SplittingEnergyDiagram({ separation }: { separation: number }) {
  const half = separation / 2;
  return (
    <svg className="energy-svg" viewBox="0 0 420 300" role="img" aria-label="Bonding and antibonding energy splitting">
      <rect x="20" y="24" width="380" height="236" rx="8" className="diagram-frame" />
      <Level x={120} y={yForEnergy(0)} label="starting" />
      <Level x={300} y={yForEnergy(-half)} label="bonding" className="energy-level--bonding" />
      <Level x={300} y={yForEnergy(half)} label="antibonding" className="energy-level--antibonding" />
      <line x1="210" x2="210" y1={yForEnergy(-half)} y2={yForEnergy(half)} className="separation-arrow" />
      <text x="228" y={yForEnergy(0) + 4} className="energy-label">split</text>
      <text x="210" y="282" textAnchor="middle" className="diagram-caption">relative energy in arbitrary teaching units</text>
    </svg>
  );
}

export function PiEnergyDiagram({ levels, selectedIndex }: { levels: OccupiedLevel[]; selectedIndex: number }) {
  return (
    <svg className="energy-svg" viewBox="0 0 420 330" role="img" aria-label="Pi chain energy levels with occupied and unoccupied levels">
      <rect x="20" y="24" width="380" height="266" rx="8" className="diagram-frame" />
      {levels.map((level, index) => {
        const y = yForEnergy(level.energy, -2.2, 2.2);
        const isSelected = index === selectedIndex;
        return (
          <g key={level.label}>
            <line
              x1="124"
              x2="296"
              y1={y}
              y2={y}
              className={`energy-level pi-level ${isSelected ? 'pi-level--selected' : ''}`}
            />
            <text x="90" y={y + 4} textAnchor="end" className="energy-label">{level.label}</text>
            <text x="308" y={y + 4} className="energy-label">
              {level.role === 'HOMO' || level.role === 'LUMO' ? level.role : `${level.electrons} e-`}
            </text>
            {Array.from({ length: level.electrons }).map((_, electronIndex) => (
              <circle key={electronIndex} cx={178 + electronIndex * 28} cy={y - 7} r="5" className="electron-dot" />
            ))}
          </g>
        );
      })}
      <text x="210" y="314" textAnchor="middle" className="diagram-caption">relative energy in arbitrary teaching units</text>
    </svg>
  );
}
