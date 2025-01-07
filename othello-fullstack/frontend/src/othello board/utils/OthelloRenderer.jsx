
function OthelloRenderer({ className , row, column, rowClassName, columnClassName }) {
  return (
    <div className={`${className} shake-effect`}>
      {Array(row).fill().map((_, i) => (
        <ul data-row={i} className={rowClassName} key={i}>
          {Array(column).fill().map((_, j) => (
            <li data-row={i} data-column={j} className={columnClassName} key={j}></li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default OthelloRenderer;
