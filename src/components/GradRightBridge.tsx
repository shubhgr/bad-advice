"use client";

interface GradRightBridgeProps {
  onContinue: () => void;
}

const OFFERS = [
  { id: "programs", label: "Online Programs" },
  { id: "outcomes", label: "Career Outcomes" },
  { id: "guidance", label: "Guidance" },
] as const;

const AUDIENCES = [
  {
    id: "working",
    icon: "work",
    lines: ["Working", "Professionals"],
  },
  {
    id: "switchers",
    icon: "school",
    lines: ["Career", "Switchers"],
  },
  {
    id: "founders",
    icon: "rocket_launch",
    lines: ["Entrepreneurs", "Freelancers"],
  },
  {
    id: "rebooters",
    icon: "person",
    lines: ["Career", "Rebooters"],
  },
] as const;

export default function GradRightBridge({ onContinue }: GradRightBridgeProps) {
  return (
    <div className="bridge-screen animate-fade-in">
      <header className="bridge-hero">
        <h2 className="bridge-headline">
          <span className="bridge-headline-struck">
            Bad advice can be funny.
          </span>
          <span className="bridge-headline-line">
            The wrong career move{" "}
            <span className="bridge-headline-emphasis">isn&apos;t</span>.
          </span>
        </h2>
        <p className="bridge-body">
          That&apos;s why GradRight exists. To help you choose the right online
          programs and future proof your career.
        </p>
      </header>

      <section className="bridge-section bridge-section-offers" aria-labelledby="bridge-offers-title">
        <h3 id="bridge-offers-title" className="bridge-section-title">
          With GradRight you get
        </h3>
        <div className="bridge-offers" role="list">
          {OFFERS.map((offer) => (
            <div key={offer.id} className="bridge-offer" role="listitem">
              <span className="bridge-offer-label">{offer.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="bridge-section bridge-section-audience"
        aria-labelledby="bridge-audience-title"
      >
        <h3 id="bridge-audience-title" className="bridge-section-title">
          For professionals at every stage
        </h3>
        <div className="bridge-audiences">
          {AUDIENCES.map(({ id, icon, lines }) => (
            <div key={id} className="bridge-audience">
              <span
                className="material-symbols-outlined bridge-audience-icon"
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="bridge-audience-label">
                {lines[0]}
                <br />
                {lines[1]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bridge-cta-block">
        <p className="bridge-cta-line">
          We&apos;ll help you get there{" "}
          <span className="bridge-cta-emphasis">correctly</span>.
        </p>
        <button type="button" onClick={onContinue} className="btn-accent">
          Show Me Good Advice
        </button>
      </footer>
    </div>
  );
}
