import { Reshuffle, BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import SlackMessage from './SlackMessage'
import {
  ChatScheduleMessageArguments,
  ChatUpdateArguments,
  WebAPICallResult,
  WebClient,
} from '@slack/web-api'
import { App, ExpressReceiver } from '@slack/bolt'
import { SlackEvents } from './SlackEvents'

export enum SlackEventType {
  MESSAGE = 'message',
  COMMAND = 'command',
  EVENT = 'event',
  ACTION = 'action',
}

export interface SlackConnectorConfigOptions {
  token: string
  signingSecret: string
  port?: number
  endpoints?:
    | string
    | {
        [endpointType: string]: string
      }
}

export interface SlackConnectorEventOptions {
  type: SlackEventType
  values: { [key: string]: string }
}

export default class SlackConnector extends BaseConnector<
  SlackConnectorConfigOptions,
  SlackConnectorEventOptions
> {
  private readonly receiver: ExpressReceiver
  private readonly slackApp: App
  private readonly webClient: WebClient

  constructor(app: Reshuffle, options: SlackConnectorConfigOptions, id?: string) {
    options.port = options.port || 3000
    super(app, options, id)
    this.webClient = new WebClient(options.token)
    this.receiver = new ExpressReceiver({
      signingSecret: options.signingSecret,
      endpoints: options.endpoints || '/',
    })
    this.slackApp = new App({
      token: options.token,
      receiver: this.receiver,
    })
  }

  onStart(): void {
    this.slackApp.start(this.configOptions?.port).then(() => {
      this.app
        .getLogger()
        .info(`Slack Connector - Slack app running on port ${this.configOptions?.port}`)

      this.setupEventEmitters()
    })
  }

  onStop(): void {
    this.slackApp.stop()
  }

  setupEventEmitters(): void {
    Object.values(this.eventConfigurations).forEach((event) => {
      const options = event.options as SlackConnectorEventOptions
      switch (options.type) {
        case SlackEventType.EVENT: {
          const eventType = options.values.type
          this.slackApp.event(eventType, async (slackEvent) => {
            await this.app.handleEvent(event.id, {
              ...event,
              ...slackEvent,
            })
          })
          break
        }
      }
    })
  }

  on(options: SlackConnectorEventOptions, handler: any, eventId: string): EventConfiguration {
    if (!eventId) {
      eventId = `Slack/${options.type}/${this.id}`
    }
    const event = new EventConfiguration(eventId, this, options)
    this.eventConfigurations[event.id] = event

    this.app.when(event, handler)

    return event
  }

  public async postMessage(
    channel: string,
    message:
      | string
      | SlackMessage
      | Array<SlackMessage | string>
      | ((msg: SlackMessage) => string | undefined),
  ): Promise<WebAPICallResult | void> {
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

    try {
      const payload =
        typeof msg === 'string'
          ? { text: msg, link_names: true }
          : { text: '', blocks: msg.getBlocks() }

      const response = await this.webClient.chat.postMessage({ channel, ...payload })

      this.app
        .getLogger()
        .info(`Slack Connector - Successfully send message ${response.ts} in channel ${channel}`)

      return response
    } catch (err) {
      this.app.getLogger().error(`Slack Connector - postMessage error to channel ${channel}: ${err}`)
    }
  }

  public updateMessage(
    channelId: string,
    text: string,
    timestamp: string,
    msgOptions?: ChatUpdateArguments,
  ): Promise<WebAPICallResult> {
    return this.slackApp.client.chat.update({
      token: this.configOptions?.token,
      ts: timestamp,
      channel: channelId,
      text: text,
      ...msgOptions,
    })
  }

  public deleteMessage(channelId: string, timestamp: string): Promise<WebAPICallResult> {
    return this.webClient.chat.delete({
      ts: timestamp,
      channel: channelId,
    })
  }

  public scheduleMessage(
    channel: string,
    postAt: Date,
    text: string,
    msgOptions?: ChatScheduleMessageArguments,
  ): Promise<WebAPICallResult> {
    const toUnix = postAt.getTime() / 1000
    return this.webClient.chat.scheduleMessage({
      post_at: toUnix.toString(),
      channel,
      text,
      ...msgOptions,
    })
  }

  public searchMessages(query: string): Promise<WebAPICallResult> {
    return this.slackApp.client.search.messages({
      token: this.configOptions?.token,
      query,
      sort: 'score',
      sort_dir: 'asc',
    })
  }

  public getWebClient(): WebClient {
    return this.webClient
  }

  public getSlackApp(): App {
    return this.slackApp
  }

  public sdk(): { slackApp: App; webClient: WebClient } {
    return {
      slackApp: this.getSlackApp(),
      webClient: this.getWebClient(),
    }
  }
}

export { SlackConnector, SlackMessage, SlackEvents }
