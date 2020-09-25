const ACTION_REGEX = /^[a-z0-9-]+$/

export default class SlackMessage {
  private blocks: any[]
  private actions: any[]

  constructor(blocks?: any[]) {
    this.blocks = blocks || []
    this.actions = []
  }

  private renderActions() {
    if (this.actions.length > 0) {
      this.blocks.push({
        type: 'actions',
        elements: this.actions,
      })
      this.actions = []
    }
  }

  public button(text: string, action: string, payload: any, style?: string) {
    if (!ACTION_REGEX.test(action)) {
      throw new Error(`Invalid action: ${action}`)
    }

    const btn: any = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      value: JSON.stringify({ action, payload }),
      action_id: `${action}_${text}`,
    }

    const st = typeof style === 'string' ? style.toLowerCase() : style
    if (st !== undefined && st !== 'primary' && st !== 'danger') {
      throw new Error(`Invalid button style: ${style}`)
    }
    if (st) {
      btn.style = st
    }

    this.actions.push(btn)
  }

  public link(text: string, url: string) {
    const btn: any = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      url,
    }

    this.actions.push(btn)
  }

  public dangerButton(text: string, action: string, payload: any) {
    this.button(text, action, payload, 'danger')
  }

  public primaryButton(text: string, action: string, payload: any) {
    this.button(text, action, payload, 'primary')
  }

  public divider() {
    this.renderActions()
    this.blocks.push({
      type: 'divider',
    })
  }

  public fields(...args: string[]) {
    this.renderActions()
    this.blocks.push({
      type: 'section',
      fields: args.map((e) => ({ type: 'mrkdwn', text: e })),
    })
  }

  public image(url: string, alt: string, title?: string) {
    this.renderActions()
    const img: any = {
      type: 'image',
      image_url: url,
      alt_text: alt,
    }
    if (title) {
      img.title = {
        type: 'plain_text',
        text: title,
      }
    }
    this.blocks.push(img)
  }

  public text(text: string) {
    this.renderActions()
    this.blocks.push({
      type: 'section',
      text: {
        type: 'plain_text',
        text,
      },
    })
  }

  public getBlocks(): any[] {
    this.renderActions()
    return [...this.blocks]
  }
}
