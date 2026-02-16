export default function ErrorBox({ message = "An error occured", onRetry }) {
  return (
    <div className="error-box">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Try Again</button>}
    </div>
  );
}
