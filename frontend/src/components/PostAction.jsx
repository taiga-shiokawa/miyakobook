export default function PostAction({ icon, text, onClick }) {
  return (
    <button
      className="flex items-center space-x-1 text-info hover:text-primary"
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span>
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
}
