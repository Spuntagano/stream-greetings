import * as React from 'react'
import { Link, withRouter as router } from 'react-router-dom'
import Menu from 'antd/lib/menu'
import { RouteComponentProps } from 'react-router'
import _ from 'lodash'

const style = require('./Navigation.scss')

interface IProps {
  className?: string
}

class NavigationC extends React.Component<IProps & RouteComponentProps> {
  public render() {
    const { location, className } = this.props

    return (
      <div className={`${style.Navigation} ${className}`}>
        <Menu selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/dashboard">
            <Link to={{
              pathname: '/dashboard',
              search: location.search
            }}>Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/settings">
            <Link to={{
              pathname: '/settings',
              search: location.search
            }}>Settings</Link>
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export const Navigation = router(NavigationC) as any
