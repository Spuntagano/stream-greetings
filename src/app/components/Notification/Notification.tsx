// tslint:disable: max-line-length

import * as React from 'react'
import { INotification } from '../../redux/modules/notifications/notifications'
import { ISettings } from '../../redux/modules/settings/settings'
import { CensorSensor } from 'censor-sensor'

const style = require('./Notification.scss')

interface IProps {
  settings: ISettings
  notification: INotification
  display: boolean
}

class NotificationC extends React.Component<IProps> {
  private censor: CensorSensor

  constructor(props: IProps) {
    super(props)

    this.censor = new CensorSensor()
    this.censor.enableTier(1)
  }

  private encodeHTML(s: string) {
    return s.replace(/&/g, '&amp').replace(/</g, '&lt').replace(/"/g, '&quot')
}

  public render() {
    const { settings, notification, display } = this.props

    let username = ''
    let message = ''
    let messageTemplate = ''
    if (notification) {
      username = notification.username
      message = notification.chatter.firstChatMessage || ''

      if (settings.profanityFilter) {
        username = this.censor.cleanProfanity(username)
        message = this.censor.cleanProfanity(message)
      }

      switch (notification.type) {
        case 'JOIN':
          messageTemplate = settings.firstJoinedMessageTemplate
          break
        case 'MESSAGE':
          messageTemplate = settings.firstMessageMessageTemplate
          break
      }
    }

    return (
      <div className={style.notification}>
        <div className={(display) ? style.sourceMessage : `${style.sourceMessage} ${style.sourceHide}`} style={{
            fontSize: settings.fontSize,
            fontWeight: settings.fontWeight,
            lineHeight: settings.lineHeight,
            color: settings.primaryColor,
            fontFamily: settings.fontFamily
          }}>
          {notification && settings.showImage && <img src={`${(settings.notificationImageUrl) ? settings.notificationImageUrl : 'assets/images/default.png'}`} />}
          {notification && messageTemplate &&
            <div dangerouslySetInnerHTML={{__html: this.encodeHTML(messageTemplate)
              .replace('{username}', `<span style="color: ${settings.secondaryColor}">${this.encodeHTML(username)}</span>`)
              .replace('{message}', this.encodeHTML(message))}} />}
        </div>
      </div>
    )
  }
}

export const Notification = NotificationC as any
