import type { ReactNode } from "react";

type TraceSectionCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function TraceSectionCard({
  title,
  subtitle,
  children,
}: TraceSectionCardProps) {
  return (
    <section className="trace-card">
      <div className="trace-card-header">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="trace-card-body">{children}</div>
    </section>
  );
}