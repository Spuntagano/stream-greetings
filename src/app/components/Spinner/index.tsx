import * as React from 'react';
const style = require('./style.scss');

const Spinner: React.SFC = () => {
  return (
    <div className={style.Spinner}>
        <div /><div /><div /><div />
    </div>
  );
};

export { Spinner };
