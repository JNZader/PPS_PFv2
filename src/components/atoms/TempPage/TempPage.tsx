interface TempPageProps {
  title: string;
}

export const TempPage = ({ title }: TempPageProps) => (
  <div
    style={{
      padding: '2rem',
      textAlign: 'center',
      color: 'var(--text-secondary)',
    }}
  >
    <h1
      style={{
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}
    >
      {title}
    </h1>
    <p>Esta página estará disponible en la próxima iteración.</p>
  </div>
);
