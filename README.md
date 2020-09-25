## Reshuffle Slack Connector

`npm install reshuffle-slack-connector`

_Commonjs_: `const { SlackConnector } = require('reshuffle-slack-connector')`

_ES6 import_: `import { SlackConnector } from 'reshuffle-slack-connector'` 

Interact with Slack

The connector is designed to work with Slack and allow you to post messages directly into Slack.

To create a Slack connector, you need to provide configuration options like this:
```ts
export interface SlackConnectorConfigOptions {
  token: string
  signingSecret: string
  port?: number
}
```

Create a new Slack Connector:
```ts
const app = new Reshuffle()
const slackConnector = new SlackConnector(app, {
token: '<starts with xox>',
signingSecret: '<signing_secret>',
port: '<slack_app_port>',
})
```


_Events_:

*[event](#event) Listening to Slack events such as new messages or new users joining

_Actions_:

*[postMessage](#postMessage) Post a text message to a specified Slack channel or conversation.

*[scheduleMessage](#scheduleMessage) Schedule a text message to be posted on a specified Slack channel or conversation at a given time.

*[updateMessage](#updateMessage) Update an existing Slack message.

*[deleteMessage](#deleteMessage) Delete an existing Slack message.

*[searchMessages](#searchMessages) Search Slack for a message matching a specified query string.

### Connector Events

##### Listening to Slack event

To listen to any kind of events happening in Slack, 
use type `SlackEventType.EVENT` as event option (see example below)
As event option values, pass the Slack Event API type (e.g. 'message') for firing an event on a new message.

['Full list of Slack Event API type'](https://api.slack.com/events)

Your handler receives an event object with an attribute context.
Example of event.context:
```ts
{
  payload: {
    client_msg_id: "d1f6d102-69a6-49a0-aa35-f6a9f4ffcf04"
    type: "message"
    text: "my message in Slack"
    user: "U01APN2NLVD"
    ts: "1601003324.000400"
    team: "T01B4LHKJ3D"
    channel: "C01AXNBH0QN"
    event_ts: "1601003324.000400"
    channel_type: "channel"
  },
  say: SayFn,
  context: {
    botToken: "xoxb-..."
    botUserId: "U01BU9WD5S4"
    botId: "B01BAL52SP6"
  },
  client: WebClient
}
```

###### Example
```js
const slackConnector = new SlackConnector(app, {
token: '<starts with xox>',
signingSecret: '<signing_secret>',
port: '<slack_app_port>',
})

// Events
slackConnector.on(
{
  type: SlackEventType.EVENT,
  values: {
    type: SlackEvents.MESSAGE,
  },
},
(event) => {
  console.log('new message posted on Slack')
  console.log(JSON.stringify(event.context))
},
)

app.start()
```

To listen to any kind of events happening in Slack, 
use type `SlackEventType.EVENT` as event option (see example below)
As event option values, pass the Slack Event API type (e.g. 'message') for firing an event on a new message.

['Full list of Slack Event API type'](https://api.slack.com/events)

###### Example
```js
const slackConnector = new SlackConnector(app, {
token: '<starts with xox>',
signingSecret: '<signing_secret>',
port: '<slack_app_port>',
})

// Events
slackConnector.on(
{
  type: SlackEventType.EVENT,
  values: {
    type: SlackEvents.MESSAGE,
  },
},
(event) => {
  console.log('new message posted on Slack')
  console.log(JSON.stringify(event.context))
},
)

app.start()
```

### Connector actions

#### <a name="postMessage"></a>Post a message to Slack

[Slack Documentation 'chat.postMessage'](https://api.slack.com/methods/chat.postMessage)

_Required Slack Permissions:_

**bot**: `chat:write` 

_Definition:_

```
(
  channelId: string,
  text: string,
  msgOptions?: MsgOpts,
) => WebAPICallResult
```

*MsgOpts*

```
{
  as_user?: boolean;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  icon_emoji?: string; // if specified, as_user must be false
  icon_url?: string;
  link_names?: boolean;
  mrkdwn?: boolean;
  parse?: 'full' | 'none';
  reply_broadcast?: boolean; // if specified, thread_ts must be set
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  username?: string; // if specified, as_user must be false
}
```

_Usage:_

```js
await slackConnector.postMessage('<channel_id>', 'Some message!', { mrkdwn: true })
```

#### <a name="scheduleMessage"></a>Schedule a message to post on Slack

[Slack Documentation 'chat.scheduleMessage'](https://api.slack.com/methods/chat.scheduleMessage)

_Required Slack Permissions:_

**bot**: `chat:write` 

_Definition:_

```
(
  channelId: string,
  postAt: Date,
  text: string,
) => WebAPICallResult
```

*ScheduleMsgOpts*

```
{
  as_user?: boolean;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  link_names?: boolean;
  parse?: 'full' | 'none';
  reply_broadcast?: boolean; // if specified, thread_ts must be set
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
}
```

_Usage:_

```js
await slackConnector.scheduleMessage(
    '<channel_id>',
    new Date(Date.now() + 10000), // 10 seconds from current time
    'Scheduled message!',
    { mrkdwn: true },
  )
```

#### <a name="updateMessage"></a>Update an existing Slack message

[Slack Documentation 'chat.update'](https://api.slack.com/methods/chat.update)

_Required Slack Permissions:_

**bot**: `chat:write` 

_Definition:_

```
(
  channelId: string,
  text: string,
  timestamp: string,
  msgOptions?: MsgOpts,
) => WebAPICallResult
```

*MsgOpts*

```
{
  as_user?: boolean;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  icon_emoji?: string; // if specified, as_user must be false
  icon_url?: string;
  link_names?: boolean;
  mrkdwn?: boolean;
  parse?: 'full' | 'none';
  reply_broadcast?: boolean; // if specified, thread_ts must be set
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  username?: string; // if specified, as_user must be false
}
```

_Usage:_

```js
await slackConnector.updateMessage(
  '<channel_id>',
  'Some message!',
  '1405894322.002768',
  { mrkdwn: true },
)
```

#### <a name="deleteMessage"></a>Delete an existing Slack message

[Slack Documentation 'chat.delete'](https://api.slack.com/methods/chat.delete)

_Required Slack Permissions:_

**bot**: `chat:write` 

_Definition:_

```
(channelId: string, timestamp: string) => WebAPICallResult
```

_Usage:_

```js
await slackConnector.deleteMessage(
  '<channel_id>',
  '1405894322.002768',
)
```

#### <a name="searchMessages"></a>Search through messages on Slack

[Slack Documentation 'search.messages'](https://api.slack.com/methods/search.messages)

_Required Slack Permissions:_

**user**: `search:read`

Multiple messages will be returned in the case that multiple matches
are found for your given query.

_Definition:_

```
(query: string) => WebAPICallResult
```

_Usage:_

```js
await slackConnector.searchMessages('some text to look for')
```

## API definitions

[Definition of
WebAPICallResult](https://github.com/slackapi/node-slack-sdk/blob/aa269d160f10b3414812ee335b1dfa961d214c77/packages/web-api/src/WebClient.ts#L874)

More examples on how to use this connector can be [found here](https://github.com/reshufflehq/reshuffle/blob/master/examples/message/SlackMessageExample.js).