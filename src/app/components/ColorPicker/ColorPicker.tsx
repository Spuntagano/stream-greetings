import * as React from 'react'
import { SketchPicker } from 'react-color'
const style = require('./ColorPicker.scss')

interface IState {
    displayColorPicker: boolean
}

interface IProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    label?: string
    value: string
}

class ColorPickerC extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)

        this.state = {
            displayColorPicker: false
        }
    }

    private handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    }

    private handleClose = () => {
        this.setState({ displayColorPicker: false })
    }

    private handleChange = (color: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = this.props

        event.target.value = color.hex
        onChange(event)
    }

    public render() {
        const { value, label } = this.props

        return (
            <div className={`${style.colorPicker} clearfix`}>
                {label && <div className={style.label}>{label}</div>}
                <div className={style.swatch} onClick={this.handleClick}>
                    <div className={style.color} style={{backgroundColor: value}} />
                </div>
                {this.state.displayColorPicker ? <div className={style.popover}>
                    <div className={style.cover} onClick={this.handleClose} />
                    <SketchPicker color={value} onChange={this.handleChange} />
                </div> : null}
            </div>
        )
    }
}

export const ColorPicker = ColorPickerC as any
