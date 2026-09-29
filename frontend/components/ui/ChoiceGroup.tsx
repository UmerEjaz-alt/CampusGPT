import { useId } from 'react';
export default function ChoiceGroup<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  const id = useId();
  return <fieldset className="choice-field"><legend>{label}</legend><div className="choice-group">{options.map(option => <label key={option} className={option === value ? 'selected' : ''}><input type="radio" name={id} checked={option === value} onChange={() => onChange(option)} /><span>{option}</span></label>)}</div></fieldset>;
}

