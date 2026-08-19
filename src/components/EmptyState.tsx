import { Icon } from './Icons';

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }): React.JSX.Element {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
