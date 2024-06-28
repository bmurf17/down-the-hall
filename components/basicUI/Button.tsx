interface Prop {
  text: string;
  handleClick: () => void;
  styles: string;
}

export default function Button({ text, handleClick, styles }: Prop) {
  return (
    <button
      onClick={handleClick}
      className={`${styles}`}>
      <span>{text}</span>
    </button>
  );
}
