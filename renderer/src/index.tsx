import { ipcRenderer } from 'electron'
import * as React from 'react'
import { render } from 'react-dom'
import { style, classes } from 'typestyle'
import { px } from 'csx'

type Status = 'ON' | 'OFF'

let status: Status = 'ON'

const switchStatus = () => {
  console.log('switchStatus')
  status = status === 'ON' ? 'OFF' : 'ON'
  ipcRenderer.send('SET_STATUS', status)
  renderApp()
}

const StatusDotStyle = style({
  margin: '76px auto',
  boxShadow: '0 4px 11px rgba(0, 0, 0, 0.1)',
  backgroundColor: 'red',
  width: px(42),
  height: px(42),
  borderRadius: px(42),
  transitionDuration: '0.3s',
  $nest: {
    '&.ON': {
      backgroundColor: '#27d882'
    },
    '&.OFF': {
      backgroundColor: '#db4015'
    }
  }
})

type StatusDotProps = {
  status: Status
}

const StatusDot = (props: StatusDotProps) => (
  <div
    onClick={switchStatus}
    className={classes(StatusDotStyle, props.status)}
  />
)

const container = document.getElementById('app')

const renderApp = () => {
  render(<StatusDot status={status} />, container)
}

renderApp()
