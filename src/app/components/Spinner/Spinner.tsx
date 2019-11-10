import * as React from 'react'
import Spin from 'antd/lib/spin'
const style = require('./Spinner.scss')

class SpinnerC extends React.Component {
  public render() {
    return (
      <div className={style.Spinner}>
        <Spin size="large" />
      </div>
    )
  }
}

export const Spinner = SpinnerC
