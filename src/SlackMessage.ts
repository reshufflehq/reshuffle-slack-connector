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

  public button(caption: string, action: string, payload: any, style?: string) {
    if (!ACTION_REGEX.test(action)) {
      throw new Error(`Invalid action: ${action}`)
    }

    const btn: any = {
      type: 'button',
      text: {
        type: 'plain_text',
        caption,
      },
      value: JSON.stringify({ action, payload }),
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

  public markdown(md: string) {
    this.renderActions()
    this.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: md,
      },
    })
  }

  public plainText(text: string) {
    this.renderActions()
    this.blocks.push({
      type: 'section',
      text: {
        type: 'plain_text',
        text,
      },
    })
  }

  public text(text: string) {
    return this.markdown(text)
  }

  public getBlocks(): any[] {
    this.renderActions()
    return [...this.blocks]
  }
}
