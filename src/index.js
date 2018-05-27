import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, connect} from 'react-redux';
import {createStore} from 'redux';

import '../node_modules/bootstrap/dist/css/bootstrap.css';

const Heading = () => (
    <h3>Heading Widget</h3>
);
const Link = () => (
    <h3>Image Widget</h3>
);
const Image = () => (
    <h3>Image Widget</h3>
);
const Paragraph = () => (
    <h3>Paragraph Widget</h3>
);
const List = () => (
    <h3>List Widget</h3>
);

const Widget = ({item: widget, dispatch}) => {
    let select
    return(
        <li key={widget.id} className="pannel pannel-light border border-dark p-3 mb-1">
            <span className={"col-2"}>Id: {widget.id}</span>
            <h2 className={"col-5 float-left"}>{widget.name}</h2>
            <button className={"btn btn-danger float-right"}
                    onClick={e => (
                        dispatch({type: 'DELETE_WIDGET', id: widget.id})
                    )}>
                Delete
            </button>
            <select className={"col-3 float-right p-2 mr-2"}
                    value={widget.style}
                    onChange={e => (
                        dispatch({
                            type: 'SELECT_WIDGET_TYPE',
                            style: select.value,
                            id: widget.id
                        })
                    )}
                    ref={node => select = node}>
                <option>Heading</option>
                <option>Link</option>
                <option>Image</option>
                <option>Paragraph</option>
                <option>List</option>
            </select>
            <div>
                {widget.style === 'Heading' && <Heading/>}
                {widget.style === 'Link' && <Link/>}
                {widget.style === 'Image' && <Image/>}
                {widget.style === 'Paragraph' && <Paragraph/>}
                {widget.style === 'List' && <List/>}
            </div>
        </li>
    )
};

const ListWidget = connect()(Widget);

const findAllWidgets = dispatch => {
    fetch('http://localhost:8080/api/widget')
        .then(response => (response.json()))
        .then(widgets => dispatch({type: 'FIND_ALL_WIDGETS', widgets: widgets}))
};

const addWidget = dispatch => {
    dispatch({type: 'ADD_WIDGET', name: 'New Widget', style: 'Paragraph'})
};

const save = dispatch => {
    dispatch({type: 'SAVE_WIDGETS'})
};

class ListEditor extends React.Component {
    constructor(props) {
        super(props);
        this.props.findAllWidgets()
    }
    render() {
        return (
            <div className="container">
                <h1 className={"pb-4"}>List Editor ({this.props.widgets.length})</h1>
                <button className={"btn btn-primary"}
                        onClick={this.props.save}>Save</button>
                <ul type="none" className={"p-4"}>
                    {this.props.widgets.map(widget => (
                        <ListWidget key={widget.id} item={widget}/>
                    ))}
                </ul>
                <button className={"btn btn-success"}
                        onClick={this.props.addWidget}>Add Widget
                </button>
            </div>
        )
    }
}

let id = 2;
let initialState = {
    widgets: [
        {name: 'Widget 1', id: 0, style: 'Heading'},
        {name: 'Widget 2', id: 1, style: 'List'},
        {name: 'Widget 3', id: 3, style: 'Paragraph'}
    ]
};
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FIND_ALL_WIDGETS':
            return {
                widgets: action.widgets
            };
        case 'SAVE_WIDGETS':
            fetch('http://localhost:8080/api/widget/save', {
                method: 'post',
                body: JSON.stringify(state.widgets),
                headers: {
                    'content-type': 'application/json'
                }
            });
        case 'SELECT_WIDGET_TYPE':
            console.log(action.style);
            state.widgets = state.widgets.map(widget => (
                widget.id === action.id ? {
                    id: widget.id,
                    style: action.style,
                    name: widget.name
                }: widget
            ));
            return JSON.parse(JSON.stringify(state));
        case 'SET_TITLE':
            console.log(action.name);
            return {
                widgets: state.widgets,
                name: action.name
            };
        case 'ADD_WIDGET':
            return {widgets:
                    [
                        ...state.widgets,
                        { name: action.name,
                            id: id++,
                            style: action.style
                        }
                    ]
            };
        case 'DELETE_WIDGET':
            return {
                widgets: state.widgets.filter(widget => (widget.id != action.id))
            };
        default:
            return state
    }
};
const stateToPropsMapper = (state) => (
    {widgets: state.widgets, name: state.name}
);
const dispatcherToPropsMapper = dispatch => ({
    save: () => save(dispatch),
    findAllWidgets: () => findAllWidgets(dispatch),
    addWidget: () => addWidget(dispatch)
});
const App = connect(stateToPropsMapper, dispatcherToPropsMapper)(ListEditor);
const store = createStore(reducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);