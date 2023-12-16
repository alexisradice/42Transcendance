import classes from './ErrorDisplay.module.css';

type Props = {
  status?: {
    code: number;
    text: string;
  }
  message?: string;
}

const ErrorDisplay = ({ status, message }: Props) => {
  return (
    <div id="error-page" className={classes.message}>
      <h1>Oops!</h1>
      <h3>Sorry, an error has occurred.</h3>
      {status && (
        <p className={classes.status}>
          <i>{status.code} {status.text}</i>
        </p>
      )}
      {message && (
        <p>
          <i>{message}</i>
        </p>
      )}
    </div>
  );
};

export default ErrorDisplay;
