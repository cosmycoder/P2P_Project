import Delayed from './Delayed';
const result = new Array(24).fill(false);


const Board = ({size, table, setResult}) => {
    const rows = [];

    const handleClick = () => {
        const newResult = [...result]; // create a new instance to make the useffect trigger on the parent component
        setResult(newResult);
    };

    for (let i = 0; i < size; i++) {
        rows.push(<Row key={i.toString()} index={i} className="flex" size={size} handleTileClick={handleClick} rowNums={table[i]}/>);
    }
    return (
        <Delayed loadingMessage={'Sto creado la tua cartella!'} waitBeforeShow={1500}>
            <div className="flex flex-col gap-1 mb-5 mt-24">
                {rows}
            </div>
        </Delayed>
    );

};

const Row = ({size, rowNums, index, handleTileClick}) => {
    const items = [];
    let idx;
    for (let i = 0; i < size; i++) {
        idx = index*5 + i;
        items.push(<Tile key={i.toString()} className="flex" index={idx} handleTileClick={handleTileClick} number={rowNums[i]}/>);
    }
    return (
    <div className="flex flex-row gap-1">
         {items}
    </div>);

};

const Tile = ({number, handleTileClick, index}) => {
    return (
        <button
            className="h-16 w-16 lg:h-20 lg:w-20
                       border dark:text-white
                       text-black dark:border-gray-50
                       border-gray-700 rounded-md text-xl lg:text-3xl m-auto
                       hover:dark:bg-slate-800 hover:bg-slate-200"
            onClick={(event) => {
                let state;
                if (event.target.classList.contains('selected-number')) {
                    event.target.classList.remove('selected-number');
                    state = false;

                }
                else {
                    event.target.classList.add('selected-number');
                    state = true;
                }
                if (index === 12) {return;}
                else if (index < 12) {
                    result[index] = state;
                } else {
                    result[index-1] = state;
                }
                handleTileClick(result);

            }}

        >
                {number}
        </button>
    );
};

export default Board;
