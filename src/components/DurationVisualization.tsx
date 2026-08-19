import type { AgeBreakdown } from '../types/models';
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
      label: 'Years',
      value: result.years,
      weight: result.years * 365.2425,
    },
    {
      key: 'months',
      label: 'Months',
      value: result.months,
      weight: result.months * 30.436875,
    },
    {
      key: 'days',
      label: 'Days',
      value: result.days,
      weight: result.days,
    },
  ];
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const accessibleSummary = `${result.years} years, ${result.months} months, and ${result.days} days between ${startLabel} and ${endLabel}.`;

  return (
    <section className="panel duration-visualization" aria-labelledby="duration-visualization-title">
      <div>
        <p className="eyebrow">Visual breakdown</p>
        <h2 id="duration-visualization-title">Calendar duration timeline</h2>
      </div>

      <div className="duration-endpoints">
        <div className="duration-endpoint">
          <span>Earlier date</span>
          <strong>{startLabel}</strong>
        </div>
        <span className="duration-arrow" aria-hidden="true">
          →
        </span>
        <div className="duration-endpoint">
          <span>Later date</span>
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

      <div className="duration-legend" aria-label="Exact calendar components">
        {segments.map((segment) => (
          <div key={segment.key}>
            <span>{segment.label}</span>
            <strong>{segment.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>

      <p className="muted">
        The numbers are exact calendar components. Segment widths are only a visual approximation using
        average year and month lengths; total elapsed days remain exact.
      </p>
    </section>
  );
}
