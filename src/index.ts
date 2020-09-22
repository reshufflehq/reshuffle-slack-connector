import { Reshuffle, BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import SlackMessage from './SlackMessage'
import { WebClient } from '@slack/web-api'
import { App, ExpressReceiver } from '@slack/bolt'

// import { Router } from 'express'
// import { createMessageAdapter } from '@slack/interactive-messages'

export interface SlackConnectorConfigOptions {
  token: string
  signingSecret: string
  port: number
}

export interface SlackConnectorEventOptions {
  option1?: string
  // ...
}

export default class SlackConnector extends BaseConnector<
  SlackConnectorConfigOptions,
  SlackConnectorEventOptions
> {
  private slackApp: App
  private web: WebClient

  constructor(app: Reshuffle, options: SlackConnectorConfigOptions, id?: string) {
    super(app, options, id)
    this.web = new WebClient(options.token)
    this.slackApp = new App({
      token: options.token,
      signingSecret: options.signingSecret,
    })
    // ...
  }

  onStart(): void {
    this.slackApp
      .start(this.configOptions!.port)
      .then((res) => console.log('Slack Connector ready'))
  }

  onStop(): void {
    // If you need to do something specific on stop, otherwise remove this function
  }

  // Your events
  on(options: SlackConnectorEventOptions, handler: any, eventId: string): EventConfiguration {
    if (!eventId) {
      eventId = `Slack/${options.option1}/${this.id}`
    }
    const event = new EventConfiguration(eventId, this, options)
    this.eventConfigurations[event.id] = event

    this.app.when(event, handler)

    return event
  }

  // Action
  public async postMessage(
    channel: string,
    message: string | SlackMessage | any[] | ((msg: SlackMessage) => string | undefined),
  ): Promise<void> {
    let msg: string | SlackMessage
    if (typeof message === 'string' || message instanceof SlackMessage) {
      msg = message
    } else if (Array.isArray(message)) {
      msg = new SlackMessage(message)
    } else if (typeof message === 'function') {
      const m = new SlackMessage()
      const rv = message(m)
      msg = rv === undefined ? m : String(rv)
    } else {
      throw new Error(`Invalid message: ${message}`)
    }

    let payload: any = {}
    if (typeof msg === 'string') {
      payload = { text: msg, link_names: true }
    } else {
      payload = { blocks: msg.getBlocks() }
    }

    await this.web.chat.postMessage({ channel, ...payload })
  }
}

export { SlackConnector }
