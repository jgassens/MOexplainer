import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function ControlPanel({ title = 'Change', description, children }: ControlPanelProps) {
  return (
    <section className="control-panel" aria-label={title}>
      <h3>{title}</h3>
      {description ? <p className="control-panel__description">{description}</p> : null}
      <div className="control-panel__body">{children}</div>
    </section>
  );
}

interface SliderControlProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderControl({ label, description, value, min, max, step, unit, onChange }: SliderControlProps) {
  return (
    <label className="slider-control">
      <span className="slider-control__label">
        {label}
        <strong>
          {value.toFixed(step < 0.1 ? 2 : 1)}
          {unit ? ` ${unit}` : ''}
        </strong>
      </span>
      {description ? <span className="slider-control__description">{description}</span> : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({ label, description, value, options, onChange }: ToggleGroupProps<T>) {
  return (
    <fieldset className="toggle-group">
      <legend>{label}</legend>
      {description ? <p className="toggle-group__description">{description}</p> : null}
      <div className="toggle-group__buttons">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === value ? 'is-active' : ''}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

interface PresetButtonRowProps<T extends string> {
  label: string;
  description?: string;
  presets: ToggleOption<T>[];
  onChoose: (value: T) => void;
}

export function PresetButtonRow<T extends string>({ label, description, presets, onChoose }: PresetButtonRowProps<T>) {
  return (
    <div className="preset-row" aria-label={label}>
      {description ? <p className="preset-row__description">{description}</p> : null}
      {presets.map((preset) => (
        <button key={preset.value} type="button" onClick={() => onChoose(preset.value)}>
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button type="button" className="reset-button" onClick={onReset}>
      <RotateCcw aria-hidden="true" size={16} />
      Reset
    </button>
  );
}
