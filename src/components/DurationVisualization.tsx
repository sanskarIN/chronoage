import type { AgeBreakdown } from '../types/models';
import { en } from '../i18n/en';
import './DurationVisualization.css';

interface Props {
  result: AgeBreakdown;
  startLabel: string;
  endLabel: string;
}

interface Segment {
  key: 'years' | 'months' | 'days';
  label: string;
  value: number;
  weight: number;
}

export function DurationVisualization({ result, startLabel, endLabel }: Props): React.JSX.Element {
  const segments: Segment[] = [
    {
      key: 'years',
      label: en.duration.years,
      value: result.years,
      weight: result.years * 365.2425,
    },
    {
      key: 'months',
      label: en.duration.months,
      value: result.months,
      weight: result.months * 30.436875,
    },
    {
      key: 'days',
      label: en.duration.days,
      value: result.days,
      weight: result.days,
    },
  ];
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const accessibleSummary = en.duration.summary(
    result.years,
    result.months,
    result.days,
    startLabel,
    endLabel,
  );

  return (
    <section className="panel duration-visualization" aria-labelledby="duration-visualization-title">
      <div>
        <p className="eyebrow">{en.duration.eyebrow}</p>
        <h2 id="duration-visualization-title">{en.duration.title}</h2>
      </div>

      <div className="duration-endpoints">
        <div className="duration-endpoint">
          <span>{en.duration.earlierDate}</span>
          <strong>{startLabel}</strong>
        </div>
        <span className="duration-arrow" aria-hidden="true">
          →
        </span>
        <div className="duration-endpoint">
          <span>{en.duration.laterDate}</span>
          <strong>{endLabel}</strong>
        </div>
      </div>

      <div className="duration-track" role="img" aria-label={accessibleSummary}>
        {visibleSegments.length > 0 ? (
          visibleSegments.map((segment) => (
            <span
              key={segment.key}
              className="duration-segment"
              style={{ flexGrow: segment.weight }}
              aria-hidden="true"
            />
          ))
        ) : (
          <span className="duration-segment" style={{ flexGrow: 1 }} aria-hidden="true" />
        )}
      </div>

      <div className="duration-legend" aria-label={en.duration.exactComponents}>
        {segments.map((segment) => (
          <div key={segment.key}>
            <span>{segment.label}</span>
            <strong>{segment.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <p className="muted">{en.duration.approximationNote}</p>
    </section>
  );
}
