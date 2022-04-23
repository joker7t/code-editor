import produce from 'immer';
import { Cell } from '../cell';
import { Action } from '../actions';
import { ActionType } from '../action-types';

interface CellState {
    loading: boolean;
    error: string | null;
    order: string[];
    data: {
        [key: string]: Cell;
    };
}

const initialState: CellState = {
    loading: false,
    error: null,
    order: ['1', '2'],
    data: {
        '1': {
            id: '1',
            type: 'code',
            content: 'const a = 1;'
        },
        '2': {
            id: '2',
            type: 'text',
            content: 'Click to edit'
        }
    }
};

const randomId = () => {
    return Math.random().toString(36).substring(2, 5);
};

const reducer = produce((state: CellState = initialState, action: Action): CellState => {
    switch (action.type) {
        case ActionType.MOVE_CELL:
            const { direction, id: payloadId } = action.payload;
            const index = state.order.findIndex((id) => id === payloadId);
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= state.order.length) {
                return state;
            }
            state.order[index] = state.order[targetIndex];
            state.order[targetIndex] = payloadId;
            return state;
        case ActionType.DELETE_CELL:
            delete state.data[action.payload];
            state.order = state.order.filter((id) => id !== action.payload);
            return state;
        case ActionType.INSERT_CELL_AFTER:
            const cell: Cell = {
                content: '',
                type: action.payload.type,
                id: randomId()
            };
            state.data[cell.id] = cell;
            const foundIndex = state.order.findIndex((id) => id === action.payload.id);

            if (foundIndex < 0) {
                state.order.unshift(cell.id);
            } else {
                state.order.splice(foundIndex + 1, 0, cell.id);
            }

            return state;
        case ActionType.UPDATE_CELL:
            const { id, content } = action.payload;
            state.data[id].content = content;
            return state;
        default:
            // All statements `return state;` for fixing issue that
            // Immer will mark state can be undefined if no returns
            return state;
    }
}, initialState);

export default reducer;